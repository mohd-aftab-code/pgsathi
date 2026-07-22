/**
 * lib/geo.ts
 * Server-side location helpers for the listing flow.
 *
 * Everything geo happens here rather than in the browser because:
 *  - Nominatim requires an identifying User-Agent, which browsers can't set
 *  - the PIN → city mapping decides whether a listing can be saved at all, so
 *    it must not depend on the client getting it right
 */
import "server-only";
import { db } from "@/lib/db";
import slugify from "slugify";

export type PostOffice = { Name: string; District: string; State: string; BranchType?: string };

/** India Post's official PIN directory — authoritative for Indian pincodes. */
export async function lookupIndiaPost(pin: string): Promise<PostOffice[] | null> {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 * 30 }, // PIN → area mapping barely changes
    });
    if (!res.ok) return null;
    const json = await res.json();
    const entry = Array.isArray(json) ? json[0] : null;
    if (!entry || entry.Status !== "Success" || !Array.isArray(entry.PostOffice)) return null;
    return entry.PostOffice as PostOffice[];
  } catch {
    return null;
  }
}

/** PIN → coordinates + a second opinion on city/state when India Post is throttled. */
export async function lookupPinGeo(
  pin: string
): Promise<{ lat: number; lng: number; district?: string; state?: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${pin}&country=India&format=json&limit=1&addressdetails=1`,
      {
        signal: AbortSignal.timeout(7000),
        headers: { "User-Agent": "PGSathi/1.0 (listing-form)", "Accept-Language": "en" },
        next: { revalidate: 60 * 60 * 24 * 30 },
      }
    );
    if (!res.ok) return null;
    const hit = (await res.json())?.[0];
    if (!hit) return null;
    const a = hit.address || {};
    return {
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      district: a.city || a.state_district || a.county || a.town || undefined,
      state: a.state || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Free-text address → coordinates. Tries the full address first, then falls back
 * to progressively coarser queries so a typo in the street still lands the pin
 * in the right town rather than failing outright.
 */
export async function geocodeAddress(parts: {
  address?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
}): Promise<{ lat: number; lng: number; label: string; precision: "exact" | "area" | "city" } | null> {
  const { address, area, city, state, pincode } = parts;
  // Ordered most specific → least. Which one hits tells us how much to trust the
  // pin, which the form shows to the owner so a coarse match isn't mistaken for
  // their doorstep.
  const attempts = (
    [
      { q: [address, area, city, state, pincode].filter(Boolean).join(", "), precision: "exact" },
      { q: [area, city, state, pincode].filter(Boolean).join(", "), precision: "area" },
      { q: [city, state, pincode].filter(Boolean).join(", "), precision: "city" },
      { q: [pincode, city].filter(Boolean).join(", "), precision: "city" },
    ] as const
  ).filter((a) => a.q && a.q.length > 3);

  for (const { q, precision } of attempts) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${q}, India`)}&format=json&limit=1&addressdetails=1`,
        {
          signal: AbortSignal.timeout(7000),
          headers: { "User-Agent": "PGSathi/1.0 (listing-form)", "Accept-Language": "en" },
          next: { revalidate: 60 * 60 * 24 * 7 },
        }
      );
      if (!res.ok) continue;
      const hit = (await res.json())?.[0];
      if (hit) {
        // Nominatim can answer a street query with the whole city; trust its own
        // classification over which query happened to match.
        const t = String(hit.addresstype ?? hit.type ?? "");
        const coarse = ["city", "town", "state", "state_district", "county", "administrative"].includes(t);
        return {
          lat: parseFloat(hit.lat),
          lng: parseFloat(hit.lon),
          label: hit.display_name,
          precision: coarse && precision === "exact" ? "city" : precision,
        };
      }
    } catch {
      // try the next, coarser query
    }
  }
  return null;
}

/**
 * Find-or-create the City row for a listing.
 *
 * The PIN code is trusted first (name comes from India Post, not the user).
 * The typed city/state are only used when every geo lookup fails — without that
 * last resort an outage would once again block owners from registering at all.
 */
export async function resolveCity(input: {
  pincode?: string;
  cityName?: string;
  stateName?: string;
}): Promise<{ id: number; name: string; state: string } | null> {
  let district = "";
  let state = "";

  const pin = (input.pincode ?? "").replace(/\D/g, "");
  if (pin.length === 6) {
    const [offices, geo] = await Promise.all([lookupIndiaPost(pin), lookupPinGeo(pin)]);
    district = offices?.[0]?.District?.trim() || geo?.district?.trim() || "";
    state = offices?.[0]?.State?.trim() || geo?.state?.trim() || "";
  }

  if (!district) {
    district = (input.cityName ?? "").trim();
    state = (input.stateName ?? "").trim() || state;
  }
  if (!district) return null;

  const existing = await db.city.findFirst({
    where: { name: { equals: district, mode: "insensitive" } },
    select: { id: true, name: true, state: true },
  });
  if (existing) return existing;

  // A few district names repeat across states (Aurangabad MH / BR), so fall back
  // to a state-qualified slug when the plain one is already taken.
  const baseSlug = slugify(district, { lower: true, strict: true });
  const taken = await db.city.findUnique({ where: { slug: baseSlug }, select: { id: true } });
  const slug = taken ? slugify(`${district}-${state || "in"}`, { lower: true, strict: true }) : baseSlug;

  return db.city.create({
    data: {
      name: district,
      state: state || "India",
      slug,
      isActive: true,
      priority: 99, // auto-added cities sort after the curated ones
    },
    select: { id: true, name: true, state: true },
  });
}
