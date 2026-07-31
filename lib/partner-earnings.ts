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
 *    A plan may cap the window (`partnerCommissionMonths`); the clock starts at
 *    `User.partnerAttributedAt`, so changing the cap never disturbs the past.
 *  • The rate comes from the plan's admin-set commission (PERCENT / FIXED / NONE),
 *    optionally replaced by the partner's negotiated override, plus their tier
 *    bonus, and is applied to the INVOICE amount — so a 6-month payment earns six
 *    months' worth in one go.
 *  • `PartnerEarning.invoiceId` is UNIQUE — that is what makes a retry, a
 *    double-click or a replayed webhook unable to pay twice. Derived rows
 *    (a parent's OVERRIDE, a refund's ADJUSTMENT) carry no invoiceId and are
 *    instead unique on (parentEarningId, kind), which gives them the same
 *    guarantee.
 *  • A new earning is born on HOLD until the refund window closes. Money that
 *    comes back inside that window never became payable in the first place.
 */
import "server-only";
import type { Prisma, EarningStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { cycleLabel } from "@/lib/billing";
import { getProgramSettings } from "@/lib/partner-settings";
import { countConversions, tierFor, tierBonusPercent, TIER_LABEL } from "@/lib/partner-tier";
import { notifyPartner } from "@/lib/partner-notify";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * Prisma's error code, or null for anything that isn't one.
 * P2002 (unique constraint) is the expected outcome of a retry here, so it has
 * to be told apart from a real failure rather than swallowed wholesale.
 */
function prismaErrorCode(e: unknown): string | null {
  if (e && typeof e === "object" && "code" in e && typeof (e as { code: unknown }).code === "string") {
    return (e as { code: string }).code;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Rate calculation
// ─────────────────────────────────────────────────────────────────────────────

export type CommissionResult = {
  amount: number;
  /** Human-readable derivation, snapshotted onto the earning. Every payout
   *  dispute opens with "yeh amount kaise bana" — this is the answer. */
  label: string;
};

/**
 * What one payment earns.
 *
 * `overridePercent` is the partner's negotiated rate and replaces the plan's
 * rate entirely. The tier bonus is then applied on top of whatever base was
 * used, as a percentage OF the commission — "Gold partners ko 2% extra
 * commission" is a promise a partner can check with a calculator.
 */
export function computeCommission(input: {
  plan: { partnerCommissionType: string; partnerCommissionValue: number };
  invoiceAmount: number;
  overridePercent?: number | null;
  tierBonusPercent?: number;
  tierName?: string;
}): CommissionResult {
  const { plan, invoiceAmount } = input;
  if (invoiceAmount <= 0) return { amount: 0, label: "no commission (free plan)" };

  let base = 0;
  let label = "";

  if (input.overridePercent != null && input.overridePercent > 0) {
    base = Math.round((invoiceAmount * input.overridePercent) / 100);
    label = `custom ${input.overridePercent}% of ${inr(invoiceAmount)}`;
  } else if (plan.partnerCommissionType === "PERCENT") {
    base = Math.round((invoiceAmount * plan.partnerCommissionValue) / 100);
    label = `${plan.partnerCommissionValue}% of ${inr(invoiceAmount)}`;
  } else if (plan.partnerCommissionType === "FIXED") {
    base = plan.partnerCommissionValue;
    label = `${inr(plan.partnerCommissionValue)} fixed`;
  } else {
    // NONE — the admin sets this earning by hand.
    return { amount: 0, label: "admin-set" };
  }

  const bonusPct = input.tierBonusPercent ?? 0;
  if (bonusPct > 0 && base > 0) {
    const bonus = Math.round((base * bonusPct) / 100);
    return {
      amount: base + bonus,
      label: `${label} + ${bonusPct}% ${input.tierName ?? "tier"} bonus`,
    };
  }

  return { amount: base, label };
}

/**
 * Commission owed on one payment from the plan's rate alone.
 * Kept for callers that only want the headline number (the partner-facing PG
 * detail page); the full engine below applies overrides and tier bonuses too.
 */
export function commissionFor(
  plan: { partnerCommissionType: string; partnerCommissionValue: number },
  invoiceAmount: number,
): number {
  return computeCommission({ plan, invoiceAmount }).amount;
}

/**
 * Whether a partner still earns on this owner.
 * `months` of 0 means forever, which is what every existing plan does.
 */
export function commissionWindowOpen(
  attributedAt: Date | null | undefined,
  months: number,
  now = new Date(),
): boolean {
  if (!months || months <= 0) return true;
  if (!attributedAt) return true; // unknown start date — never punish the partner
  const expiry = new Date(attributedAt);
  expiry.setMonth(expiry.getMonth() + months);
  return now < expiry;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Creating earnings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates the partner commission for one paid invoice, plus the parent
 * partner's override if this partner works under someone.
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
          plan: {
            select: {
              name: true,
              partnerCommissionType: true,
              partnerCommissionValue: true,
              partnerCommissionMonths: true,
            },
          },
          user: { select: { id: true, name: true, partnerId: true, partnerAttributedAt: true } },
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

  // The plan may only pay a partner for a fixed window after attribution.
  if (!commissionWindowOpen(owner.partnerAttributedAt, invoice.subscription.plan.partnerCommissionMonths)) {
    return null;
  }

  const partner = await db.partnerProfile.findUnique({
    where: { id: owner.partnerId },
    select: {
      id: true,
      userId: true,
      status: true,
      riskFlagged: true,
      archivedAt: true,
      commissionOverridePercent: true,
      tierOverride: true,
      parentPartnerId: true,
      parentOverridePercent: true,
    },
  });
  if (!partner) return null;

  const settings = await getProgramSettings();
  const conversions = await countConversions(partner.id);
  const tier = tierFor(conversions, settings, partner.tierOverride);
  const bonusPct = tierBonusPercent(tier, settings);

  const { amount, label } = computeCommission({
    plan: invoice.subscription.plan,
    invoiceAmount: invoice.amount,
    overridePercent: partner.commissionOverridePercent,
    tierBonusPercent: bonusPct,
    tierName: TIER_LABEL[tier],
  });

  // A suspended, flagged or archived partner still earns — the referral genuinely
  // happened and the money was genuinely collected. It simply cannot become
  // payable without an admin looking at it, which is what the hold expresses.
  // Silently dropping it would lose money a reinstated partner is owed.
  const holdReason =
    partner.archivedAt ? "Partner archived"
    : partner.status !== "APPROVED" ? `Partner ${partner.status.toLowerCase()}`
    : partner.riskFlagged ? "Partner flagged for review"
    : null;

  const eligibleAt = new Date(Date.now() + settings.holdDays * 24 * 60 * 60 * 1000);

  try {
    const earning = await db.partnerEarning.create({
      data: {
        partnerId: partner.id,
        ownerId: owner.id,
        invoiceId: invoice.id,
        subscriptionId: invoice.subscriptionId,
        amount,
        status: "PENDING",
        kind: "REFERRAL",
        planNameSnapshot: invoice.subscription.plan.name,
        planPriceSnapshot: invoice.amount,
        commissionRateSnapshot: label.slice(0, 60),
        onHold: holdReason !== null,
        holdReason,
        eligibleAt,
      },
      select: { id: true },
    });

    await notifyPartner({
      partnerId: partner.id,
      type: "PARTNER_EARNING",
      title: amount > 0 ? `Nayi earning — ${inr(amount)} 🎉` : "Owner ne plan liya",
      message:
        amount > 0
          ? `${owner.name} ne ${invoice.subscription.plan.name} (${cycleLabel(invoice.billingCycle)}) liya. ` +
            `Aapki earning ${inr(amount)} bani (${label}). ` +
            (holdReason
              ? `Filhaal hold par hai: ${holdReason}.`
              : `${settings.holdDays} din ke refund window ke baad approve hogi.`)
          : `${owner.name} ne ${invoice.subscription.plan.name} liya. Admin aapki earning set karega.`,
      link: "/partner/earnings",
    });

    // Sub-partner override: the parent earns a cut of what this partner earned.
    if (partner.parentPartnerId && partner.parentOverridePercent > 0 && amount > 0) {
      await createOverrideEarning({
        parentPartnerId: partner.parentPartnerId,
        percent: partner.parentOverridePercent,
        sourceEarningId: earning.id,
        sourceAmount: amount,
        ownerId: owner.id,
        ownerName: owner.name,
        planName: invoice.subscription.plan.name,
        eligibleAt,
      });
    }

    return earning.id;
  } catch (e: unknown) {
    // P2002 = this invoice already has an earning. Expected on a retry.
    if (prismaErrorCode(e) === "P2002") return null;
    throw e;
  }
}

/**
 * The parent partner's cut of a sub-partner's commission.
 *
 * Carries no `invoiceId` — that column's uniqueness belongs to the REFERRAL row.
 * Uniqueness here comes from (parentEarningId, kind), so a retried creation can
 * no more duplicate this than it can the original.
 */
async function createOverrideEarning(input: {
  parentPartnerId: number;
  percent: number;
  sourceEarningId: number;
  sourceAmount: number;
  ownerId: number;
  ownerName: string;
  planName: string;
  eligibleAt: Date;
}): Promise<void> {
  const amount = Math.round((input.sourceAmount * input.percent) / 100);
  if (amount <= 0) return;

  const parent = await db.partnerProfile.findUnique({
    where: { id: input.parentPartnerId },
    select: { id: true, status: true, riskFlagged: true, archivedAt: true },
  });
  if (!parent) return;

  const holdReason =
    parent.archivedAt ? "Partner archived"
    : parent.status !== "APPROVED" ? `Partner ${parent.status.toLowerCase()}`
    : parent.riskFlagged ? "Partner flagged for review"
    : null;

  try {
    await db.partnerEarning.create({
      data: {
        partnerId: parent.id,
        ownerId: input.ownerId,
        parentEarningId: input.sourceEarningId,
        kind: "OVERRIDE",
        amount,
        status: "PENDING",
        planNameSnapshot: input.planName,
        commissionRateSnapshot: `${input.percent}% override of ${inr(input.sourceAmount)}`,
        onHold: holdReason !== null,
        holdReason,
        eligibleAt: input.eligibleAt,
      },
    });

    await notifyPartner({
      partnerId: parent.id,
      type: "PARTNER_EARNING",
      title: `Team override — ${inr(amount)}`,
      message: `Aapke sub-partner ki ${input.ownerName} wali earning par ${input.percent}% override ${inr(amount)} bana.`,
      link: "/partner/earnings",
      inAppOnly: true,
    });
  } catch (e: unknown) {
    if (prismaErrorCode(e) === "P2002") return; // already created
    console.error("[partner-earnings] override create failed (non-fatal):", e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Attribution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Records which partner an owner belongs to, the first time a partner touches
 * them. Never overwrites an existing attribution — that stability is what keeps
 * payouts unambiguous when an owner ends up with PGs from two partners. The one
 * sanctioned way to change it afterwards is the admin re-attribution action,
 * which is audited.
 *
 * Returns true if this call is what set it.
 */
export async function attributeOwnerToPartner(ownerId: number, partnerId: number): Promise<boolean> {
  const res = await db.user.updateMany({
    where: { id: ownerId, partnerId: null },
    data: { partnerId, partnerAttributedAt: new Date() },
  });
  return res.count > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Refunds — clawback
// ─────────────────────────────────────────────────────────────────────────────

export type ClawbackResult = {
  cancelled: number;
  adjusted: number;
  amount: number;
};

/**
 * Undoes the commission on a payment that came back.
 *
 * Not yet paid → the earning is simply CANCELLED.
 * Already paid → a negative ADJUSTMENT row is created, which nets off the
 * partner's next payout. Editing the PAID row instead would desync it from the
 * payout it belongs to, which is exactly what the terminal-status guard exists
 * to prevent.
 *
 * Idempotent through the (parentEarningId, kind) unique index: a refund webhook
 * delivered twice claws back once.
 */
export async function clawbackForInvoice(invoiceId: number, reason: string): Promise<ClawbackResult> {
  const result: ClawbackResult = { cancelled: 0, adjusted: 0, amount: 0 };

  const source = await db.partnerEarning.findUnique({
    where: { invoiceId },
    select: { id: true, partnerId: true, ownerId: true, amount: true, status: true, planNameSnapshot: true },
  });
  if (!source) return result;

  // The parent's override rides on the same fate as the earning it derives from.
  const derived = await db.partnerEarning.findMany({
    where: { parentEarningId: source.id, kind: "OVERRIDE" },
    select: { id: true, partnerId: true, ownerId: true, amount: true, status: true, planNameSnapshot: true },
  });

  for (const earning of [source, ...derived]) {
    if (earning.status === "CANCELLED") continue;

    if (earning.status === "PENDING" || earning.status === "APPROVED") {
      await db.partnerEarning.update({
        where: { id: earning.id },
        data: {
          status: "CANCELLED",
          onHold: false,
          notes: `Refund clawback: ${reason}`.slice(0, 500),
        },
      });
      result.cancelled++;
      result.amount += earning.amount;
      await notifyPartner({
        partnerId: earning.partnerId,
        title: `Earning cancel — ${inr(earning.amount)}`,
        message: `${earning.planNameSnapshot ?? "Ek plan"} ka payment wapas ho gaya (${reason}), isliye ${inr(earning.amount)} ki earning cancel kar di gayi.`,
        link: "/partner/earnings",
      });
      continue;
    }

    if (earning.status === "PAID") {
      try {
        await db.partnerEarning.create({
          data: {
            partnerId: earning.partnerId,
            ownerId: earning.ownerId,
            parentEarningId: earning.id,
            kind: "ADJUSTMENT",
            amount: -earning.amount,
            // APPROVED so it is picked up by the next payout and nets off there.
            status: "APPROVED",
            approvedAt: new Date(),
            eligibleAt: new Date(),
            planNameSnapshot: earning.planNameSnapshot,
            commissionRateSnapshot: `clawback of ${inr(earning.amount)}`,
            notes: `Refund clawback: ${reason}`.slice(0, 500),
          },
        });
        result.adjusted++;
        result.amount += earning.amount;
        await notifyPartner({
          partnerId: earning.partnerId,
          title: `Clawback — ${inr(earning.amount)}`,
          message:
            `${earning.planNameSnapshot ?? "Ek plan"} ka payment refund ho gaya (${reason}). ` +
            `Jo ${inr(earning.amount)} pay ho chuka tha, wo aapke agle payout se adjust hoga.`,
          link: "/partner/earnings",
        });
      } catch (e: unknown) {
        if (prismaErrorCode(e) !== "P2002") throw e; // already clawed back
      }
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Auto-approval
// ─────────────────────────────────────────────────────────────────────────────

export type AutoApprovalResult = { considered: number; approved: number; amount: number };

/**
 * Approves every earning that has cleared the refund window and needs no human
 * judgement. Approving hundreds of identical rows by hand was the programme's
 * scale ceiling, and the delay it caused was the partner-facing symptom.
 *
 * Left for a human: anything on hold, at or above the manual-review amount,
 * zero-amount (a NONE-commission plan), or belonging to a partner who is not
 * cleanly APPROVED.
 */
export async function runAutoApproval(limit = 500): Promise<AutoApprovalResult> {
  const settings = await getProgramSettings();
  if (!settings.autoApproveEnabled) return { considered: 0, approved: 0, amount: 0 };

  // Relation filters are not available on updateMany, so the eligible set is
  // resolved first and then updated by id.
  const eligible = await db.partnerEarning.findMany({
    where: {
      status: "PENDING",
      onHold: false,
      amount: { gt: 0, lte: settings.autoApproveMaxAmount },
      eligibleAt: { lte: new Date() },
      partner: { status: "APPROVED", riskFlagged: false, archivedAt: null },
    },
    select: { id: true, partnerId: true, amount: true },
    take: limit,
  });
  if (eligible.length === 0) return { considered: 0, approved: 0, amount: 0 };

  const ids = eligible.map((e) => e.id);
  // Re-check the status inside the write so a concurrent manual approval or
  // cancellation cannot be overwritten by this batch.
  const res = await db.partnerEarning.updateMany({
    where: { id: { in: ids }, status: "PENDING", onHold: false },
    data: { status: "APPROVED", approvedAt: new Date(), autoApproved: true },
  });

  const byPartner = new Map<number, number>();
  for (const e of eligible) byPartner.set(e.partnerId, (byPartner.get(e.partnerId) ?? 0) + e.amount);

  for (const [partnerId, amount] of byPartner) {
    await notifyPartner({
      partnerId,
      title: `${inr(amount)} approve ho gaya ✅`,
      message: `Aapki earnings approve ho gayi hain aur agle payout cycle me shamil hongi.`,
      link: "/partner/earnings",
    });
  }

  return {
    considered: eligible.length,
    approved: res.count,
    amount: eligible.reduce((s, e) => s + e.amount, 0),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Reads
// ─────────────────────────────────────────────────────────────────────────────

export type EarningSummary = {
  pending: number;
  approved: number;
  paid: number;
  cancelled: number;
  onHold: number;
  lifetime: number; // pending+approved+paid
  thisMonth: number;
  lastMonth: number;
  net: number; // lifetime
  count: { pending: number; approved: number; paid: number; onHold: number };
};

export async function getEarningSummary(partnerId: number): Promise<EarningSummary> {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [grouped, thisMonthAgg, lastMonthAgg, holdAgg] = await Promise.all([
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
    db.partnerEarning.aggregate({
      where: { partnerId, onHold: true, status: "PENDING" },
      _sum: { amount: true },
      _count: { _all: true },
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
    onHold: holdAgg._sum.amount ?? 0,
    thisMonth: thisMonthAgg._sum.amount ?? 0,
    lastMonth: lastMonthAgg._sum.amount ?? 0,
    net: lifetime,
    count: {
      pending: cnt("PENDING"),
      approved: cnt("APPROVED"),
      paid: cnt("PAID"),
      onHold: holdAgg._count._all,
    },
  };
}

const REAL_STATUSES: EarningStatus[] = ["PENDING", "APPROVED", "PAID", "CANCELLED"];

/** Paginated earning rows for the partner earnings page. */
export async function getEarningList(partnerId: number, opts: { status?: string; page?: number; pageSize?: number } = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = opts.pageSize ?? 15;
  const where: Prisma.PartnerEarningWhereInput = { partnerId };
  // "ON_HOLD" is a view, not a status — a held earning is still PENDING.
  if (opts.status === "ON_HOLD") {
    where.onHold = true;
    where.status = "PENDING";
  } else if (opts.status && REAL_STATUSES.includes(opts.status as EarningStatus)) {
    where.status = opts.status as EarningStatus;
  }

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
        kind: true, onHold: true, holdReason: true, eligibleAt: true,
        commissionRateSnapshot: true, autoApproved: true, approvedAt: true, notes: true,
        owner: { select: { id: true, name: true } },
        invoice: { select: { billingCycle: true, periodStart: true, periodEnd: true } },
        listing: { select: { id: true, title: true, city: { select: { name: true } } } },
        payout: { select: { id: true, reference: true, method: true, status: true, paidAt: true } },
      },
    }),
  ]);

  return { total, rows, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
