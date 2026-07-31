/**
 * lib/partner-funnel.ts (server-only)
 * Click → signup → paid, per partner, plus the leaderboard built on top of it.
 *
 * Before referral clicks were recorded there was no denominator: a partner saw
 * "18 owners" with no idea whether that came from 20 conversations or 400, and
 * an admin had no way to tell a partner who converts from one who spams links.
 */
import "server-only";
import { db } from "@/lib/db";

export type PartnerFunnel = {
  clicks: number;
  signups: number;
  paidOwners: number;
  /** signups ÷ clicks, as a percentage */
  clickToSignup: number;
  /** paid ÷ signups, as a percentage */
  signupToPaid: number;
  earned: number;
};

const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : 0);

export async function getPartnerFunnel(partnerId: number, since?: Date): Promise<PartnerFunnel> {
  const clickWhere = { partnerId, ...(since ? { createdAt: { gte: since } } : {}) };

  const [clicks, signups, owners, earned] = await Promise.all([
    db.referralClick.count({ where: clickWhere }),
    db.referralClick.count({ where: { ...clickWhere, convertedUserId: { not: null } } }),
    // Every owner attributed to this partner, however they arrived — a partner
    // who registers owners by hand has no clicks but very real conversions.
    db.user.findMany({
      where: { partnerId, ...(since ? { createdAt: { gte: since } } : {}) },
      select: { id: true },
    }),
    db.partnerEarning.aggregate({
      where: { partnerId, status: { not: "CANCELLED" }, ...(since ? { createdAt: { gte: since } } : {}) },
      _sum: { amount: true },
    }),
  ]);

  const ownerIds = owners.map((o) => o.id);
  const paidOwners = ownerIds.length
    ? (
        await db.subscription.findMany({
          where: {
            userId: { in: ownerIds },
            status: { in: ["ACTIVE", "TRIAL"] },
            endDate: { gt: new Date() },
            plan: { price: { gt: 0 } },
          },
          select: { userId: true },
          distinct: ["userId"],
        })
      ).length
    : 0;

  // Signups counts link-driven registrations; owners counts everything. The
  // conversion rate uses `owners` as the denominator so a partner who works the
  // phone is not shown a misleading 0%.
  const signupTotal = Math.max(signups, ownerIds.length);

  return {
    clicks,
    signups: signupTotal,
    paidOwners,
    clickToSignup: pct(signups, clicks),
    signupToPaid: pct(paidOwners, signupTotal),
    earned: earned._sum.amount ?? 0,
  };
}

export type LeaderboardRow = {
  partnerId: number;
  name: string;
  partnerCode: string;
  city: string | null;
  conversions: number;
  earned: number;
  rank: number;
  isYou: boolean;
};

/**
 * This month's top partners by commission earned.
 *
 * Deliberately ranked on earnings rather than raw registrations: registrations
 * are easy to inflate and say nothing about whether the owner ever paid.
 */
export async function getLeaderboard(opts: { forPartnerId?: number; take?: number; city?: string | null } = {}) {
  const take = opts.take ?? 10;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const grouped = await db.partnerEarning.groupBy({
    by: ["partnerId"],
    where: {
      status: { not: "CANCELLED" },
      kind: "REFERRAL",
      createdAt: { gte: monthStart },
    },
    _sum: { amount: true },
    _count: { _all: true },
  });

  const partners = await db.partnerProfile.findMany({
    where: {
      id: { in: grouped.map((g) => g.partnerId) },
      status: "APPROVED",
      archivedAt: null,
      ...(opts.city ? { city: opts.city } : {}),
    },
    select: { id: true, partnerCode: true, city: true, user: { select: { name: true } } },
  });
  const byId = new Map(partners.map((p) => [p.id, p]));

  const rows = grouped
    .filter((g) => byId.has(g.partnerId))
    .map((g) => {
      const p = byId.get(g.partnerId)!;
      return {
        partnerId: p.id,
        name: p.user.name,
        partnerCode: p.partnerCode,
        city: p.city,
        conversions: g._count._all,
        earned: g._sum.amount ?? 0,
      };
    })
    .sort((a, b) => b.earned - a.earned || b.conversions - a.conversions);

  const ranked: LeaderboardRow[] = rows.map((r, i) => ({
    ...r,
    rank: i + 1,
    isYou: r.partnerId === opts.forPartnerId,
  }));

  const top = ranked.slice(0, take);
  // A partner outside the top N still sees where they stand — a leaderboard you
  // are invisible on is demotivating rather than motivating.
  const you = opts.forPartnerId ? ranked.find((r) => r.isYou) ?? null : null;

  return { top, you, total: ranked.length, monthStart };
}
