/**
 * app/api/manage/complaints/route.ts
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext, logPgAudit } from "@/lib/manage-auth";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasAccess) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status    = searchParams.get("status")    ?? undefined;
    const listingId = searchParams.get("listingId") ? parseInt(searchParams.get("listingId")!) : undefined;
    const priority  = searchParams.get("priority")  ?? undefined;

    const where: any = { ownerId: ctx.userId };
    if (status)    where.status    = status;
    if (listingId) where.listingId = listingId;
    if (priority)  where.priority  = priority;

    const complaints = await db.pgComplaint.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        listing: { select: { id: true, title: true } },
        tenant:  { select: { id: true, name: true, phone: true } },
      },
    });

    return NextResponse.json({ success: true, data: complaints });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasAccess) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const data = await req.json();
    if (!data.title || !data.listingId) return NextResponse.json({ success: false, message: "title and listingId required" }, { status: 400 });

    const listing = await db.listing.findFirst({ where: { id: parseInt(data.listingId), ownerId: ctx.userId } });
    if (!listing) return NextResponse.json({ success: false, message: "Listing not found" }, { status: 404 });

    const complaint = await db.pgComplaint.create({
      data: {
        ownerId:     ctx.userId,
        listingId:   parseInt(data.listingId),
        tenantId:    data.tenantId ? parseInt(data.tenantId) : null,
        title:       data.title,
        description: data.description ?? null,
        category:    data.category   ?? "OTHER",
        priority:    data.priority   ?? "MEDIUM",
        status:      "OPEN",
      },
    });

    await logPgAudit(ctx.userId, ctx.name, `New complaint: ${complaint.title}`, "PgComplaint");
    return NextResponse.json({ success: true, data: complaint }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
