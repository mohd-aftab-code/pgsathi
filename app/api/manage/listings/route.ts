/**
 * app/api/manage/listings/route.ts
 * GET — Returns all listings belonging to the manager's owner.
 * Used by Mess, Announcements, Expenses pages for property dropdowns.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext } from "@/lib/manage-auth";

export async function GET() {
  try {
    const ctx = await getManageContext();
    if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const listings = await db.listing.findMany({
      where: { ownerId: ctx.userId },
      select: { id: true, title: true, status: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: listings });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
