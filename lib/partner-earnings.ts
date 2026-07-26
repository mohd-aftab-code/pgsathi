/**
 * lib/partner-earnings.ts (server-only)
 * The earning lifecycle — the money mechanics of the Partner Portal.
 *
 * Rules:
 *  • Commission follows the OWNER, not the PG. One payment earns ONE commission
 *    however many PGs that owner has — so the payout is always a fixed share of
 *    money actually collected and can never exceed it.
 *  • It is RECURRING: every payment (monthly / 3 / 6 / 12 month) earns again, for
 *    as long as the owner keeps renewing. Stop renewing and it stops by itself,
 *    because no invoice means no earning — there is no separate "cancel" path.
 *  • The rate comes from the plan's admin-set commission (PERCENT / FIXED / NONE)
 *    and is applied to the INVOICE amount, so a 6-month payment earns 6 months'
 *    worth in one go.
 *  • `PartnerEarning.invoiceId` is UNIQUE — that is what makes a retry, a
 *    double-click or a replayed webhook unable to pay twice.
 */
import "server-only";
import { db } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { cycleLabel } from "@/lib/billing";

/** Commission owed on one payment, from the plan's admin-set rate. */
export function commissionFor(
  plan: { partnerCommissionType: string; partnerCommissionValue: number },
  invoiceAmount: number,
): number {
  if (invoiceAmount <= 0) return 0;
  if (plan.partnerCommissionType === "PERCENT") {
    return Math.round((invoiceAmount * plan.partnerCommissionValue) / 100);
  }
  if (plan.partnerCommissionType === "FIXED") {
    return plan.partnerCommissionValue;
  }
  return 0; // NONE — admin sets this earning by hand
}

/**
 * Creates the partner commission for one paid invoice.
 *
 * Idempotent: `invoiceId` is unique, so calling it twice for the same payment
 * creates nothing the second time. That makes it safe to call from a webhook
 * retry as well as from the checkout route.
 *
 * Returns the earning id, or null when no commission was due.
 */
export async function createEarningForInvoice(invoiceId: number): Promise<number | null> {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true,
      amount: true,
      billingCycle: true,
      subscriptionId: true,
      subscription: {
        select: {
          id: true,
          plan: { select: { name: true, partnerCommissionType: true, partnerCommissionValue: true } },
          user: { select: { id: true, name: true, partnerId: true } },
        },
      },
    },
  });
  if (!invoice) return null;

  const owner = invoice.subscription.user;
  // No partner brought this owner in — nothing to pay.
  if (!owner.partnerId) return null;
  // Free plans generate no commission.
  if (invoice.amount <= 0) return null;

  const amount = commissionFor(invoice.subscription.plan, invoice.amount);

  // The earning is created even for a SUSPENDED partner: the referral genuinely
  // happened and the money was genuinely collected, so the record should exist
  // and the admin decides whether to cancel it. Silently dropping it would lose
  // money a reinstated partner is owed.
  try {
    const earning = await db.partnerEarning.create({
      data: {
        partnerId: owner.partnerId,
        ownerId: owner.id,
        invoiceId: invoice.id,
        subscriptionId: invoice.subscriptionId,
        amount,
        status: "PENDING",
        planNameSnapshot: invoice.subscription.plan.name,
        planPriceSnapshot: invoice.amount,
      },
      select: { id: true },
    });

    const partner = await db.partnerProfile.findUnique({
      where: { id: owner.partnerId },
      select: { userId: true },
    });
    if (partner) {
      await notify({
        userId: partner.userId,
        type: "PARTNER_EARNING",
        title: amount > 0 ? `Nayi earning — ₹${amount.toLocaleString("en-IN")} 🎉` : "Owner ne plan liya",
        message:
          amount > 0
            ? `${owner.name} ne ${invoice.subscription.plan.name} (${cycleLabel(invoice.billingCycle)}) liya. Aapki earning ₹${amount.toLocaleString("en-IN")} bani (approval baaki).`
            : `${owner.name} ne ${invoice.subscription.plan.name} liya. Admin aapki earning set karega.`,
        link: "/partner/earnings",
      });
    }

    return earning.id;
  } catch (e: any) {
    // P2002 = this invoice already has an earning. Expected on a retry.
    if (e?.code === "P2002") return null;
    throw e;
  }
}

/**
 * Records which partner an owner belongs to, the first time a partner touches
 * them. Never overwrites an existing attribution — that stability is what keeps
 * payouts unambiguous when an owner ends up with PGs from two partners.
 *
 * Returns true if this call is what set it.
 */
export async function attributeOwnerToPartner(ownerId: number, partnerId: number): Promise<boolean> {
  const res = await db.user.updateMany({
    where: { id: ownerId, partnerId: null },
    data: { partnerId },
  });
  return res.count > 0;
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
        planNameSnapshot: true, planPriceSnapshot: true,
        owner: { select: { id: true, name: true } },
        invoice: { select: { billingCycle: true, periodStart: true, periodEnd: true } },
        listing: { select: { id: true, title: true, city: { select: { name: true } } } },
      },
    }),
  ]);

  return { total, rows, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
