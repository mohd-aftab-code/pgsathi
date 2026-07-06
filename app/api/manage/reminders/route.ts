/**
 * app/api/manage/reminders/route.ts
 * GET — returns tenants who haven't paid rent for the current month
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext } from "@/lib/manage-auth";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const forMonth = searchParams.get("month") ?? currentMonth();

    const activeTenants = await db.pgTenant.findMany({
      where: { ownerId: ctx.userId, status: "ACTIVE", deletedAt: null, monthlyRent: { gt: 0 } },
      include: {
        listing: { select: { id: true, title: true } },
        payments: {
          where: { type: "RENT", forMonth, voided: false },
          select: { amount: true },
        },
      },
    });

    const pending = activeTenants
      .map((t) => {
        const paid = t.payments.reduce((s, p) => s + p.amount, 0);
        const due  = Math.max(0, t.monthlyRent - paid);
        return { ...t, paid, due };
      })
      .filter((t) => t.due > 0)
      .sort((a, b) => b.due - a.due);

    return NextResponse.json({
      success: true,
      data: pending,
      month: forMonth,
      totalPending: pending.reduce((s, t) => s + t.due, 0),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
