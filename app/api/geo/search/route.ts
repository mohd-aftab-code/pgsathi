/**
 * app/api/geo/search/route.ts
 * GET ?q=…&near=lat,lng — place search for the map picker.
 *
 * WHY THIS EXISTS: the map used to call nominatim.openstreetmap.org directly
 * from the browser. Two things went wrong with that:
 *
 *  1. Nominatim's usage policy does not allow browser apps. Requests arrive with
 *     no identifying User-Agent and get throttled or dropped, which is what made
 *     the search box hang.
 *  2. Nominatim matches addresses, not names. Typing an Indian locality, market
 *     or building name usually returned nothing, so only the PIN/area lookup
 *     ever seemed to work.
 *
 * Going through the server fixes both: we can send the User-Agent Nominatim
 * requires, cache repeats, and put Photon in front — Photon is built for
 * as-you-type search and matches partial place names, which is exactly the
 * "type the name of a place" case that was failing.
 *
 * `near` biases results to the PIN code the user already entered, so a common
 * name resolves to the one in their town rather than the largest one in India.
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const UA = "PGSathi/1.0 (https://pgsathi.in; support@pgsathi.in)";
const TIMEOUT_MS = 6000;

export type GeoHit = {
  label: string;
  lat: number;
  lng: number;
  source: "photon" | "nominatim";
};

/** In-memory cache. Same query typed twice never leaves the server again. */
const cache = new Map<string, { at: number; hits: GeoHit[] }>();
const CACHE_MS = 10 * 60 * 1000;
const CACHE_MAX = 500;

async function fetchJson(url: string): Promise<any | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": UA, "Accept-Language": "en", Accept: "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // timeout or network — the caller falls back
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Photon (Komoot) — free, no API key, autocomplete-oriented. Handles partial
 * and misspelt names far better than Nominatim, which is the whole point here.
 */
async function searchPhoton(q: string, near: { lat: number; lng: number } | null): Promise<GeoHit[]> {
  const params = new URLSearchParams({ q, limit: "8", lang: "en" });
  if (near) {
    params.set("lat", String(near.lat));
    params.set("lon", String(near.lng));
    // Weight distance heavily so a nearby match beats a bigger far-away one.
    params.set("location_bias_scale", "0.8");
    params.set("zoom", "12");
  }
  const data = await fetchJson(`https://photon.komoot.io/api/?${params}`);
  const feats: any[] = data?.features ?? [];

  return feats
    .filter((f) => f?.properties?.countrycode === "IN" && Array.isArray(f?.geometry?.coordinates))
    .map((f) => {
      const p = f.properties;
      // Build a human label: name first, then the places that disambiguate it.
      const label = [p.name, p.street, p.district, p.city || p.county, p.state, p.postcode]
        .filter(Boolean)
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .join(", ");
      return {
        label,
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        source: "photon" as const,
      };
    });
}

/** Nominatim, with the identifying header its policy requires. Fallback only. */
async function searchNominatim(q: string, near: { lat: number; lng: number } | null): Promise<GeoHit[]> {
  const params = new URLSearchParams({ q, format: "json", limit: "6", countrycodes: "in", addressdetails: "0" });
  if (near) {
    // ~0.6 degrees around the point, and prefer results inside it.
    const d = 0.6;
    params.set("viewbox", `${near.lng - d},${near.lat + d},${near.lng + d},${near.lat - d}`);
    params.set("bounded", "0");
  }
  const data = await fetchJson(`https://nominatim.openstreetmap.org/search?${params}`);
  if (!Array.isArray(data)) return [];
  return data.map((r: any) => ({
    label: r.display_name as string,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    source: "nominatim" as const,
  }));
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 3) return NextResponse.json({ success: true, data: [] });

  const nearRaw = req.nextUrl.searchParams.get("near") ?? "";
  const [nLat, nLng] = nearRaw.split(",").map((v) => parseFloat(v));
  const near = Number.isFinite(nLat) && Number.isFinite(nLng) ? { lat: nLat, lng: nLng } : null;

  const key = `${q.toLowerCase()}|${near ? `${near.lat.toFixed(2)},${near.lng.toFixed(2)}` : ""}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return NextResponse.json({ success: true, data: cached.hits, cached: true });
  }

  // Photon first; only pay for Nominatim when Photon gives us nothing.
  let hits = await searchPhoton(q, near);
  if (hits.length === 0) hits = await searchNominatim(q, near);

  // Drop near-duplicates that sit within ~100m of an earlier, better-ranked hit.
  const deduped: GeoHit[] = [];
  for (const h of hits) {
    if (!Number.isFinite(h.lat) || !Number.isFinite(h.lng) || !h.label) continue;
    const dupe = deduped.some(
      (d) => Math.abs(d.lat - h.lat) < 0.001 && Math.abs(d.lng - h.lng) < 0.001,
    );
    if (!dupe) deduped.push(h);
  }

  // Re-rank by distance ourselves. The provider's own location bias is only a
  // nudge and loses to a famous far-away match — searching "Lajpat Nagar" from
  // Lucknow still put Delhi first. Someone registering a PG means the one near
  // the PIN they just typed, every time, so sort by distance rather than fame.
  if (near) {
    const dist2 = (h: GeoHit) => {
      // Equirectangular approximation is plenty for ordering within a state.
      const dLat = h.lat - near.lat;
      const dLng = (h.lng - near.lng) * Math.cos((near.lat * Math.PI) / 180);
      return dLat * dLat + dLng * dLng;
    };
    deduped.sort((a, b) => dist2(a) - dist2(b));
  }

  const out = deduped.slice(0, 6);

  if (cache.size > CACHE_MAX) cache.clear();
  cache.set(key, { at: Date.now(), hits: out });

  return NextResponse.json({ success: true, data: out });
}
