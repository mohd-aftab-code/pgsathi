/**
 * app/api/manage/expenses/route.ts
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
    const category  = searchParams.get("category")  ?? undefined;
    const from      = searchParams.get("from")  ? new Date(searchParams.get("from")!)  : undefined;
    const to        = searchParams.get("to")    ? new Date(searchParams.get("to")!)    : undefined;
    const page      = parseInt(searchParams.get("page") ?? "1");
    const limit     = 25;

    const where: any = { ownerId: ctx.userId };
    if (listingId) where.listingId = listingId;
    if (category)  where.category  = category;
    if (from || to) {
      where.spentOn = {};
      if (from) where.spentOn.gte = from;
      if (to)   where.spentOn.lte = to;
    }

    const [expenses, total, sum] = await Promise.all([
      db.pgExpense.findMany({
        where, orderBy: { spentOn: "desc" }, skip: (page - 1) * limit, take: limit,
        include: { listing: { select: { id: true, title: true } } },
      }),
      db.pgExpense.count({ where }),
      db.pgExpense.aggregate({ where, _sum: { amount: true } }),
    ]);

    return NextResponse.json({ success: true, data: expenses, total, totalAmount: sum._sum.amount ?? 0 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const data = await req.json();
    if (!data.title || !data.amount) return NextResponse.json({ success: false, message: "title and amount required" }, { status: 400 });

    const expense = await db.pgExpense.create({
      data: {
        ownerId:   ctx.userId,
        listingId: data.listingId ? parseInt(data.listingId) : null,
        category:  data.category ?? "OTHER",
        amount:    parseInt(data.amount),
        title:     data.title,
        spentOn:   data.spentOn ? new Date(data.spentOn) : new Date(),
        note:      data.note ?? null,
      },
    });

    await logPgAudit(ctx.userId, ctx.name, `Expense ₹${expense.amount}: ${expense.title}`, "PgExpense");
    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
