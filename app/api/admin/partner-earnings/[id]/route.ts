/**
 * app/api/admin/partner-earnings/[id]/route.ts
 * PATCH — the admin's money control over one partner earning.
 *   action: "set_amount" | "approve" | "mark_paid" | "cancel" | "hold" | "unhold"
 *
 * Every change records a before/after audit entry (this is the whole reason
 * admin_audit_logs exists). Amounts are calculated from the plan's commission
 * rate, but the admin can still override or cancel any individual earning.
 *
 * Two guards worth knowing about:
 *   • an earning on hold cannot be approved — the hold is the refund window and
 *     the risk review, and clicking past it is exactly what it exists to stop;
 *   • whoever sets an amount cannot also approve it once it is large enough to
 *     matter (maker-checker), which is the standard control against a single
 *     admin moving money to themselves.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdmin, adminAudit } from "@/lib/admin-audit";
import { can, PERMISSIONS } from "@/lib/permissions";
import { notifyPartner } from "@/lib/partner-notify";
import { getProgramSettings } from "@/lib/partner-settings";
import { createPayout } from "@/lib/partner-payouts";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const earningId = parseInt(id);
  if (Number.isNaN(earningId)) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const action = body.action as "set_amount" | "approve" | "mark_paid" | "cancel" | "hold" | "unhold";

  const earning = await db.partnerEarning.findUnique({
    where: { id: earningId },
    select: {
      id: true, amount: true, status: true, partnerId: true,
      onHold: true, holdReason: true, eligibleAt: true, amountSetBy: true, kind: true,
      owner: { select: { name: true } },
      listing: { select: { title: true } },
      partner: { select: { userId: true } },
    },
  });
  if (!earning) return NextResponse.json({ success: false, message: "Earning nahi mili" }, { status: 404 });

  // Commission is owner-level now, so the owner names the earning. Older per-PG
  // rows have no owner, hence the listing fallback.
  const subject = earning.owner?.name ?? earning.listing?.title ?? "Ye earning";

  // PAID and CANCELLED are terminal. The UI already hides the buttons, but the API
  // is the real boundary and a stale tab is enough to reach it — and each of these
  // corrupts money that has already moved: re-approving a PAID earning makes it
  // payable a second time, editing its amount desyncs it from its payout row, and
  // cancelling it drops sent money out of every total.
  //
  // A PAID earning that genuinely needs undoing is handled by reversing its
  // payout, not by editing it here.
  if (earning.status === "PAID" || earning.status === "CANCELLED") {
    return NextResponse.json(
      {
        success: false,
        message:
          earning.status === "PAID"
            ? "Ye earning pay ho chuki hai — undo karne ke liye uska payout reverse karein"
            : "Ye earning cancel ho chuki hai",
      },
      { status: 400 },
    );
  }

  const settings = await getProgramSettings();
  const before = { amount: earning.amount, status: earning.status, onHold: earning.onHold };
  let data: any = {};
  let auditAction = "";
  let partnerMsg = "";

  if (action === "set_amount") {
    if (!(await can("ADMIN", PERMISSIONS.EARNINGS_SET_AMOUNT))) {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
    }
    const amount = parseInt(String(body.amount));
    // ADJUSTMENT rows are negative by nature; everything else must not be.
    if (Number.isNaN(amount) || (earning.kind !== "ADJUSTMENT" && amount < 0)) {
      return NextResponse.json({ success: false, message: "Sahi amount daalein" }, { status: 400 });
    }
    data = { amount, amountSetBy: admin.id };
    auditAction = "earning.amount.updated";
    partnerMsg = `${subject} par aapki earning ${inr(amount)} set ki gayi.`;
  } else if (action === "hold") {
    if (!(await can("ADMIN", PERMISSIONS.EARNINGS_SET_AMOUNT))) {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
    }
    const reason = String(body.reason ?? "").trim().slice(0, 200) || "Admin review";
    data = { onHold: true, holdReason: reason };
    auditAction = "earning.held";
    partnerMsg = `${subject} par aapki earning review par rakhi gayi hai (${reason}).`;
  } else if (action === "unhold") {
    if (!(await can("ADMIN", PERMISSIONS.EARNINGS_APPROVE))) {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
    }
    data = { onHold: false, holdReason: null };
    auditAction = "earning.unheld";
    partnerMsg = `${subject} par aapki earning ka hold hata diya gaya.`;
  } else if (action === "approve") {
    if (!(await can("ADMIN", PERMISSIONS.EARNINGS_APPROVE))) {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
    }
    if (earning.amount <= 0) return NextResponse.json({ success: false, message: "Pehle amount set karein" }, { status: 400 });
    if (earning.status !== "PENDING") {
      return NextResponse.json({ success: false, message: "Ye earning pehle hi approve ho chuki hai" }, { status: 400 });
    }
    if (earning.onHold) {
      return NextResponse.json(
        { success: false, message: `Ye earning hold par hai${earning.holdReason ? ` (${earning.holdReason})` : ""} — pehle hold hatayein` },
        { status: 400 },
      );
    }
    // Maker-checker: the admin who set the amount cannot also approve it.
    if (
      settings.makerCheckerAbove > 0 &&
      earning.amount >= settings.makerCheckerAbove &&
      earning.amountSetBy === admin.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `${inr(earning.amount)} ki earning aapne set ki hai — approve dusre admin se karwana hoga (limit ${inr(settings.makerCheckerAbove)})`,
        },
        { status: 403 },
      );
    }
    data = { status: "APPROVED", approvedAt: new Date(), approvedBy: admin.id, autoApproved: false };
    auditAction = "earning.approved";
    partnerMsg = `${subject} par ${inr(earning.amount)} ki earning approve ho gayi.`;
  } else if (action === "mark_paid") {
    if (!(await can("ADMIN", PERMISSIONS.PAYOUT_CREATE))) {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
    }
    // Money only leaves after an approval — never straight from PENDING.
    if (earning.status !== "APPROVED") {
      return NextResponse.json({ success: false, message: "Pehle earning approve karein" }, { status: 400 });
    }

    // Paying one earning still goes through the full payout pipeline — KYC gate,
    // TDS, idempotency, and a PROCESSING payout that only completes once a UTR
    // is recorded. Otherwise this route would be a way around all of it.
    const res = await createPayout({
      partnerId: earning.partnerId,
      adminId: admin.id,
      method: body.method,
      reference: body.reference ?? null,
      notes: `Single earning #${earning.id}`,
      ignoreMinimum: true,
      onlyEarningIds: [earning.id],
    });
    if (!res.ok) {
      return NextResponse.json({ success: false, code: res.code, message: res.message }, { status: 400 });
    }

    await adminAudit({
      adminId: admin.id,
      actor: admin.name,
      action: "earning.payout_created",
      entity: "PartnerEarning",
      entityId: earningId,
      before,
      after: { status: "PAID", payoutId: res.payoutId, net: res.net, tdsAmount: res.tds.amount },
    });

    return NextResponse.json({
      success: true,
      message: `Payout #${res.payoutId} ban gaya (${inr(res.net)}). Transfer karke UTR daalein tabhi complete hoga.`,
      data: { payoutId: res.payoutId, amount: res.net, tds: res.tds },
    });
  } else if (action === "cancel") {
    if (!(await can("ADMIN", PERMISSIONS.EARNINGS_SET_AMOUNT))) {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
    }
    const reason = String(body.reason ?? "").trim().slice(0, 300);
    data = { status: "CANCELLED", onHold: false, notes: reason || null };
    auditAction = "earning.cancelled";
    partnerMsg = `${subject} par aapki earning cancel kar di gayi${reason ? ` — ${reason}` : ""}.`;
  } else {
    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  }

  const updated = await db.partnerEarning.update({
    where: { id: earningId },
    data,
    select: { amount: true, status: true, onHold: true },
  });

  await adminAudit({
    adminId: admin.id,
    actor: admin.name,
    action: auditAction,
    entity: "PartnerEarning",
    entityId: earningId,
    before,
    after: { amount: updated.amount, status: updated.status, onHold: updated.onHold },
  });

  if (partnerMsg) {
    await notifyPartner({
      partnerId: earning.partnerId,
      type: "PARTNER_EARNING",
      title: "Earning update",
      message: partnerMsg,
      link: "/partner/earnings",
    });
  }

  return NextResponse.json({ success: true, message: "Update ho gaya" });
}
