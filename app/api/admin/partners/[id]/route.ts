/**
 * app/api/admin/partners/[id]/route.ts
 * PATCH — admin controls over one partner.
 *   • status change (approve / reject / suspend / reactivate)  — body.status
 *   • body.action: "kyc_verify" | "kyc_revoke" | "flag" | "unflag"
 *                | "set_commission" | "set_tier" | "set_parent" | "archive" | "unarchive"
 * DELETE — archives the partner (see the note on DELETE below).
 *
 * Every transition is audited and the partner is notified.
 *
 * Permissions deliberately reuse PARTNER_APPROVE / PARTNER_SUSPEND rather than
 * introducing new keys: `lib/permissions` is fail-closed, so an unseeded key
 * would silently lock the feature out entirely.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdmin, adminAudit } from "@/lib/admin-audit";
import { can, PERMISSIONS } from "@/lib/permissions";
import { notify } from "@/lib/notifications";
import { notifyPartner } from "@/lib/partner-notify";
import { sendPartnerStatusEmail } from "@/lib/email";
import { kycGaps } from "@/lib/partner-payouts";
import type { PartnerStatus } from "@prisma/client";

const VALID: PartnerStatus[] = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const partnerId = parseInt(id);
  if (Number.isNaN(partnerId)) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));

  const existing = await db.partnerProfile.findUnique({
    where: { id: partnerId },
    select: {
      id: true, status: true, userId: true, riskFlagged: true, riskReason: true,
      kycVerifiedAt: true, archivedAt: true, commissionOverridePercent: true,
      tierOverride: true, parentPartnerId: true, parentOverridePercent: true,
      panNumber: true, upiId: true, bankName: true, bankAccountNo: true, bankIfsc: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!existing) return NextResponse.json({ success: false, message: "Partner nahi mila" }, { status: 404 });

  // ── Non-status actions ────────────────────────────────────────────────────
  const action = body.action as string | undefined;
  if (action) {
    if (!(await can("ADMIN", PERMISSIONS.PARTNER_APPROVE))) {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
    }

    let data: any = {};
    let auditAction = "";
    let partnerMsg = "";

    if (action === "kyc_verify") {
      // Verification means an admin has actually looked at the PAN and the
      // account details. Signing off on details that are not even present would
      // make the payout gate meaningless.
      const gaps = kycGaps(existing);
      const missing = gaps.filter((g) => g !== "admin verification");
      if (missing.length) {
        return NextResponse.json(
          { success: false, message: `Verify nahi kar sakte — partner ne abhi nahi diya: ${missing.join(", ")}` },
          { status: 400 },
        );
      }
      data = { kycVerifiedAt: new Date(), kycVerifiedBy: admin.id };
      auditAction = "partner.kyc_verified";
      partnerMsg = "Aapki payout details verify ho gayi hain — ab payout ban sakta hai.";
    } else if (action === "kyc_revoke") {
      data = { kycVerifiedAt: null, kycVerifiedBy: null };
      auditAction = "partner.kyc_revoked";
      partnerMsg = "Aapki payout details dobara verify honi hain. Kripya details check karein.";
    } else if (action === "flag") {
      const reason = String(body.reason ?? "").trim().slice(0, 300) || "Under review";
      data = { riskFlagged: true, riskReason: reason };
      auditAction = "partner.flagged";
      partnerMsg = `Aapka account review par hai (${reason}). Nayi earnings hold par rahengi.`;
    } else if (action === "unflag") {
      data = { riskFlagged: false, riskReason: null };
      auditAction = "partner.unflagged";
      partnerMsg = "Aapke account ka review poora ho gaya — earnings normal chalengi.";
    } else if (action === "set_commission") {
      const raw = body.commissionOverridePercent;
      const pct = raw === null || raw === "" ? null : parseInt(String(raw));
      if (pct !== null && (Number.isNaN(pct) || pct < 0 || pct > 100)) {
        return NextResponse.json({ success: false, message: "Commission 0–100% ke beech hona chahiye" }, { status: 400 });
      }
      data = { commissionOverridePercent: pct };
      auditAction = "partner.commission_override";
      partnerMsg = pct
        ? `Aapki commission rate ab ${pct}% set ki gayi hai.`
        : "Aapki custom commission rate hata di gayi — ab plan ki standard rate lagegi.";
    } else if (action === "set_tier") {
      const tier = body.tierOverride;
      if (tier !== null && !["SILVER", "GOLD", "PLATINUM"].includes(String(tier))) {
        return NextResponse.json({ success: false, message: "Invalid tier" }, { status: 400 });
      }
      data = { tierOverride: tier === null ? null : String(tier) };
      auditAction = "partner.tier_override";
      partnerMsg = tier ? `Aapka tier ${tier} set kiya gaya.` : "Aapka tier ab conversions se auto calculate hoga.";
    } else if (action === "set_parent") {
      const raw = body.parentPartnerId;
      const parentId = raw === null || raw === "" ? null : parseInt(String(raw));
      const pct = Math.max(0, Math.min(100, parseInt(String(body.parentOverridePercent ?? 0)) || 0));

      if (parentId !== null) {
        if (Number.isNaN(parentId)) {
          return NextResponse.json({ success: false, message: "Invalid parent partner" }, { status: 400 });
        }
        if (parentId === partnerId) {
          return NextResponse.json({ success: false, message: "Partner khud ka parent nahi ho sakta" }, { status: 400 });
        }
        // A cycle would make override creation recurse forever.
        const parent = await db.partnerProfile.findUnique({
          where: { id: parentId },
          select: { id: true, parentPartnerId: true },
        });
        if (!parent) return NextResponse.json({ success: false, message: "Parent partner nahi mila" }, { status: 404 });
        if (parent.parentPartnerId === partnerId) {
          return NextResponse.json({ success: false, message: "Ye do partners ek dusre ke parent nahi ban sakte" }, { status: 400 });
        }
      }

      data = { parentPartnerId: parentId, parentOverridePercent: parentId ? pct : 0 };
      auditAction = "partner.parent_set";
      partnerMsg = parentId
        ? `Aap ab ek channel partner ke under hain — unhe aapki earnings ka ${pct}% override milega.`
        : "Aapka channel partner link hata diya gaya.";
    } else if (action === "archive") {
      data = { archivedAt: new Date() };
      auditAction = "partner.archived";
      partnerMsg = "Aapka partner account archive kar diya gaya hai.";
    } else if (action === "unarchive") {
      data = { archivedAt: null };
      auditAction = "partner.unarchived";
      partnerMsg = "Aapka partner account wapas active kar diya gaya hai.";
    } else {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    const updated = await db.partnerProfile.update({ where: { id: partnerId }, data, select: { id: true } });

    await adminAudit({
      adminId: admin.id,
      actor: admin.name,
      action: auditAction,
      entity: "PartnerProfile",
      entityId: partnerId,
      before: {
        riskFlagged: existing.riskFlagged,
        kycVerifiedAt: existing.kycVerifiedAt,
        commissionOverridePercent: existing.commissionOverridePercent,
        tierOverride: existing.tierOverride,
        parentPartnerId: existing.parentPartnerId,
        archivedAt: existing.archivedAt,
      },
      after: data,
    });

    if (partnerMsg) {
      await notifyPartner({
        partnerId: updated.id,
        type: "SYSTEM",
        title: "Partner account update",
        message: partnerMsg,
        link: "/partner/profile",
      });
    }

    return NextResponse.json({ success: true, message: "Update ho gaya" });
  }

  // ── Status transition (the original behaviour) ────────────────────────────
  const status = body.status as PartnerStatus;
  if (!VALID.includes(status)) return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });

  const perm = status === "SUSPENDED" ? PERMISSIONS.PARTNER_SUSPEND : PERMISSIONS.PARTNER_APPROVE;
  if (!(await can("ADMIN", perm))) {
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
  }

  const updated = await db.partnerProfile.update({
    where: { id: partnerId },
    data: {
      status,
      approvedAt: status === "APPROVED" ? new Date() : existing.status === "APPROVED" ? undefined : null,
      approvedBy: status === "APPROVED" ? admin.id : undefined,
      rejectReason: status === "REJECTED" ? String(body.reason ?? "").slice(0, 300) || null : null,
    },
    select: { status: true, rejectReason: true },
  });

  // Earnings already banked by a partner who is now suspended or rejected must
  // not quietly become payable. They stay on the record — the referral was real
  // — but an admin has to release them deliberately.
  if (status === "SUSPENDED" || status === "REJECTED") {
    await db.partnerEarning.updateMany({
      where: { partnerId, status: "PENDING", onHold: false },
      data: { onHold: true, holdReason: `Partner ${status.toLowerCase()}` },
    });
  } else if (status === "APPROVED" && existing.status !== "APPROVED") {
    // Reinstated: release only the holds this system placed for that reason.
    await db.partnerEarning.updateMany({
      where: { partnerId, status: "PENDING", onHold: true, holdReason: { startsWith: "Partner " } },
      data: { onHold: false, holdReason: null },
    });
  }

  await adminAudit({
    adminId: admin.id,
    actor: admin.name,
    action: `partner.${status.toLowerCase()}`,
    entity: "PartnerProfile",
    entityId: partnerId,
    before: { status: existing.status },
    after: { status: updated.status },
  });

  const msg =
    status === "APPROVED" ? "Aapka partner account approve ho gaya! Ab poora dashboard use kar sakte hain."
    : status === "REJECTED" ? "Aapki partner application approve nahi ho payi."
    : status === "SUSPENDED" ? "Aapka partner account suspend kar diya gaya hai."
    : "Aapke account ka status update hua hai.";
  await notify({ userId: existing.userId, type: "SYSTEM", title: "Partner account update", message: msg, link: "/partner/dashboard" });

  // Email Notification
  if (existing.user.email && !existing.user.email.includes("@pgsathi.in")) {
    await sendPartnerStatusEmail(existing.user.email, existing.user.name, status, updated.rejectReason || undefined).catch((e) => {
      console.error("[PARTNER_STATUS_EMAIL_ERROR]", e);
    });
  }

  return NextResponse.json({ success: true, message: `Partner ${status.toLowerCase()} ho gaya` });
}

/**
 * Archives the partner. Deliberately NOT a delete.
 *
 * Deleting the user cascaded into PartnerProfile and from there into every
 * PartnerEarning the partner ever had — erasing the record of money that was
 * actually paid out, and with it any chance of reconciling it. An archived
 * partner keeps their history, stops resolving as a referral code, and can be
 * restored.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  if (!(await can("ADMIN", PERMISSIONS.PARTNER_APPROVE))) {
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
  }

  const { id } = await params;
  const partnerId = parseInt(id);
  if (Number.isNaN(partnerId)) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

  const existing = await db.partnerProfile.findUnique({
    where: { id: partnerId },
    select: { id: true, userId: true, status: true, archivedAt: true },
  });
  if (!existing) return NextResponse.json({ success: false, message: "Partner nahi mila" }, { status: 404 });

  await db.$transaction([
    db.partnerProfile.update({
      where: { id: partnerId },
      data: { archivedAt: new Date(), status: "SUSPENDED" },
    }),
    // Anything not yet paid stops being payable until someone decides.
    db.partnerEarning.updateMany({
      where: { partnerId, status: "PENDING" },
      data: { onHold: true, holdReason: "Partner archived" },
    }),
    // The login stops working; the history stays.
    db.user.update({ where: { id: existing.userId }, data: { isActive: false } }),
  ]);

  await adminAudit({
    adminId: admin.id,
    actor: admin.name,
    action: "partner.archived",
    entity: "PartnerProfile",
    entityId: partnerId,
    before: { status: existing.status, archivedAt: existing.archivedAt },
    after: { status: "SUSPENDED", archivedAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    message: "Partner archive ho gaya — history aur payouts ka record surakshit hai",
  });
}
