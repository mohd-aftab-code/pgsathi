/**
 * app/api/manage/mess/route.ts
 * GET — fetch weekly mess menu for a listing
 * PUT — upsert the full 7-day menu
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext, logPgAudit } from "@/lib/manage-auth";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId") ? parseInt(searchParams.get("listingId")!) : undefined;
    if (!listingId) return NextResponse.json({ success: false, message: "listingId required" }, { status: 400 });

    const menus = await db.pgMessMenu.findMany({
      where: { ownerId: ctx.userId, listingId },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({ success: true, data: menus });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const { listingId, days } = await req.json();
    // days: Array<{ dayOfWeek: 0-6, breakfast, lunch, snacks, dinner }>
    if (!listingId || !Array.isArray(days)) return NextResponse.json({ success: false, message: "listingId and days[] required" }, { status: 400 });

    const listing = await db.listing.findFirst({ where: { id: parseInt(listingId), ownerId: ctx.userId } });
    if (!listing) return NextResponse.json({ success: false, message: "Listing not found" }, { status: 404 });

    const results = await Promise.all(
      days.map((d: any) =>
        db.pgMessMenu.upsert({
          where: { listingId_dayOfWeek: { listingId: parseInt(listingId), dayOfWeek: d.dayOfWeek } },
          update: { breakfast: d.breakfast ?? null, lunch: d.lunch ?? null, snacks: d.snacks ?? null, dinner: d.dinner ?? null },
          create: {
            ownerId: ctx.userId, listingId: parseInt(listingId),
            dayOfWeek: d.dayOfWeek,
            breakfast: d.breakfast ?? null, lunch: d.lunch ?? null,
            snacks: d.snacks ?? null, dinner: d.dinner ?? null,
          },
        })
      )
    );

    await logPgAudit(ctx.userId, ctx.name, `Updated mess menu for PG #${listingId}`, "PgMessMenu");
    return NextResponse.json({ success: true, data: results });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
