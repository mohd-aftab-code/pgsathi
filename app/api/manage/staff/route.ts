/**
 * app/api/manage/staff/route.ts
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
    const active    = searchParams.get("active") !== "false";

    const where: any = { ownerId: ctx.userId, active };
    if (listingId) where.listingId = listingId;

    const staff = await db.pgStaff.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        listing: { select: { id: true, title: true } },
        payouts: { orderBy: { forMonth: "desc" }, take: 3 },
      },
    });

    return NextResponse.json({ success: true, data: staff });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const data = await req.json();
    if (!data.name) return NextResponse.json({ success: false, message: "name required" }, { status: 400 });

    const staff = await db.pgStaff.create({
      data: {
        ownerId:   ctx.userId,
        listingId: data.listingId ? parseInt(data.listingId) : null,
        name:      data.name,
        role:      data.role    ?? "OTHER",
        phone:     data.phone   ?? null,
        salary:    parseInt(data.salary ?? 0),
        joinDate:  data.joinDate ? new Date(data.joinDate) : new Date(),
        note:      data.note    ?? null,
        active:    true,
      },
    });

    await logPgAudit(ctx.userId, ctx.name, `Added staff: ${staff.name} (${staff.role})`, "PgStaff");
    return NextResponse.json({ success: true, data: staff }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
