/**
 * lib/partner-tier.ts (server-only)
 * Partner tiers — and what they are actually worth.
 *
 * The tier used to be a label computed in the dashboard component with no
 * effect on anything. It now decides a real commission bonus, so it has to be
 * derived in one place and snapshotted onto the earning it was applied to.
 *
 * A "conversion" is a distinct owner this partner brought in who has produced
 * at least one commission-bearing payment. Counting owners (not PGs, not
 * earnings) keeps it consistent with how commission itself works.
 */
import "server-only";
import { db } from "@/lib/db";
import { getProgramSettings, type ProgramSettings } from "@/lib/partner-settings";

export type PartnerTier = "SILVER" | "GOLD" | "PLATINUM";

export const TIER_LABEL: Record<PartnerTier, string> = {
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
};

/** Tier from a conversion count, honouring an admin's manual pin. */
export function tierFor(
  conversions: number,
  settings: ProgramSettings,
  override?: string | null,
): PartnerTier {
  if (override === "SILVER" || override === "GOLD" || override === "PLATINUM") return override;
  if (conversions >= settings.platinumAfterConversions) return "PLATINUM";
  if (conversions >= settings.goldAfterConversions) return "GOLD";
  return "SILVER";
}

/** Extra commission this tier adds, as a percentage of the base commission. */
export function tierBonusPercent(tier: PartnerTier, settings: ProgramSettings): number {
  if (tier === "PLATINUM") return settings.platinumBonusPercent;
  if (tier === "GOLD") return settings.goldBonusPercent;
  return 0;
}

/** How many distinct owners of this partner have ever produced a commission. */
export async function countConversions(partnerId: number): Promise<number> {
  const rows = await db.partnerEarning.findMany({
    where: { partnerId, kind: "REFERRAL", status: { not: "CANCELLED" }, ownerId: { not: null } },
    select: { ownerId: true },
    distinct: ["ownerId"],
  });
  return rows.length;
}

export type TierProgress = {
  tier: PartnerTier;
  label: string;
  conversions: number;
  bonusPercent: number;
  /** null once the partner is Platinum. */
  next: { tier: PartnerTier; label: string; needed: number; bonusPercent: number } | null;
  /** 0–100, progress towards `next` (100 when there is no next tier). */
  progress: number;
};

/**
 * Tier plus what it takes to reach the next one — the dashboard's
 * "Gold tak 3 aur conversions" line depends on this.
 */
export async function getTierProgress(
  partnerId: number,
  tierOverride?: string | null,
): Promise<TierProgress> {
  const settings = await getProgramSettings();
  const conversions = await countConversions(partnerId);
  const tier = tierFor(conversions, settings, tierOverride);

  let next: TierProgress["next"] = null;
  let progress = 100;

  if (tier === "SILVER") {
    next = {
      tier: "GOLD",
      label: TIER_LABEL.GOLD,
      needed: Math.max(0, settings.goldAfterConversions - conversions),
      bonusPercent: settings.goldBonusPercent,
    };
    progress = settings.goldAfterConversions > 0
      ? Math.min(100, Math.round((conversions / settings.goldAfterConversions) * 100))
      : 100;
  } else if (tier === "GOLD") {
    next = {
      tier: "PLATINUM",
      label: TIER_LABEL.PLATINUM,
      needed: Math.max(0, settings.platinumAfterConversions - conversions),
      bonusPercent: settings.platinumBonusPercent,
    };
    const span = settings.platinumAfterConversions - settings.goldAfterConversions;
    progress = span > 0
      ? Math.min(100, Math.round(((conversions - settings.goldAfterConversions) / span) * 100))
      : 100;
  }

  return {
    tier,
    label: TIER_LABEL[tier],
    conversions,
    bonusPercent: tierBonusPercent(tier, settings),
    next,
    progress: Math.max(0, progress),
  };
}
