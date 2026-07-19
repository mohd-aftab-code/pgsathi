/**
 * app/api/manage/complaints/[id]/route.ts
 * PATCH — update status, priority, description
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext, logPgAudit } from "@/lib/manage-auth";
import { notify } from "@/lib/notifications";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const data = await req.json();
    const existing = await db.pgComplaint.findFirst({ where: { id: parseInt(id), ownerId: ctx.userId } });
    if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    const updateData: any = {};
    if (data.status)      updateData.status      = data.status;
    if (data.priority)    updateData.priority    = data.priority;
    if (data.description !== undefined) updateData.description = data.description;

    if (data.status === "RESOLVED" || data.status === "CLOSED") {
      updateData.resolvedAt = new Date();
    }

    const complaint = await db.pgComplaint.update({ where: { id: parseInt(id) }, data: updateData });
    await logPgAudit(ctx.userId, ctx.name, `Updated complaint "${complaint.title}" → ${complaint.status}`, "PgComplaint");

    // Notify the tenant when their complaint is resolved/closed
    if ((updateData.status === "RESOLVED" || updateData.status === "CLOSED") && existing.tenantId) {
      const t = await db.pgTenant.findUnique({ where: { id: existing.tenantId }, select: { userId: true } });
      if (t?.userId) {
        await notify({
          userId: t.userId,
          type: "COMPLAINT",
          title: `Complaint ${complaint.status.toLowerCase()}: ${complaint.title}`,
          message: `Your complaint has been marked ${complaint.status.toLowerCase()}.`,
          link: "/dashboard/tenant/complaints",
        });
      }
    }

    return NextResponse.json({ success: true, data: complaint });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
