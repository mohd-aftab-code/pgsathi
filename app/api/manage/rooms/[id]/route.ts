/**
 * app/api/manage/rooms/[id]/route.ts
 * DELETE — Delete a room and its beds (only if vacant)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext, logPgAudit } from "@/lib/manage-auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await getManageContext();
    if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const room = await db.room.findFirst({
      where: { id: parseInt(id), listing: { ownerId: ctx.userId } },
      include: { beds: true },
    });

    if (!room) return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });

    // Check if any bed is occupied
    const isOccupied = room.beds.some(b => b.isOccupied);
    if (isOccupied) return NextResponse.json({ success: false, message: "Cannot delete room with occupied beds" }, { status: 400 });

    await db.room.delete({
      where: { id: parseInt(id) },
    });

    await logPgAudit(ctx.userId, ctx.name, `Deleted room ${room.name}`, "Room");

    return NextResponse.json({ success: true, message: "Room deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
