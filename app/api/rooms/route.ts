/**
 * app/api/rooms/route.ts
 * GET ?listingId=N — rooms in one PG, for the Add-Tenant room picker.
 *
 * This endpoint was being called by the Add Tenant form but did not exist: the
 * fetch 404'd, the room list stayed empty, and the form's submit button — which
 * is disabled while `rooms.length === 0` — could never be enabled. Adding a
 * tenant was impossible.
 *
 * Returns each room's preset price and bed count so the picker can show
 * "Room 101 · Double Sharing · ₹6,000" and pre-fill the rent.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext, listingScope } from "@/lib/manage-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const ctx = await getManageContext();
  if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const listingId = parseInt(req.nextUrl.searchParams.get("listingId") ?? "");
  if (Number.isNaN(listingId)) {
    return NextResponse.json({ success: false, message: "listingId required" }, { status: 400 });
  }

  // Ownership AND per-PG manager scope go inside the query, so a manager cannot
  // read the rooms of a PG they were not assigned to by passing its id.
  const listing = await db.listing.findFirst({
    where: { id: listingId, ownerId: ctx.userId, ...listingScope(ctx, "id") },
    select: { id: true },
  });
  if (!listing) return NextResponse.json({ success: false, message: "PG nahi mila" }, { status: 404 });

  const rooms = await db.room.findMany({
    where: { listingId },
    orderBy: [{ floor: "asc" }, { name: "asc" }],
    select: {
      id: true, name: true, floor: true, price: true, listingId: true,
      beds: { select: { id: true, isOccupied: true } },
    },
  });

  return NextResponse.json({
    success: true,
    data: rooms.map((r) => {
      const total = r.beds.length;
      const occupied = r.beds.filter((b) => b.isOccupied).length;
      return {
        id: r.id,
        name: r.name,
        floor: r.floor,
        listingId: r.listingId,
        price: r.price,
        totalBeds: total,
        freeBeds: total - occupied,
        // A room with N beds is N-sharing — the label the owner set up in Rooms.
        sharing: total,
      };
    }),
  });
}
