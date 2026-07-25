/**
 * app/api/admin/partner-payouts/route.ts
 * POST — pay a partner in one batch.
 *
 * Collects every APPROVED earning that isn't already attached to a payout,
 * creates one PartnerPayout for the total, links those earnings to it and marks
 * them PAID. This is how a real payout works: one transfer per cycle, not one
 * per PG.
 *
 * The whole thing runs in a transaction so a partial payout can never exist
 * (money linked to a payout that was never created, or vice versa).
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdmin, adminAudit } from "@/lib/admin-audit";
import { can, PERMISSIONS } from "@/lib/permissions";
import { notify } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  if (!(await can("ADMIN", PERMISSIONS.PAYOUT_CREATE))) {
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const partnerId = parseInt(String(body.partnerId));
  const method = ["UPI", "BANK", "CASH", "OTHER"].includes(body.method) ? body.method : "UPI";
  const reference = String(body.reference ?? "").trim().slice(0, 60) || null;

  if (Number.isNaN(partnerId)) {
    return NextResponse.json({ success: false, message: "Invalid partner" }, { status: 400 });
  }

  const partner = await db.partnerProfile.findUnique({
    where: { id: partnerId },
    select: { id: true, userId: true, partnerCode: true },
  });
  if (!partner) return NextResponse.json({ success: false, message: "Partner nahi mila" }, { status: 404 });

  // Only APPROVED earnings that aren't already in a payout are payable.
  const payable = await db.partnerEarning.findMany({
    where: { partnerId, status: "APPROVED", payoutId: null },
    select: { id: true, amount: true },
  });
  if (payable.length === 0) {
    return NextResponse.json({ success: false, message: "Koi approved earning payout ke liye pending nahi" }, { status: 400 });
  }

  const total = payable.reduce((sum, e) => sum + e.amount, 0);
  const ids = payable.map((e) => e.id);

  const payout = await db.$transaction(async (tx) => {
    const p = await tx.partnerPayout.create({
      data: {
        partnerId,
        amount: total,
        method,
        reference,
        status: "COMPLETED", // recorded as paid; the transfer itself happens outside the app
        paidAt: new Date(),
        createdBy: admin.id,
      },
      select: { id: true, amount: true },
    });

    // Re-check status inside the transaction so a concurrent action can't cause
    // an earning to be paid twice.
    await tx.partnerEarning.updateMany({
      where: { id: { in: ids }, status: "APPROVED", payoutId: null },
      data: { status: "PAID", paidAt: new Date(), payoutId: p.id },
    });

    return p;
  });

  await adminAudit({
    adminId: admin.id,
    actor: admin.name,
    action: "payout.created",
    entity: "PartnerPayout",
    entityId: payout.id,
    before: { earningIds: ids, status: "APPROVED" },
    after: { payoutId: payout.id, amount: total, method, reference, status: "PAID" },
  });

  await notify({
    userId: partner.userId,
    type: "PARTNER_EARNING",
    title: `Payout ho gaya — ₹${total.toLocaleString("en-IN")} 🎉`,
    message: `${payable.length} earning(s) ka payment ${method} se kar diya gaya${reference ? ` (ref: ${reference})` : ""}.`,
    link: "/partner/earnings",
  });

  return NextResponse.json({
    success: true,
    message: `₹${total.toLocaleString("en-IN")} ka payout ban gaya (${payable.length} earnings)`,
    data: { payoutId: payout.id, amount: total, count: payable.length },
  });
}
