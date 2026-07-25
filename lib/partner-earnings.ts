/**
 * lib/partner-earnings.ts (server-only)
 * The earning lifecycle — the money mechanics of the Partner Portal.
 *
 * Rules:
 *  • An earning is created ONCE per PG, when that PG converts to a paid plan.
 *  • The amount is set MANUALLY by an admin — there is no commission %.
 *  • The UNIQUE(partnerId, listingId) DB constraint is the real guarantee that a
 *    PG can never generate two earnings; this code cooperates with it.
 */
import "server-only";
import { db } from "@/lib/db";
import { notify } from "@/lib/notifications";

/**
 * Called when an owner activates a paid subscription. Creates a PENDING,
 * ₹0 earning for every partner-registered PG of that owner that doesn't have one
 * yet. Admin sets the amount afterwards. Safe to call repeatedly — existing
 * earnings are skipped via the unique constraint.
 *
 * Returns the number of new earnings created.
 */
export async function createEarningsForPaidOwner(ownerId: number, subscriptionId?: number): Promise<number> {
  const pgs = await db.listing.findMany({
    where: { ownerId, partnerId: { not: null } },
    select: { id: true, partnerId: true, title: true },
  });
  if (pgs.length === 0) return 0;

  // Plan snapshot + commission config at conversion time, so a later price or
  // commission change doesn't rewrite history.
  const sub = subscriptionId
    ? await db.subscription.findUnique({
        where: { id: subscriptionId },
        select: { plan: { select: { name: true, price: true, partnerCommissionType: true, partnerCommissionValue: true } } },
      })
    : null;

  // Auto-compute the partner's earning from the plan's admin-set commission.
  // NONE → ₹0 (admin sets it by hand later); PERCENT → % of price; FIXED → flat.
  const plan = sub?.plan;
  const autoAmount = !plan
    ? 0
    : plan.partnerCommissionType === "PERCENT"
    ? Math.round((plan.price * plan.partnerCommissionValue) / 100)
    : plan.partnerCommissionType === "FIXED"
    ? plan.partnerCommissionValue
    : 0;

  let created = 0;
  for (const pg of pgs) {
    if (!pg.partnerId) continue;
    try {
      await db.partnerEarning.create({
        data: {
          partnerId: pg.partnerId,
          listingId: pg.id,
          subscriptionId: subscriptionId ?? null,
          amount: autoAmount, // from plan commission; admin can still override
          status: "PENDING",
          planNameSnapshot: sub?.plan.name ?? null,
          planPriceSnapshot: sub?.plan.price ?? null,
        },
      });
      created++;

      // Tell the partner a conversion happened (admin will set the amount).
      const partner = await db.partnerProfile.findUnique({
        where: { id: pg.partnerId },
        select: { userId: true },
      });
      if (partner) {
        await notify({
          userId: partner.userId,
          type: "PARTNER_EARNING",
          title: "PG paid plan par gaya 🎉",
          message:
            autoAmount > 0
              ? `${pg.title} ab paid plan par hai. Aapki earning ₹${autoAmount} ban gayi (approval baaki).`
              : `${pg.title} ab paid plan par hai. Admin aapki earning set karega.`,
          link: "/partner/earnings",
        });
      }
    } catch (e: any) {
      // P2002 = unique violation = an earning already exists for this PG. Expected.
      if (e?.code !== "P2002") throw e;
    }
  }
  return created;
}

export type EarningSummary = {
  pending: number;
  approved: number;
  paid: number;
  cancelled: number;
  lifetime: number; // pending+approved+paid
  thisMonth: number;
  lastMonth: number;
  net: number; // lifetime
  count: { pending: number; approved: number; paid: number };
};

export async function getEarningSummary(partnerId: number): Promise<EarningSummary> {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [grouped, thisMonthAgg, lastMonthAgg] = await Promise.all([
    db.partnerEarning.groupBy({
      by: ["status"],
      where: { partnerId },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    db.partnerEarning.aggregate({
      where: { partnerId, status: { not: "CANCELLED" }, createdAt: { gte: thisMonthStart } },
      _sum: { amount: true },
    }),
    db.partnerEarning.aggregate({
      where: { partnerId, status: { not: "CANCELLED" }, createdAt: { gte: lastMonthStart, lt: thisMonthStart } },
      _sum: { amount: true },
    }),
  ]);

  const sum = (s: string) => grouped.find((g) => g.status === s)?._sum.amount ?? 0;
  const cnt = (s: string) => grouped.find((g) => g.status === s)?._count._all ?? 0;
  const pending = sum("PENDING");
  const approved = sum("APPROVED");
  const paid = sum("PAID");
  const cancelled = sum("CANCELLED");
  const lifetime = pending + approved + paid;

  return {
    pending, approved, paid, cancelled, lifetime,
    thisMonth: thisMonthAgg._sum.amount ?? 0,
    lastMonth: lastMonthAgg._sum.amount ?? 0,
    net: lifetime,
    count: { pending: cnt("PENDING"), approved: cnt("APPROVED"), paid: cnt("PAID") },
  };
}

/** Paginated earning rows for the partner earnings page. */
export async function getEarningList(partnerId: number, opts: { status?: string; page?: number; pageSize?: number } = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = opts.pageSize ?? 15;
  const where: any = { partnerId };
  if (opts.status) where.status = opts.status;

  const [total, rows] = await Promise.all([
    db.partnerEarning.count({ where }),
    db.partnerEarning.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, amount: true, status: true, createdAt: true, paidAt: true,
        planNameSnapshot: true,
        listing: { select: { id: true, title: true, city: { select: { name: true } } } },
      },
    }),
  ]);

  return { total, rows, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
