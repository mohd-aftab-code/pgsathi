/**
 * app/api/admin/partners/[id]/route.ts
 * PATCH — admin approves / rejects / suspends / reactivates a partner.
 * Every transition is audited and the partner is notified.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdmin, adminAudit } from "@/lib/admin-audit";
import { can, PERMISSIONS } from "@/lib/permissions";
import { notify } from "@/lib/notifications";
import { sendPartnerStatusEmail } from "@/lib/email";
import type { PartnerStatus } from "@prisma/client";

const VALID: PartnerStatus[] = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const partnerId = parseInt(id);
  if (Number.isNaN(partnerId)) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const status = body.status as PartnerStatus;
  if (!VALID.includes(status)) return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });

  const perm = status === "SUSPENDED" ? PERMISSIONS.PARTNER_SUSPEND : PERMISSIONS.PARTNER_APPROVE;
  if (!(await can("ADMIN", perm))) {
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
  }

  const existing = await db.partnerProfile.findUnique({
    where: { id: partnerId },
    select: { id: true, status: true, userId: true, user: { select: { name: true, email: true } } },
  });
  if (!existing) return NextResponse.json({ success: false, message: "Partner nahi mila" }, { status: 404 });

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
  if (existing.user.email) {
    await sendPartnerStatusEmail(existing.user.email, existing.user.name, status, updated.rejectReason || undefined).catch((e) => {
      console.error("[PARTNER_STATUS_EMAIL_ERROR]", e);
    });
  }

  return NextResponse.json({ success: true, message: `Partner ${status.toLowerCase()} ho gaya` });
}
