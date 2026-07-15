/**
 * app/api/manage/payments/[id]/route.ts
 * PATCH — Void a payment
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext, logPgAudit } from "@/lib/manage-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await getManageContext();
    if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const payment = await db.pgPayment.findFirst({
      where: { id: parseInt(id), ownerId: ctx.userId },
    });

    if (!payment) return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    if (payment.voided) return NextResponse.json({ success: false, message: "Payment is already voided" }, { status: 400 });

    await db.pgPayment.update({
      where: { id: parseInt(id) },
      data: { voided: true },
    });

    await logPgAudit(ctx.userId, ctx.name, `Voided payment ₹${payment.amount} (Receipt: ${payment.receiptNo})`, "PgPayment");

    return NextResponse.json({ success: true, message: "Payment voided successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
