/**
 * app/api/manage/payments/route.ts
 * GET  — list payments with filters
 * POST — record a new payment
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext, logPgAudit } from "@/lib/manage-auth";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const tenantId  = searchParams.get("tenantId")  ? parseInt(searchParams.get("tenantId")!)  : undefined;
    const forMonth  = searchParams.get("forMonth")  ?? undefined;
    const type      = searchParams.get("type")      ?? undefined;
    const listingId = searchParams.get("listingId") ? parseInt(searchParams.get("listingId")!) : undefined;
    const page      = parseInt(searchParams.get("page") ?? "1");
    const limit     = 25;

    const where: any = { ownerId: ctx.userId, voided: false };
    if (tenantId) where.tenantId = tenantId;
    if (forMonth) where.forMonth = forMonth;
    if (type)     where.type     = type;
    if (listingId) {
      where.tenant = { listingId };
    }

    const [payments, total] = await Promise.all([
      db.pgPayment.findMany({
        where,
        orderBy: { paidOn: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { tenant: { select: { id: true, name: true, phone: true } } },
      }),
      db.pgPayment.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: payments, total, page, pages: Math.ceil(total / limit) });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const data = await req.json();
    if (!data.tenantId || !data.amount) {
      return NextResponse.json({ success: false, message: "tenantId and amount are required" }, { status: 400 });
    }

    // Verify tenant belongs to owner
    const tenant = await db.pgTenant.findFirst({ where: { id: parseInt(data.tenantId), ownerId: ctx.userId } });
    if (!tenant) return NextResponse.json({ success: false, message: "Tenant not found" }, { status: 404 });

    // Count existing payments to generate receipt number
    const payCount = await db.pgPayment.count({ where: { ownerId: ctx.userId } });
    const ym = (data.forMonth ?? currentMonth()).replace("-", "");
    const receiptNo = `REC-${ym}-${String(payCount + 1).padStart(4, "0")}`;

    const payment = await db.pgPayment.create({
      data: {
        ownerId:    ctx.userId,
        tenantId:   parseInt(data.tenantId),
        rentBillId: data.rentBillId ? parseInt(data.rentBillId) : null,
        amount:     parseInt(data.amount),
        type:       data.type    ?? "RENT",
        forMonth:   data.forMonth ?? currentMonth(),
        method:     data.method  ?? "CASH",
        status:     "PAID",
        paidOn:     data.paidOn ? new Date(data.paidOn) : new Date(),
        note:       data.note ?? null,
        receiptNo,
      },
    });

    await logPgAudit(ctx.userId, ctx.name, `Recorded payment ₹${data.amount} from ${tenant.name}`, "PgPayment");
    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
