/**
 * app/api/geo/reverse/route.ts
 * GET ?lat=..&lng=.. → { display_name }
 *
 * Used after the map marker is dragged, to name the spot it landed on.
 *
 * Like the search route, this exists so the call is made from the server: the
 * browser cannot send the User-Agent Nominatim's policy requires, so calling it
 * directly from the page got throttled and the address silently never arrived.
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const UA = "PGSathi/1.0 (https://pgsathi.in; support@pgsathi.in)";
const cache = new Map<string, { at: number; name: string }>();
const CACHE_MS = 10 * 60 * 1000;

export async function GET(req: NextRequest) {
  const lat = parseFloat(req.nextUrl.searchParams.get("lat") ?? "");
  const lng = parseFloat(req.nextUrl.searchParams.get("lng") ?? "");
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ success: false, message: "lat/lng required" }, { status: 400 });
  }

  // ~11m of precision is plenty here and makes the cache actually hit while a
  // user nudges the marker around.
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return NextResponse.json({ success: true, display_name: hit.name, cached: true });
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18`,
      { signal: ctrl.signal, headers: { "User-Agent": UA, "Accept-Language": "en" } },
    );
    if (!res.ok) return NextResponse.json({ success: false });
    const data = await res.json();
    const name: string = data?.display_name ?? "";
    if (name) {
      if (cache.size > 500) cache.clear();
      cache.set(key, { at: Date.now(), name });
    }
    return NextResponse.json({ success: !!name, display_name: name, address: data?.address ?? null });
  } catch {
    // A failed lookup must never block the pin — lat/lng is already saved.
    return NextResponse.json({ success: false });
  } finally {
    clearTimeout(timer);
  }
}
