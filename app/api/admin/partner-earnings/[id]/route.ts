/**
 * app/api/admin/partner-earnings/[id]/route.ts
 * PATCH — the admin's money control over one partner earning.
 *   action: "set_amount" | "approve" | "mark_paid" | "cancel"
 *
 * Every change records a before/after audit entry (this is the whole reason
 * admin_audit_logs exists). The amount is admin-decided — there is no commission.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdmin, adminAudit } from "@/lib/admin-audit";
import { can, PERMISSIONS } from "@/lib/permissions";
import { notify } from "@/lib/notifications";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const earningId = parseInt(id);
  if (Number.isNaN(earningId)) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const action = body.action as "set_amount" | "approve" | "mark_paid" | "cancel";

  const earning = await db.partnerEarning.findUnique({
    where: { id: earningId },
    select: { id: true, amount: true, status: true, partnerId: true, listing: { select: { title: true } }, partner: { select: { userId: true } } },
  });
  if (!earning) return NextResponse.json({ success: false, message: "Earning nahi mili" }, { status: 404 });

  // PAID and CANCELLED are terminal. The UI already hides the buttons, but the API
  // is the real boundary and a stale tab is enough to reach it — and each of these
  // corrupts money that has already moved: re-approving a PAID earning makes it
  // payable a second time, editing its amount desyncs it from its payout row, and
  // cancelling it drops sent money out of every total.
  if (earning.status === "PAID" || earning.status === "CANCELLED") {
    return NextResponse.json(
      {
        success: false,
        message:
          earning.status === "PAID"
            ? "Ye earning pay ho chuki hai — ab isme change nahi ho sakta"
            : "Ye earning cancel ho chuki hai",
      },
      { status: 400 },
    );
  }

  const before = { amount: earning.amount, status: earning.status };
  let data: any = {};
  let auditAction = "";
  let partnerMsg = "";

  if (action === "set_amount") {
    if (!(await can("ADMIN", PERMISSIONS.EARNINGS_SET_AMOUNT))) {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
    }
    const amount = parseInt(String(body.amount));
    if (Number.isNaN(amount) || amount < 0) return NextResponse.json({ success: false, message: "Sahi amount daalein" }, { status: 400 });
    data = { amount };
    auditAction = "earning.amount.updated";
    partnerMsg = `${earning.listing.title} par aapki earning ₹${amount} set ki gayi.`;
  } else if (action === "approve") {
    if (!(await can("ADMIN", PERMISSIONS.EARNINGS_APPROVE))) {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
    }
    if (earning.amount <= 0) return NextResponse.json({ success: false, message: "Pehle amount set karein" }, { status: 400 });
    if (earning.status !== "PENDING") {
      return NextResponse.json({ success: false, message: "Ye earning pehle hi approve ho chuki hai" }, { status: 400 });
    }
    data = { status: "APPROVED", approvedAt: new Date(), approvedBy: admin.id };
    auditAction = "earning.approved";
    partnerMsg = `${earning.listing.title} par ₹${earning.amount} ki earning approve ho gayi.`;
  } else if (action === "mark_paid") {
    if (!(await can("ADMIN", PERMISSIONS.EARNINGS_APPROVE))) {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
    }
    // Money only leaves after an approval — never straight from PENDING.
    if (earning.status !== "APPROVED") {
      return NextResponse.json({ success: false, message: "Pehle earning approve karein" }, { status: 400 });
    }
    // `data` stays empty — the PAID write happens inside the payout transaction below.
    auditAction = "earning.paid";
    partnerMsg = `${earning.listing.title} par ₹${earning.amount} aapko pay kar diya gaya.`;
  } else if (action === "cancel") {
    if (!(await can("ADMIN", PERMISSIONS.EARNINGS_SET_AMOUNT))) {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
    }
    data = { status: "CANCELLED" };
    auditAction = "earning.cancelled";
    partnerMsg = "";
  } else {
    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  }

  // Paying one earning must still leave a PartnerPayout row. Otherwise the money
  // reads as PAID while payout history has no trace of how it was sent, and the
  // partner's "paid out" total can never be reconciled against actual payouts.
  // This is the single-earning version of /api/admin/partner-payouts.
  let updated: { amount: number; status: string };
  let payoutId: number | null = null;

  if (action === "mark_paid") {
    const method = ["UPI", "BANK", "CASH", "OTHER"].includes(body.method) ? body.method : "UPI";
    const reference = String(body.reference ?? "").trim().slice(0, 60) || null;

    const payout = await db
      .$transaction(async (tx) => {
        const p = await tx.partnerPayout.create({
          data: {
            partnerId: earning.partnerId,
            amount: earning.amount,
            method,
            reference,
            status: "COMPLETED", // recorded as paid; the transfer itself happens outside the app
            paidAt: new Date(),
            createdBy: admin.id,
          },
          select: { id: true },
        });

        // Re-check inside the transaction so two concurrent clicks can't pay the
        // same earning twice. A zero count rolls the payout back with it.
        const res = await tx.partnerEarning.updateMany({
          where: { id: earningId, status: "APPROVED", payoutId: null },
          data: { status: "PAID", paidAt: new Date(), payoutId: p.id },
        });
        if (res.count === 0) throw new Error("ALREADY_PAID");

        return p;
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.message === "ALREADY_PAID") return null;
        throw e;
      });

    if (!payout) {
      return NextResponse.json({ success: false, message: "Ye earning pehle hi pay ho chuki hai" }, { status: 400 });
    }
    payoutId = payout.id;
    updated = { amount: earning.amount, status: "PAID" };
    if (reference) partnerMsg += ` (ref: ${reference})`;
  } else {
    updated = await db.partnerEarning.update({ where: { id: earningId }, data, select: { amount: true, status: true } });
  }

  await adminAudit({
    adminId: admin.id,
    actor: admin.name,
    action: auditAction,
    entity: "PartnerEarning",
    entityId: earningId,
    before,
    after: { amount: updated.amount, status: updated.status, ...(payoutId ? { payoutId } : {}) },
  });

  if (partnerMsg && earning.partner) {
    await notify({ userId: earning.partner.userId, type: "PARTNER_EARNING", title: "Earning update", message: partnerMsg, link: "/partner/earnings" });
  }

  return NextResponse.json({ success: true, message: "Update ho gaya" });
}
