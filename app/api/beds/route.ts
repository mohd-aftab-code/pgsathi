/**
 * app/api/beds/route.ts
 * GET ?roomId=N — beds in one room, for the Add-Tenant bed picker.
 *
 * Missing alongside /api/rooms, with the same effect: the bed dropdown never
 * populated and a tenant could not be assigned to a bed.
 *
 * Occupied beds are still returned (marked) so the picker can grey them out
 * rather than silently hiding them — an owner looking at a full room should see
 * that it is full, not an empty list.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext, listingScope } from "@/lib/manage-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const ctx = await getManageContext();
  if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const roomId = parseInt(req.nextUrl.searchParams.get("roomId") ?? "");
  if (Number.isNaN(roomId)) {
    return NextResponse.json({ success: false, message: "roomId required" }, { status: 400 });
  }

  // Reached through the listing so ownership and per-PG scope are enforced in
  // the query itself — a bare roomId cannot leak another owner's room.
  const room = await db.room.findFirst({
    where: {
      id: roomId,
      listing: { ownerId: ctx.userId, ...listingScope(ctx, "id") },
    },
    select: {
      id: true, name: true, price: true,
      beds: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, isOccupied: true, roomId: true },
      },
    },
  });
  if (!room) return NextResponse.json({ success: false, message: "Room nahi mila" }, { status: 404 });

  return NextResponse.json({
    success: true,
    room: { id: room.id, name: room.name, price: room.price },
    data: room.beds,
  });
}
