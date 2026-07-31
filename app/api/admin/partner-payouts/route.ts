/**
 * app/api/admin/partner-payouts/route.ts
 * POST — pay a partner in one batch.
 *
 * Collects every APPROVED earning that isn't already attached to a payout and
 * creates one PROCESSING payout for the total. This is how a real payout works:
 * one transfer per cycle, not one per PG.
 *
 * The heavy lifting (KYC gate, minimum balance, TDS, idempotency, the
 * transaction that attaches the earnings) lives in lib/partner-payouts so the
 * bulk route and the single-earning route cannot drift from it.
 *
 * A payout created here is NOT complete — the money has not moved yet. It is
 * finished by PATCHing /api/admin/partner-payouts/[id] with the UTR.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdmin, adminAudit } from "@/lib/admin-audit";
import { can, PERMISSIONS } from "@/lib/permissions";
import { createPayout, getBulkCandidates } from "@/lib/partner-payouts";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  if (!(await can("ADMIN", PERMISSIONS.PAYOUT_CREATE))) {
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
  }

  const candidates = await getBulkCandidates();
  return NextResponse.json({
    success: true,
    data: candidates,
    payable: candidates.filter((c) => !c.blocked).length,
    blocked: candidates.filter((c) => c.blocked).length,
  });
}

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  if (!(await can("ADMIN", PERMISSIONS.PAYOUT_CREATE))) {
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  // ── Bulk: every partner whose balance clears the rules ────────────────────
  if (body.mode === "bulk") {
    const candidates = await getBulkCandidates();
    const eligible = candidates.filter((c) => !c.blocked);
    const results: { partnerId: number; name: string; ok: boolean; message: string; amount?: number }[] = [];

    for (const c of eligible) {
      const res = await createPayout({
        partnerId: c.partnerId,
        adminId: admin.id,
        method: body.method,
        notes: body.notes ?? "Bulk cycle payout",
      });
      results.push(
        res.ok
          ? { partnerId: c.partnerId, name: c.name, ok: true, message: "created", amount: res.net }
          : { partnerId: c.partnerId, name: c.name, ok: false, message: res.message },
      );
    }

    const created = results.filter((r) => r.ok);
    await adminAudit({
      adminId: admin.id,
      actor: admin.name,
      action: "payout.bulk_created",
      entity: "PartnerPayout",
      before: { eligible: eligible.length, blocked: candidates.length - eligible.length },
      after: { created: created.length, total: created.reduce((s, r) => s + (r.amount ?? 0), 0) },
    });

    // Never report a clean sweep when partners were skipped — a silent skip
    // reads as "everyone got paid".
    return NextResponse.json({
      success: true,
      message: `${created.length} payout ban gaye${
        candidates.length - eligible.length > 0 ? `, ${candidates.length - eligible.length} partner skip hue` : ""
      }`,
      data: { results, skipped: candidates.filter((c) => c.blocked) },
    });
  }

  // ── Single partner ────────────────────────────────────────────────────────
  const partnerId = parseInt(String(body.partnerId));
  if (Number.isNaN(partnerId)) {
    return NextResponse.json({ success: false, message: "Invalid partner" }, { status: 400 });
  }

  const res = await createPayout({
    partnerId,
    adminId: admin.id,
    method: body.method,
    reference: body.reference ?? null,
    notes: body.notes ?? null,
    ignoreMinimum: body.ignoreMinimum === true,
  });

  if (!res.ok) {
    return NextResponse.json({ success: false, code: res.code, message: res.message }, { status: 400 });
  }

  await adminAudit({
    adminId: admin.id,
    actor: admin.name,
    action: "payout.created",
    entity: "PartnerPayout",
    entityId: res.payoutId,
    before: { earningCount: res.count, status: "APPROVED" },
    after: {
      payoutId: res.payoutId,
      gross: res.gross,
      tdsRate: res.tds.rate,
      tdsAmount: res.tds.amount,
      net: res.net,
      status: "PROCESSING",
    },
  });

  return NextResponse.json({
    success: true,
    message:
      `₹${res.net.toLocaleString("en-IN")} ka payout ban gaya (${res.count} earnings)` +
      (res.tds.amount > 0 ? ` — TDS ${res.tds.rate}% ₹${res.tds.amount.toLocaleString("en-IN")} kaata gaya` : "") +
      `. Transfer karke UTR daalein tabhi complete hoga.`,
    data: {
      payoutId: res.payoutId,
      gross: res.gross,
      tds: res.tds,
      amount: res.net,
      count: res.count,
      needsApproval: res.needsApproval,
    },
  });
}
