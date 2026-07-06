/**
 * app/api/manage/billing/route.ts
 * GET — fetch generated rent bills with filters
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext } from "@/lib/manage-auth";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId") ? parseInt(searchParams.get("listingId")!) : undefined;
    const forMonth  = searchParams.get("month") ?? undefined;

    const where: any = { ownerId: ctx.userId };
    if (forMonth)  where.forMonth = forMonth;
    if (listingId) where.tenant = { listingId };

    const bills = await db.pgRentBill.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { id: true, name: true, phone: true, listing: { select: { title: true } } } },
        payments: { where: { type: "RENT", voided: false }, select: { amount: true } },
      },
    });

    return NextResponse.json({ success: true, data: bills });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
