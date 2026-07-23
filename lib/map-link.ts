/**
 * lib/map-link.ts
 * Pulls coordinates out of whatever a user pastes from Google Maps.
 *
 * Owners find their PG on Google Maps and copy the link — asking them to instead
 * hunt for the same spot on our map is busywork. Handles the shapes Google
 * actually produces from "Share", the address bar, and "Copy coordinates".
 */

export type ParsedPoint = { lat: number; lng: number };

const inIndiaish = (lat: number, lng: number) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

/**
 * Parses a full Google Maps URL or a bare "lat, lng" pair.
 * Returns null for short links (maps.app.goo.gl) — those need a redirect
 * follow, which only the server can do; see /api/geo/resolve-link.
 */
export function parseMapInput(raw: string): ParsedPoint | null {
  const s = raw.trim();
  if (!s) return null;

  // 1) Plain coordinates: "27.5724, 78.1116" or "27.5724 78.1116"
  const plain = s.match(/^(-?\d{1,3}\.\d+)\s*[, ]\s*(-?\d{1,3}\.\d+)$/);
  if (plain) {
    const lat = parseFloat(plain[1]), lng = parseFloat(plain[2]);
    if (inIndiaish(lat, lng)) return { lat, lng };
  }

  // Google shares links as both google.com/maps/... and maps.google.com/?q=...,
  // so the host check has to accept either shape.
  if (!/google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|goo\.gl|maps\.app/i.test(s)) return null;

  // 2) The !3dLAT!4dLNG pair — this is the actual place pin, and it is more
  //    precise than the @-coordinates, which are just the viewport centre.
  const bang = s.match(/!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/);
  if (bang) {
    const lat = parseFloat(bang[1]), lng = parseFloat(bang[2]);
    if (inIndiaish(lat, lng)) return { lat, lng };
  }

  // 3) ?q=lat,lng / ?query= / ?ll= / ?destination= — the separator may arrive
  //    URL-encoded (%2C) or as a literal comma.
  const q = s.match(/[?&](?:q|query|ll|destination|center)=(-?\d{1,3}\.\d+)(?:,|%2C)\s*(-?\d{1,3}\.\d+)/i);
  if (q) {
    const lat = parseFloat(q[1]), lng = parseFloat(q[2]);
    if (inIndiaish(lat, lng)) return { lat, lng };
  }

  // 4) /@lat,lng,zoom — viewport centre; last resort
  const at = s.match(/@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
  if (at) {
    const lat = parseFloat(at[1]), lng = parseFloat(at[2]);
    if (inIndiaish(lat, lng)) return { lat, lng };
  }

  return null;
}

/** True for links that only resolve after following a redirect. */
export function isShortMapLink(raw: string): boolean {
  return /(maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(raw.trim());
}
