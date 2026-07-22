/**
 * app/api/geo/geocode/route.ts
 * POST { address, area, city, state, pincode } → { latitude, longitude, label }
 *
 * Lets the owner just type their address and have the map place itself, instead
 * of requiring them to hunt for their building on a map they may not read well.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { geocodeAddress } from "@/lib/geo";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parts = {
    address: String(body.address ?? "").slice(0, 300),
    area: String(body.area ?? "").slice(0, 150),
    city: String(body.city ?? "").slice(0, 100),
    state: String(body.state ?? "").slice(0, 100),
    pincode: String(body.pincode ?? "").replace(/\D/g, "").slice(0, 6),
  };

  if (!parts.city && !parts.pincode) {
    return NextResponse.json({ success: false, message: "City ya PIN code chahiye" }, { status: 400 });
  }

  const hit = await geocodeAddress(parts);
  if (!hit) {
    return NextResponse.json(
      { success: false, message: "Address se location nahi mili — map pe khud pin kar dein." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, latitude: hit.lat, longitude: hit.lng, label: hit.label });
}
