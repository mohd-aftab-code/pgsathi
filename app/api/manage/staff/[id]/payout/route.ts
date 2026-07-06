/**
 * app/api/manage/staff/[id]/payout/route.ts
 * POST — record a monthly salary payout for a staff member
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext, logPgAudit } from "@/lib/manage-auth";

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const data = await req.json();
    if (!data.forMonth || !data.amount) return NextResponse.json({ success: false, message: "forMonth and amount required" }, { status: 400 });

    const staff = await db.pgStaff.findFirst({ where: { id: parseInt(id), ownerId: ctx.userId } });
    if (!staff) return NextResponse.json({ success: false, message: "Staff not found" }, { status: 404 });

    const payout = await db.pgSalaryPayout.upsert({
      where: { staffId_forMonth: { staffId: parseInt(id), forMonth: data.forMonth } },
      update: { amount: parseInt(data.amount), method: data.method ?? "CASH", paidOn: new Date(), note: data.note ?? null },
      create: {
        ownerId:  ctx.userId,
        staffId:  parseInt(id),
        forMonth: data.forMonth,
        amount:   parseInt(data.amount),
        method:   data.method  ?? "CASH",
        paidOn:   new Date(),
        note:     data.note ?? null,
      },
    });

    await logPgAudit(ctx.userId, ctx.name, `Salary paid ₹${data.amount} to ${staff.name} for ${data.forMonth}`, "PgSalaryPayout");
    return NextResponse.json({ success: true, data: payout });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
