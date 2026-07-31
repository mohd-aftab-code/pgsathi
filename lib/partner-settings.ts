/**
 * lib/partner-settings.ts (server-only)
 * The Refer & Earn programme's tunable rules, in one place.
 *
 * These live in the database rather than env so an admin can change the hold
 * window, payout threshold or TDS rate without a deploy — and so every change
 * is auditable. Reads are cached for a minute because the commission engine
 * touches them on every paid invoice.
 */
import "server-only";
import { db } from "@/lib/db";

export type ProgramSettings = {
  holdDays: number;
  autoApproveEnabled: boolean;
  autoApproveMaxAmount: number;
  minPayoutAmount: number;
  payoutDayOfMonth: number;
  makerCheckerAbove: number;
  tdsEnabled: boolean;
  tdsRateWithPan: number;
  tdsRateWithoutPan: number;
  tdsThresholdYearly: number;
  goldAfterConversions: number;
  platinumAfterConversions: number;
  goldBonusPercent: number;
  platinumBonusPercent: number;
};

/**
 * Used when the settings row is missing or unreadable. These match the column
 * defaults, so a database that has not been seeded still behaves sanely rather
 * than, say, auto-approving everything with a zero-day hold.
 */
export const DEFAULT_SETTINGS: ProgramSettings = {
  holdDays: 7,
  autoApproveEnabled: true,
  autoApproveMaxAmount: 5000,
  minPayoutAmount: 500,
  payoutDayOfMonth: 5,
  makerCheckerAbove: 10000,
  tdsEnabled: false,
  tdsRateWithPan: 5,
  tdsRateWithoutPan: 20,
  tdsThresholdYearly: 15000,
  goldAfterConversions: 10,
  platinumAfterConversions: 50,
  goldBonusPercent: 2,
  platinumBonusPercent: 5,
};

const CACHE_TTL_MS = 60_000;
let cache: { at: number; value: ProgramSettings } | null = null;

/** Programme settings, cached for a minute. */
export async function getProgramSettings(): Promise<ProgramSettings> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;

  try {
    const row = await db.partnerProgramSetting.findUnique({ where: { id: 1 } });
    const value: ProgramSettings = row
      ? {
          holdDays: row.holdDays,
          autoApproveEnabled: row.autoApproveEnabled,
          autoApproveMaxAmount: row.autoApproveMaxAmount,
          minPayoutAmount: row.minPayoutAmount,
          payoutDayOfMonth: row.payoutDayOfMonth,
          makerCheckerAbove: row.makerCheckerAbove,
          tdsEnabled: row.tdsEnabled,
          tdsRateWithPan: row.tdsRateWithPan,
          tdsRateWithoutPan: row.tdsRateWithoutPan,
          tdsThresholdYearly: row.tdsThresholdYearly,
          goldAfterConversions: row.goldAfterConversions,
          platinumAfterConversions: row.platinumAfterConversions,
          goldBonusPercent: row.goldBonusPercent,
          platinumBonusPercent: row.platinumBonusPercent,
        }
      : DEFAULT_SETTINGS;
    cache = { at: Date.now(), value };
    return value;
  } catch (e) {
    // A settings read must never break a payment flow — fall back to defaults.
    console.error("[partner-settings] read failed, using defaults:", e);
    return DEFAULT_SETTINGS;
  }
}

/** Call after any write so the next read sees the change immediately. */
export function invalidateProgramSettings(): void {
  cache = null;
}

/** Ensures the singleton row exists and returns it. */
export async function ensureProgramSettingsRow() {
  return db.partnerProgramSetting.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });
}

/** The date the next scheduled payout run falls on, for display to partners. */
export function nextPayoutDate(dayOfMonth: number, from = new Date()): Date {
  const day = Math.min(Math.max(1, dayOfMonth), 28);
  const candidate = new Date(from.getFullYear(), from.getMonth(), day);
  if (candidate >= new Date(from.getFullYear(), from.getMonth(), from.getDate())) return candidate;
  return new Date(from.getFullYear(), from.getMonth() + 1, day);
}

/** "2026-07" — the cycle label a payout created now belongs to. */
export function currentPeriodLabel(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
