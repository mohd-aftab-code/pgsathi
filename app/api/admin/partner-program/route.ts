/**
 * app/api/admin/partner-program/route.ts
 * GET   — current programme settings.
 * PATCH — change them.
 *
 * These rules (hold window, auto-approve, payout minimum, TDS rates, tier
 * thresholds) used to be constants scattered through the code or not exist at
 * all. Keeping them here means an admin can tune the programme without a
 * deploy, and every change lands in the audit log.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdmin, adminAudit } from "@/lib/admin-audit";
import { can, PERMISSIONS } from "@/lib/permissions";
import { db } from "@/lib/db";
import { ensureProgramSettingsRow, invalidateProgramSettings } from "@/lib/partner-settings";

/** [field, min, max] — every value is clamped, never trusted raw. */
const NUMERIC_FIELDS: [string, number, number][] = [
  ["holdDays", 0, 90],
  ["autoApproveMaxAmount", 0, 1_000_000],
  ["minPayoutAmount", 0, 100_000],
  ["payoutDayOfMonth", 1, 28],
  ["makerCheckerAbove", 0, 1_000_000],
  ["tdsRateWithPan", 0, 30],
  ["tdsRateWithoutPan", 0, 30],
  ["tdsThresholdYearly", 0, 1_000_000],
  ["goldAfterConversions", 1, 10_000],
  ["platinumAfterConversions", 1, 10_000],
  ["goldBonusPercent", 0, 100],
  ["platinumBonusPercent", 0, 100],
];

const BOOLEAN_FIELDS = ["autoApproveEnabled", "tdsEnabled"];

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const row = await ensureProgramSettingsRow();
  return NextResponse.json({ success: true, data: row });
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  // Payout rules decide when money leaves, so this sits behind the payout
  // permission rather than a generic settings one.
  if (!(await can("ADMIN", PERMISSIONS.PAYOUT_CREATE))) {
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const before = await ensureProgramSettingsRow();

  const data: any = {};
  for (const [field, min, max] of NUMERIC_FIELDS) {
    if (body[field] === undefined) continue;
    const n = parseInt(String(body[field]));
    if (Number.isNaN(n)) {
      return NextResponse.json({ success: false, message: `${field} me sahi number daalein` }, { status: 400 });
    }
    data[field] = Math.max(min, Math.min(max, n));
  }
  for (const field of BOOLEAN_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field] === true;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ success: false, message: "Kuch change karne ko nahi hai" }, { status: 400 });
  }

  // Platinum must stay above Gold, or the tier ladder silently inverts.
  const gold = data.goldAfterConversions ?? before.goldAfterConversions;
  const platinum = data.platinumAfterConversions ?? before.platinumAfterConversions;
  if (platinum <= gold) {
    return NextResponse.json(
      { success: false, message: "Platinum ka target Gold se zyada hona chahiye" },
      { status: 400 },
    );
  }

  data.updatedBy = admin.id;
  const after = await db.partnerProgramSetting.update({ where: { id: 1 }, data });
  invalidateProgramSettings();

  await adminAudit({
    adminId: admin.id,
    actor: admin.name,
    action: "partner_program.settings_updated",
    entity: "PartnerProgramSetting",
    entityId: 1,
    before: Object.fromEntries(Object.keys(data).filter((k) => k !== "updatedBy").map((k) => [k, (before as any)[k]])),
    after: Object.fromEntries(Object.keys(data).filter((k) => k !== "updatedBy").map((k) => [k, (after as any)[k]])),
  });

  return NextResponse.json({ success: true, message: "Settings save ho gayi", data: after });
}
