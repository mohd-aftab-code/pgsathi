/**
 * lib/partner-stats.ts (server-only)
 * Every number the Partner Dashboard shows, computed in one place.
 *
 * ALL queries are scoped by the `partnerId` passed in, which callers must take
 * from the session (never from a URL or body). Nothing here reads request state.
 *
 * Business rules applied:
 *  • A PG's plan is its OWNER's plan — there are no per-PG subscriptions.
 *    "Paid PG" = the owner holds an active paid subscription right now.
 *  • Earnings are created per OWNER PAYMENT, not per PG, and the amount comes
 *    from the plan's commission rate — see lib/partner-earnings. Held earnings
 *    are counted in the totals here because they are still owed; only cancelled
 *    ones are excluded.
 */
import "server-only";
import { db } from "@/lib/db";
import type { Prisma, SubStatus } from "@prisma/client";

export type PartnerStats = {
  totalPgs: number;
  activePgs: number;
  freePlanPgs: number;
  paidPlanPgs: number;
  revenueGenerated: number; // platform revenue from owners this partner brought in
  pendingEarnings: number; // owed but not yet paid out
  netEarnings: number; // lifetime, excluding cancelled
  paidEarnings: number; // actually received
  renewalDue: number; // partner's PGs whose owner's plan expires within 30 days
  thisMonthRegistrations: number;
  conversionRate: number; // paid PGs ÷ total PGs, as a percentage
  avgEarningPerPaidPg: number;
};

export type MonthPoint = { month: string; registrations: number; earnings: number };

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const LIVE_STATUSES: SubStatus[] = ["ACTIVE", "TRIAL"];

/**
 * Paid = a live subscription on a plan that actually costs money.
 * Built as a function, not a constant: `new Date()` in a module-level object is
 * evaluated once at import, so a long-running server would keep comparing
 * against the timestamp it booted at.
 */
const paidSubWhere = (): Prisma.SubscriptionWhereInput => ({
  status: { in: LIVE_STATUSES },
  endDate: { gt: new Date() },
  plan: { price: { gt: 0 } },
});

export async function getPartnerStats(partnerId: number): Promise<PartnerStats> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // The partner's PGs, with just enough owner data to derive plan state.
  const listings = await db.listing.findMany({
    where: { partnerId },
    select: {
      id: true,
      status: true,
      isActive: true,
      createdAt: true,
      ownerId: true,
    },
  });

  const totalPgs = listings.length;
  const activePgs = listings.filter((l) => l.status === "ACTIVE" && l.isActive).length;
  const thisMonthRegistrations = listings.filter((l) => l.createdAt >= monthStart).length;

  // One query for every owner behind those PGs, instead of one per PG.
  const ownerIds = [...new Set(listings.map((l) => l.ownerId))];
  const paidSubs = ownerIds.length
    ? await db.subscription.findMany({
        where: { userId: { in: ownerIds }, ...paidSubWhere() },
        select: { userId: true, amount: true, endDate: true },
        orderBy: { endDate: "desc" },
      })
    : [];

  // Keep the furthest-out subscription per owner (an owner may have several rows).
  const subByOwner = new Map<number, { amount: number; endDate: Date }>();
  for (const s of paidSubs) {
    if (!subByOwner.has(s.userId)) subByOwner.set(s.userId, { amount: s.amount, endDate: s.endDate });
  }

  const paidPlanPgs = listings.filter((l) => subByOwner.has(l.ownerId)).length;
  const freePlanPgs = totalPgs - paidPlanPgs;
  const renewalDue = listings.filter((l) => {
    const sub = subByOwner.get(l.ownerId);
    return sub ? sub.endDate <= in30Days : false;
  }).length;

  // Revenue the partner generated for the platform: each distinct owner's
  // subscription amount counted once, not once per PG.
  const revenueGenerated = [...subByOwner.values()].reduce((sum, s) => sum + s.amount, 0);

  // ── Earnings ─────────────────────────────────────────────────────────
  const grouped = await db.partnerEarning.groupBy({
    by: ["status"],
    where: { partnerId },
    _sum: { amount: true },
    _count: { _all: true },
  });
  const sumOf = (...statuses: string[]) =>
    grouped.filter((g) => statuses.includes(g.status)).reduce((s, g) => s + (g._sum.amount ?? 0), 0);

  const pendingEarnings = sumOf("PENDING", "APPROVED"); // owed
  const paidEarnings = sumOf("PAID");
  const netEarnings = sumOf("PENDING", "APPROVED", "PAID"); // lifetime, cancelled excluded
  const paidEarningCount = grouped
    .filter((g) => g.status === "PAID")
    .reduce((s, g) => s + g._count._all, 0);

  return {
    totalPgs,
    activePgs,
    freePlanPgs,
    paidPlanPgs,
    revenueGenerated,
    pendingEarnings,
    netEarnings,
    paidEarnings,
    renewalDue,
    thisMonthRegistrations,
    conversionRate: totalPgs > 0 ? Math.round((paidPlanPgs / totalPgs) * 100) : 0,
    avgEarningPerPaidPg: paidEarningCount > 0 ? Math.round(paidEarnings / paidEarningCount) : 0,
  };
}

/** Last 6 months of registrations and earnings, oldest first. */
export async function getPartnerTrend(partnerId: number): Promise<MonthPoint[]> {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [listings, earnings] = await Promise.all([
    db.listing.findMany({
      where: { partnerId, createdAt: { gte: from } },
      select: { createdAt: true },
    }),
    db.partnerEarning.findMany({
      where: { partnerId, status: { not: "CANCELLED" }, createdAt: { gte: from } },
      select: { createdAt: true, amount: true },
    }),
  ]);

  const buckets: MonthPoint[] = [];
  const index = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    index.set(`${d.getFullYear()}-${d.getMonth()}`, buckets.length);
    buckets.push({ month: MONTH_LABELS[d.getMonth()], registrations: 0, earnings: 0 });
  }
  const bump = (date: Date, field: "registrations" | "earnings", by: number) => {
    const i = index.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (i !== undefined) buckets[i][field] += by;
  };

  listings.forEach((l) => bump(l.createdAt, "registrations", 1));
  earnings.forEach((e) => bump(e.createdAt, "earnings", e.amount));
  return buckets;
}

/** Most recent PGs this partner registered, with their derived plan state. */
export async function getPartnerRecentPgs(partnerId: number, take = 5) {
  const listings = await db.listing.findMany({
    where: { partnerId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      ownerId: true,
      city: { select: { name: true } },
    },
  });
  if (listings.length === 0) return [];

  const paidOwners = new Set(
    (
      await db.subscription.findMany({
        where: { userId: { in: listings.map((l) => l.ownerId) }, ...paidSubWhere() },
        select: { userId: true },
      })
    ).map((s) => s.userId)
  );

  return listings.map((l) => ({
    id: l.id,
    title: l.title,
    city: l.city?.name ?? null,
    status: l.status,
    createdAt: l.createdAt,
    plan: paidOwners.has(l.ownerId) ? ("PAID" as const) : ("FREE" as const),
  }));
}

/** Recent activity feed entries for this partner. */
export async function getPartnerActivity(partnerId: number, take = 6) {
  return db.partnerActivityLog.findMany({
    where: { partnerId },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, action: true, entity: true, createdAt: true },
  });
}
