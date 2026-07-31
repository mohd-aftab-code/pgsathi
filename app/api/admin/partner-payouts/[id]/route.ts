/**
 * app/api/admin/partner-payouts/[id]/route.ts
 * PATCH — finish or undo one payout.
 *   action: "complete" | "reverse"
 *
 * `complete` is the moment the system is allowed to claim the money moved, and
 * it demands a UTR to say so. `reverse` is the only way back out of PAID: it
 * returns every earning the payout swallowed to APPROVED rather than editing
 * them, so the failed attempt and its correction both stay on the record.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdmin, adminAudit } from "@/lib/admin-audit";
import { can, PERMISSIONS } from "@/lib/permissions";
import { completePayout, reversePayout } from "@/lib/partner-payouts";
import { getProgramSettings } from "@/lib/partner-settings";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  if (!(await can("ADMIN", PERMISSIONS.PAYOUT_CREATE))) {
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
  }

  const { id } = await params;
  const payoutId = parseInt(id);
  if (Number.isNaN(payoutId)) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const action = body.action as "complete" | "reverse";

  const existing = await db.partnerPayout.findUnique({
    where: { id: payoutId },
    select: { id: true, status: true, amount: true, createdBy: true },
  });
  if (!existing) return NextResponse.json({ success: false, message: "Payout nahi mila" }, { status: 404 });

  if (action === "complete") {
    // Maker-checker: above the configured amount, the admin who created the
    // payout may not also be the one who confirms the money left.
    const settings = await getProgramSettings();
    if (
      settings.makerCheckerAbove > 0 &&
      existing.amount >= settings.makerCheckerAbove &&
      existing.createdBy === admin.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `₹${existing.amount.toLocaleString("en-IN")} ka payout dusre admin se complete karwana hoga (maker-checker limit ₹${settings.makerCheckerAbove.toLocaleString("en-IN")})`,
        },
        { status: 403 },
      );
    }

    const res = await completePayout({
      payoutId,
      reference: String(body.reference ?? ""),
      proofUrl: body.proofUrl ?? null,
      adminId: admin.id,
    });
    if (!res.ok) return NextResponse.json({ success: false, message: res.message }, { status: 400 });

    await adminAudit({
      adminId: admin.id,
      actor: admin.name,
      action: "payout.completed",
      entity: "PartnerPayout",
      entityId: payoutId,
      before: { status: existing.status },
      after: { status: "COMPLETED", reference: String(body.reference).slice(0, 60) },
    });

    return NextResponse.json({ success: true, message: "Payout complete ho gaya" });
  }

  if (action === "reverse") {
    const reason = String(body.reason ?? "").trim();
    if (reason.length < 3) {
      return NextResponse.json({ success: false, message: "Reverse karne ki wajah likhein" }, { status: 400 });
    }

    const res = await reversePayout({ payoutId, reason, adminId: admin.id });
    if (!res.ok) return NextResponse.json({ success: false, message: res.message }, { status: 400 });

    await adminAudit({
      adminId: admin.id,
      actor: admin.name,
      action: "payout.reversed",
      entity: "PartnerPayout",
      entityId: payoutId,
      before: { status: existing.status, amount: existing.amount },
      after: { status: "FAILED", reason, earningsRestored: res.restored },
    });

    return NextResponse.json({
      success: true,
      message: `Payout reverse ho gaya — ${res.restored} earning wapas approved hain`,
    });
  }

  return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
}
