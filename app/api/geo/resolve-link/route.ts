/**
 * app/api/geo/resolve-link/route.ts
 * POST { url } → { latitude, longitude }
 *
 * Expands a shortened Google Maps link (maps.app.goo.gl / goo.gl/maps) by
 * following its redirect, then reads the coordinates out of the full URL.
 * The browser can't do this itself — Google doesn't send CORS headers.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parseMapInput } from "@/lib/map-link";

// Only these hosts are ever fetched, so a pasted link can't be used to make the
// server hit an internal address (SSRF).
const ALLOWED = /^(maps\.app\.goo\.gl|goo\.gl|www\.google\.[a-z.]+|google\.[a-z.]+|maps\.google\.[a-z.]+)$/i;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const raw = String(body.url ?? "").trim().slice(0, 2000);

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return NextResponse.json({ success: false, message: "Ye valid link nahi hai" }, { status: 400 });
  }
  if (parsed.protocol !== "https:" || !ALLOWED.test(parsed.hostname)) {
    return NextResponse.json({ success: false, message: "Sirf Google Maps ka link chalega" }, { status: 400 });
  }

  try {
    // `redirect: manual` would only give us one hop; letting fetch follow it and
    // reading res.url gives the final expanded URL that carries the coordinates.
    const res = await fetch(parsed.toString(), {
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
      headers: {
        // Google returns a JS-only page to unknown agents; a normal UA gets the
        // real redirect chain.
        "User-Agent": "Mozilla/5.0 (compatible; PGSathi/1.0)",
        "Accept-Language": "en",
      },
    });

    const point = parseMapInput(res.url) ?? parseMapInput(await res.text().then((t) => t.slice(0, 60000)).catch(() => ""));
    if (!point) {
      return NextResponse.json(
        { success: false, message: "Is link se location nahi mili — Google Maps se coordinates copy karke daalein." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, latitude: point.lat, longitude: point.lng });
  } catch {
    return NextResponse.json({ success: false, message: "Link kholne mein dikkat aayi, dobara try karein" }, { status: 502 });
  }
}
