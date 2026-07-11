/**
 * app/api/manage/reports/route.ts
 * GET — Income vs Expense summary, monthly breakdown, occupancy
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext } from "@/lib/manage-auth";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const months = parseInt(searchParams.get("months") ?? "6");

    // Build monthly data for the last N months
    const monthlyData = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const [incomeAgg, expenseAgg] = await Promise.all([
        db.pgPayment.aggregate({ where: { ownerId: ctx.userId, voided: false, paidOn: { gte: monthStart, lte: monthEnd } }, _sum: { amount: true } }),
        db.pgExpense.aggregate({ where: { ownerId: ctx.userId, spentOn: { gte: monthStart, lte: monthEnd } }, _sum: { amount: true } }),
      ]);

      monthlyData.push({
        month:   ym,
        income:  incomeAgg._sum.amount ?? 0,
        expense: expenseAgg._sum.amount ?? 0,
        net:     (incomeAgg._sum.amount ?? 0) - (expenseAgg._sum.amount ?? 0),
      });
    }

    // Current month summary
    const now = new Date();
    const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [activeTenants, totalBeds, occupiedBeds, totalIncome, totalExpense,
           openComplaints, resolvedComplaints, pendingBills, pendingRent] = await Promise.all([
      db.pgTenant.count({ where: { ownerId: ctx.userId, status: "ACTIVE", deletedAt: null } }),
      db.bed.count({ where: { room: { listing: { ownerId: ctx.userId } } } }),
      db.bed.count({ where: { room: { listing: { ownerId: ctx.userId } }, isOccupied: true } }),
      db.pgPayment.aggregate({ where: { ownerId: ctx.userId, voided: false, paidOn: { gte: monthStart } }, _sum: { amount: true } }),
      db.pgExpense.aggregate({ where: { ownerId: ctx.userId, spentOn: { gte: monthStart } }, _sum: { amount: true } }),
      db.pgComplaint.count({ where: { ownerId: ctx.userId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      db.pgComplaint.count({ where: { ownerId: ctx.userId, status: "RESOLVED" } }),
      db.pgRentBill.count({ where: { ownerId: ctx.userId, forMonth: curMonth, payments: { none: {} } } }),
      db.pgRentBill.findMany({
        where: { ownerId: ctx.userId, forMonth: curMonth },
        include: { payments: { where: { type: "RENT", forMonth: curMonth, voided: false }, select: { amount: true } }, tenant: { select: { monthlyRent: true } } },
      }),
    ]);

    const expectedRent = pendingRent.reduce((s, b) => s + b.rentAmount, 0);
    const collectedRent = pendingRent.reduce((s, b) => s + b.payments.reduce((ps, p) => ps + p.amount, 0), 0);
    const pendingRentAmt = Math.max(0, expectedRent - collectedRent);

    return NextResponse.json({
      success: true,
      data: {
        monthly: monthlyData,
        current: {
          month:              curMonth,
          activeTenants,
          totalBeds,
          occupiedBeds,
          occupancyPct:       totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
          income:             totalIncome._sum.amount  ?? 0,
          expense:            totalExpense._sum.amount ?? 0,
          net:                (totalIncome._sum.amount ?? 0) - (totalExpense._sum.amount ?? 0),
          expectedRent,
          collectedRent,
          pendingRent:        pendingRentAmt,
          openComplaints,
          resolvedComplaints,
          pendingBills,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
