/**
 * app/api/geo/pincode/route.ts
 * GET /api/geo/pincode?pin=204211
 *
 * PIN code → { city, state, areas[], lat/lng }. Purely informational: the form
 * uses it to pre-fill fields, but the listing's real city is resolved again on
 * save (see lib/geo.ts → resolveCity), so a failure here never blocks a listing.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { lookupIndiaPost, lookupPinGeo } from "@/lib/geo";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const pin = (new URL(req.url).searchParams.get("pin") ?? "").replace(/\D/g, "");
  if (pin.length !== 6) {
    return NextResponse.json({ success: false, message: "PIN code 6 digits ka hona chahiye" }, { status: 400 });
  }

  const [offices, geo] = await Promise.all([lookupIndiaPost(pin), lookupPinGeo(pin)]);

  const cityName = offices?.[0]?.District?.trim() || geo?.district?.trim() || "";
  const stateName = offices?.[0]?.State?.trim() || geo?.state?.trim() || "";

  if (!cityName) {
    return NextResponse.json(
      { success: false, message: "Is PIN code se city detect nahi hui — city/state khud bhar dein." },
      { status: 404 }
    );
  }

  // Curated localities for this city, if we already know it, plus the PIN's post offices
  const city = await db.city.findFirst({
    where: { name: { equals: cityName, mode: "insensitive" } },
    select: { id: true },
  });
  const localities = city
    ? await db.locality.findMany({
        where: { cityId: city.id, isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  const seen = new Set(localities.map((l) => l.name.toLowerCase()));
  const postOfficeAreas = (offices ?? [])
    // Strip the trailing "S.O"/"B.O"/"H.O" noise so the names read naturally.
    .map((o) => o.Name.replace(/\s+(S\.?O|B\.?O|H\.?O)\.?$/i, "").trim())
    .filter((n) => n.length > 1 && !seen.has(n.toLowerCase()));

  return NextResponse.json({
    success: true,
    pincode: pin,
    cityName,
    stateName,
    areas: [
      ...localities.map((l) => ({ id: l.id, name: l.name })),
      ...[...new Set(postOfficeAreas)].map((name) => ({ id: null, name })),
    ],
    ...(geo ? { latitude: geo.lat, longitude: geo.lng } : {}),
  });
}
