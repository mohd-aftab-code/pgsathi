/**
 * app/api/admin/attribution/route.ts
 * PATCH — move an owner from one partner to another (or to nobody).
 *
 * "First touch wins, never overwritten" is the right default and stays the
 * default — it is what keeps payouts unambiguous. But it had no escape hatch,
 * so every genuine dispute ended as a hand-written UPDATE against production:
 * no permission check, no audit trail, no notification to either side.
 *
 * The rule this enforces: re-attribution changes the FUTURE only. Earnings
 * already approved or paid belong to whoever earned them at the time, and
 * rewriting them would desync money from the payouts that carried it. Pending,
 * not-yet-approved earnings move with the owner, because nothing has been
 * promised on them yet.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdmin, adminAudit } from "@/lib/admin-audit";
import { can, PERMISSIONS } from "@/lib/permissions";
import { notifyPartner } from "@/lib/partner-notify";

export async function PATCH(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  // Re-attribution moves money, so it sits behind the same permission as
  // approving a partner rather than a general user-edit permission.
  if (!(await can("ADMIN", PERMISSIONS.PARTNER_APPROVE))) {
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const ownerId = parseInt(String(body.ownerId));
  const rawPartner = body.partnerId;
  const newPartnerId = rawPartner === null || rawPartner === "" ? null : parseInt(String(rawPartner));
  const reason = String(body.reason ?? "").trim();
  const moveePending = body.movePending !== false; // default: yes

  if (Number.isNaN(ownerId)) {
    return NextResponse.json({ success: false, message: "Invalid owner" }, { status: 400 });
  }
  if (newPartnerId !== null && Number.isNaN(newPartnerId)) {
    return NextResponse.json({ success: false, message: "Invalid partner" }, { status: 400 });
  }
  if (reason.length < 3) {
    return NextResponse.json({ success: false, message: "Re-attribution ki wajah likhna zaroori hai" }, { status: 400 });
  }

  const owner = await db.user.findUnique({
    where: { id: ownerId },
    select: { id: true, name: true, role: true, partnerId: true, partnerAttributedAt: true },
  });
  if (!owner) return NextResponse.json({ success: false, message: "Owner nahi mila" }, { status: 404 });
  if (owner.partnerId === newPartnerId) {
    return NextResponse.json({ success: false, message: "Attribution pehle se yahi hai" }, { status: 400 });
  }

  let newPartner: { id: number; partnerCode: string; status: string } | null = null;
  if (newPartnerId !== null) {
    newPartner = await db.partnerProfile.findUnique({
      where: { id: newPartnerId },
      select: { id: true, partnerCode: true, status: true },
    });
    if (!newPartner) return NextResponse.json({ success: false, message: "Naya partner nahi mila" }, { status: 404 });
    if (newPartner.status !== "APPROVED") {
      return NextResponse.json(
        { success: false, message: "Owner sirf APPROVED partner ko assign ho sakta hai" },
        { status: 400 },
      );
    }
  }

  const oldPartnerId = owner.partnerId;

  const moved = await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: ownerId },
      data: {
        partnerId: newPartnerId,
        // The commission window restarts with the new partner; keeping the old
        // date would silently shorten (or extend) their entitlement.
        partnerAttributedAt: newPartnerId ? new Date() : null,
      },
    });

    if (!moveePending) return 0;

    // Only PENDING, unpaid, un-promised earnings follow the owner.
    const res = await tx.partnerEarning.updateMany({
      where: { ownerId, status: "PENDING", payoutId: null },
      data: newPartnerId
        ? { partnerId: newPartnerId, notes: `Re-attributed: ${reason}`.slice(0, 500) }
        : { status: "CANCELLED", onHold: false, notes: `Attribution removed: ${reason}`.slice(0, 500) },
    });
    return res.count;
  });

  await adminAudit({
    adminId: admin.id,
    actor: admin.name,
    action: "owner.reattributed",
    entity: "User",
    entityId: ownerId,
    before: { partnerId: oldPartnerId, partnerAttributedAt: owner.partnerAttributedAt },
    after: { partnerId: newPartnerId, reason, pendingEarningsMoved: moved },
  });

  // Both sides hear about it. A partner discovering by accident that an owner
  // left their list is how disputes turn into escalations.
  if (oldPartnerId) {
    await notifyPartner({
      partnerId: oldPartnerId,
      type: "SYSTEM",
      title: "Owner attribution badli",
      message: `${owner.name} ab aapke owners me nahi hain (${reason}). Jo earnings approve ya pay ho chuki hain wo aapki hi rahengi.`,
      link: "/partner/owners",
    });
  }
  if (newPartnerId) {
    await notifyPartner({
      partnerId: newPartnerId,
      type: "SYSTEM",
      title: "Naya owner aapko assign hua",
      message: `${owner.name} ab aapke owners me shamil hain (${reason}). Aage ke sabhi payments par commission aapko milega.`,
      link: "/partner/owners",
    });
  }

  return NextResponse.json({
    success: true,
    message: newPartnerId
      ? `${owner.name} ab ${newPartner!.partnerCode} ke under hain${moved ? ` — ${moved} pending earning bhi move hui` : ""}`
      : `${owner.name} ki partner attribution hata di gayi${moved ? ` — ${moved} pending earning cancel hui` : ""}`,
    data: { ownerId, partnerId: newPartnerId, pendingEarningsMoved: moved },
  });
}
