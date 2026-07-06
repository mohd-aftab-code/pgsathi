/**
 * app/api/manage/tenants/[id]/route.ts
 * GET   — get single tenant detail
 * PATCH — update tenant info
 * DELETE — soft delete (set deletedAt)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext, logPgAudit } from "@/lib/manage-auth";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const tenant = await db.pgTenant.findFirst({
      where: { id: parseInt(id), ownerId: ctx.userId, deletedAt: null },
      include: {
        listing:   { select: { id: true, title: true, address: true } },
        room:      { select: { id: true, name: true } },
        bed:       { select: { id: true, name: true } },
        payments:  { orderBy: { paidOn: "desc" }, take: 10 },
        rentBills: { orderBy: { createdAt: "desc" }, take: 6, include: { payments: true } },
        documents: { orderBy: { uploadedAt: "desc" } },
        agreements:{ orderBy: { createdAt: "desc" }, take: 3 },
        complaints:{ orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
    if (!tenant) return NextResponse.json({ success: false, message: "Tenant not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: tenant });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const data = await req.json();
    const existing = await db.pgTenant.findFirst({ where: { id: parseInt(id), ownerId: ctx.userId } });
    if (!existing) return NextResponse.json({ success: false, message: "Tenant not found" }, { status: 404 });

    const updateData: any = {};
    const fields = ["name","phone","email","gender","idType","idNumber","guardianName","guardianPhone",
                    "permanentAddress","monthlyRent","securityDeposit","rentDueDay","notes","status",
                    "checkOutDate","noticeDate","expectedVacate","depositRefunded","photoUrl","roomId","bedId"];

    for (const f of fields) {
      if (data[f] !== undefined) {
        if (["monthlyRent","securityDeposit","rentDueDay","depositRefunded","roomId","bedId"].includes(f)) {
          updateData[f] = data[f] !== null ? parseInt(data[f]) : null;
        } else if (["checkOutDate","noticeDate","expectedVacate"].includes(f)) {
          updateData[f] = data[f] ? new Date(data[f]) : null;
        } else {
          updateData[f] = data[f];
        }
      }
    }

    const tenant = await db.pgTenant.update({ where: { id: parseInt(id) }, data: updateData });
    
    // If tenant is marked as vacated, free the bed
    if (updateData.status === "VACATED" && existing.bedId) {
      await db.bed.update({ where: { id: existing.bedId }, data: { isOccupied: false } });
    }

    await logPgAudit(ctx.userId, ctx.name, `Updated tenant: ${tenant.name}`, "PgTenant");
    return NextResponse.json({ success: true, data: tenant });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const tenant = await db.pgTenant.findFirst({ where: { id: parseInt(id), ownerId: ctx.userId } });
    if (!tenant) return NextResponse.json({ success: false, message: "Tenant not found" }, { status: 404 });

    await db.pgTenant.update({ where: { id: parseInt(id) }, data: { deletedAt: new Date(), status: "VACATED" } });
    if (tenant.bedId) {
      await db.bed.update({ where: { id: tenant.bedId }, data: { isOccupied: false } });
    }

    await logPgAudit(ctx.userId, ctx.name, `Removed tenant: ${tenant.name}`, "PgTenant");
    return NextResponse.json({ success: true, message: "Tenant archived" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
