/**
 * lib/partner-payouts.ts (server-only)
 * Paying a partner — the half of the money pipeline that leaves the building.
 *
 * Three things this enforces that the original flow did not:
 *
 *  1. A payout cannot be created for a partner whose payout details are not
 *     verified. Marking earnings PAID when there is no account to pay into put
 *     them in a terminal state describing something that never happened.
 *  2. A payout starts PROCESSING and only becomes COMPLETED once a UTR is
 *     recorded. The transfer itself happens in a bank app, outside this system,
 *     so the system must not claim it succeeded at creation time.
 *  3. A failed transfer is undone by REVERSING the payout, never by editing the
 *     earnings — they are terminal once PAID for good reasons, and reversal
 *     leaves both the original and the correction on the record.
 */
import "server-only";
import { db } from "@/lib/db";
import { getProgramSettings, currentPeriodLabel, type ProgramSettings } from "@/lib/partner-settings";
import { notifyPartner } from "@/lib/partner-notify";
import { sendPayoutEmail } from "@/lib/email";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** Prisma's error code, or null. P2002 here means the idempotency key collided. */
function prismaErrorCode(e: unknown): string | null {
  if (e && typeof e === "object" && "code" in e && typeof (e as { code: unknown }).code === "string") {
    return (e as { code: string }).code;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  KYC
// ─────────────────────────────────────────────────────────────────────────────

export type PayoutIdentity = {
  panNumber: string | null;
  panImage?: string | null;
  aadhaarNumber?: string | null;
  aadhaarFrontImage?: string | null;
  aadhaarBackImage?: string | null;
  upiId: string | null;
  bankName: string | null;
  bankAccountNo: string | null;
  bankIfsc: string | null;
  kycVerifiedAt: Date | null;
};

/** What is still missing before this partner can be paid. Empty = ready. */
export function kycGaps(p: PayoutIdentity): string[] {
  const gaps: string[] = [];
  if (!p.panNumber) gaps.push("PAN number");
  if (!p.panImage) gaps.push("PAN image");
  if (!p.aadhaarNumber) gaps.push("Aadhaar number");
  if (!p.aadhaarFrontImage) gaps.push("Aadhaar front image");
  if (!p.aadhaarBackImage) gaps.push("Aadhaar back image");
  const hasUpi = Boolean(p.upiId);
  const hasBank = Boolean(p.bankName && p.bankAccountNo && p.bankIfsc);
  if (!hasUpi && !hasBank) gaps.push("UPI ID ya poora bank account (name + account no + IFSC)");
  if (!p.kycVerifiedAt) gaps.push("admin verification");
  return gaps;
}

export function isPayoutReady(p: PayoutIdentity): boolean {
  return kycGaps(p).length === 0;
}

// ─────────────────────────────────────────────────────────────────────────────
//  TDS (section 194H)
// ─────────────────────────────────────────────────────────────────────────────

/** Indian financial year containing `d`: 1 April → 31 March. */
export function financialYearStart(d = new Date()): Date {
  const year = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return new Date(year, 3, 1);
}

export type TdsResult = { rate: number; amount: number; net: number; reason: string };

/**
 * TDS on this payout.
 *
 * Deduction only starts once the partner's commission for the financial year
 * crosses the threshold, and the rate depends on whether a PAN is on file —
 * which is the other reason PAN is mandatory before a payout can exist.
 */
export async function computeTds(
  partnerId: number,
  gross: number,
  hasPan: boolean,
  settings: ProgramSettings,
): Promise<TdsResult> {
  if (!settings.tdsEnabled || gross <= 0) {
    return { rate: 0, amount: 0, net: gross, reason: "TDS off" };
  }

  const fyStart = financialYearStart();
  const priorAgg = await db.partnerPayout.aggregate({
    where: { partnerId, createdAt: { gte: fyStart }, reversedAt: null },
    _sum: { grossAmount: true },
  });
  const priorGross = priorAgg._sum.grossAmount ?? 0;

  if (priorGross + gross < settings.tdsThresholdYearly) {
    return {
      rate: 0,
      amount: 0,
      net: gross,
      reason: `FY total ${inr(priorGross + gross)} is below the ${inr(settings.tdsThresholdYearly)} threshold`,
    };
  }

  const rate = hasPan ? settings.tdsRateWithPan : settings.tdsRateWithoutPan;
  const amount = Math.round((gross * rate) / 100);
  return {
    rate,
    amount,
    net: gross - amount,
    reason: hasPan ? `${rate}% (PAN on file)` : `${rate}% (no PAN)`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Payable balance
// ─────────────────────────────────────────────────────────────────────────────

export type PayableSummary = {
  partnerId: number;
  gross: number;
  count: number;
  earningIds: number[];
  /** Deterministic key for this exact payable set — see createPayout. */
  idempotencyKey: string;
};

/**
 * Everything currently payable to a partner: APPROVED earnings not already in a
 * payout. Negative ADJUSTMENT rows are included, which is how a clawback nets
 * itself off rather than needing a separate recovery flow.
 */
export async function getPayableSummary(partnerId: number, onlyEarningIds?: number[]): Promise<PayableSummary> {
  const rows = await db.partnerEarning.findMany({
    where: {
      partnerId,
      status: "APPROVED",
      payoutId: null,
      ...(onlyEarningIds ? { id: { in: onlyEarningIds } } : {}),
    },
    select: { id: true, amount: true },
    orderBy: { id: "asc" },
  });

  const ids = rows.map((r) => r.id);
  const gross = rows.reduce((s, r) => s + r.amount, 0);
  const period = currentPeriodLabel();
  // Same partner + same cycle + same exact earning set = the same payout. Two
  // submissions of one intent collide on this; a genuinely different set later
  // in the month does not.
  const key = ids.length
    ? `${partnerId}:${period}:${ids[0]}-${ids[ids.length - 1]}:${ids.length}`
    : `${partnerId}:${period}:empty`;

  return { partnerId, gross, count: ids.length, earningIds: ids, idempotencyKey: key };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Creating a payout
// ─────────────────────────────────────────────────────────────────────────────

export type CreatePayoutInput = {
  partnerId: number;
  adminId: number;
  method?: string;
  reference?: string | null;
  notes?: string | null;
  /** Pay a balance below the minimum anyway — a deliberate admin override. */
  ignoreMinimum?: boolean;
  /** Restrict the payout to specific earnings (paying one row from its detail
   *  view). Omitted = the partner's whole approved balance. */
  onlyEarningIds?: number[];
};

export type CreatePayoutResult =
  | { ok: true; payoutId: number; gross: number; tds: TdsResult; net: number; count: number; needsApproval: boolean }
  | { ok: false; code: "NO_PARTNER" | "KYC" | "EMPTY" | "BELOW_MINIMUM" | "NEGATIVE" | "DUPLICATE"; message: string };

/**
 * Creates one PROCESSING payout covering every approved earning.
 *
 * Runs in a transaction so a partial payout can never exist (money linked to a
 * payout that was never created, or vice versa), and re-checks each earning's
 * status inside it so two concurrent clicks cannot pay the same earning twice.
 */
export async function createPayout(input: CreatePayoutInput): Promise<CreatePayoutResult> {
  const settings = await getProgramSettings();

  const partner = await db.partnerProfile.findUnique({
    where: { id: input.partnerId },
    select: {
      id: true,
      userId: true,
      panNumber: true,
      panImage: true,
      aadhaarNumber: true,
      aadhaarFrontImage: true,
      aadhaarBackImage: true,
      upiId: true,
      bankName: true,
      bankAccountNo: true,
      bankIfsc: true,
      kycVerifiedAt: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!partner) return { ok: false, code: "NO_PARTNER", message: "Partner nahi mila" };

  const gaps = kycGaps(partner);
  if (gaps.length > 0) {
    return {
      ok: false,
      code: "KYC",
      message: `Payout nahi ban sakta — abhi baaki hai: ${gaps.join(", ")}`,
    };
  }

  const payable = await getPayableSummary(input.partnerId, input.onlyEarningIds);
  if (payable.count === 0) {
    return { ok: false, code: "EMPTY", message: "Koi approved earning payout ke liye pending nahi" };
  }
  if (payable.gross < 0) {
    return {
      ok: false,
      code: "NEGATIVE",
      message: `Balance ${inr(payable.gross)} hai (clawback ke baad). Agli earning se adjust ho jayega.`,
    };
  }
  if (payable.gross === 0) {
    return { ok: false, code: "EMPTY", message: "Payable balance ₹0 hai" };
  }
  if (!input.ignoreMinimum && payable.gross < settings.minPayoutAmount) {
    return {
      ok: false,
      code: "BELOW_MINIMUM",
      message: `Balance ${inr(payable.gross)} minimum ${inr(settings.minPayoutAmount)} se kam hai — agle cycle me carry forward hoga`,
    };
  }

  const tds = await computeTds(input.partnerId, payable.gross, Boolean(partner.panNumber), settings);
  const method = ["UPI", "BANK", "CASH", "OTHER"].includes(String(input.method)) ? String(input.method) : "UPI";
  const reference = input.reference?.trim().slice(0, 60) || null;
  // Large payouts wait for a second admin. 0 disables the check.
  const needsApproval = settings.makerCheckerAbove > 0 && tds.net >= settings.makerCheckerAbove;

  try {
    const payout = await db.$transaction(async (tx) => {
      const p = await tx.partnerPayout.create({
        data: {
          partnerId: input.partnerId,
          amount: tds.net,
          grossAmount: payable.gross,
          tdsRate: tds.rate,
          tdsAmount: tds.amount,
          method,
          reference,
          notes: input.notes?.slice(0, 500) ?? null,
          // Never COMPLETED at creation: the transfer has not happened yet.
          status: "PROCESSING",
          periodLabel: currentPeriodLabel(),
          idempotencyKey: payable.idempotencyKey,
          createdBy: input.adminId,
        },
        select: { id: true },
      });

      // Re-check status inside the transaction so a concurrent action can't
      // cause an earning to be attached to two payouts.
      const attached = await tx.partnerEarning.updateMany({
        where: { id: { in: payable.earningIds }, status: "APPROVED", payoutId: null },
        data: { status: "PAID", paidAt: new Date(), payoutId: p.id },
      });
      if (attached.count === 0) throw new Error("RACE_LOST");

      return p;
    });

    await notifyPartner({
      partnerId: input.partnerId,
      title: `Payout ban gaya — ${inr(tds.net)}`,
      message:
        `${payable.count} earning(s) ka payout ${method} se process ho raha hai.` +
        (tds.amount > 0 ? ` TDS ${tds.rate}% (${inr(tds.amount)}) kaat ke net ${inr(tds.net)}.` : "") +
        ` Transfer confirm hote hi reference number yahan dikh jayega.`,
      link: "/partner/earnings",
    });

    return {
      ok: true,
      payoutId: payout.id,
      gross: payable.gross,
      tds,
      net: tds.net,
      count: payable.count,
      needsApproval,
    };
  } catch (e: unknown) {
    // Unique idempotencyKey — the same payable set was already turned into a payout.
    if (prismaErrorCode(e) === "P2002") {
      return { ok: false, code: "DUPLICATE", message: "Is balance ka payout pehle hi ban chuka hai" };
    }
    if (e instanceof Error && e.message === "RACE_LOST") {
      return { ok: false, code: "EMPTY", message: "Ye earnings abhi-abhi kisi aur payout me chali gayin" };
    }
    throw e;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Completing / reversing
// ─────────────────────────────────────────────────────────────────────────────

export type CompletePayoutResult =
  | { ok: true; amount: number }
  | { ok: false; code: "NOT_FOUND" | "STATE" | "NO_REFERENCE"; message: string };

/**
 * Marks the transfer done. A reference (UTR / txn id) is mandatory — without one
 * the payout cannot be reconciled against a bank statement, which is the only
 * evidence that exists that the money actually moved.
 */
export async function completePayout(input: {
  payoutId: number;
  reference: string;
  proofUrl?: string | null;
  adminId: number;
}): Promise<CompletePayoutResult> {
  const reference = input.reference?.trim().slice(0, 60);
  if (!reference) {
    return { ok: false, code: "NO_REFERENCE", message: "UTR / reference number zaroori hai" };
  }

  const payout = await db.partnerPayout.findUnique({
    where: { id: input.payoutId },
    select: {
      id: true, status: true, amount: true, grossAmount: true, tdsAmount: true, tdsRate: true,
      method: true, partnerId: true,
      partner: { select: { userId: true, user: { select: { name: true, email: true } } } },
    },
  });
  if (!payout) return { ok: false, code: "NOT_FOUND", message: "Payout nahi mila" };
  if (payout.status !== "PROCESSING") {
    return { ok: false, code: "STATE", message: `Ye payout ${payout.status} hai — complete nahi ho sakta` };
  }

  const res = await db.partnerPayout.updateMany({
    where: { id: input.payoutId, status: "PROCESSING" },
    data: {
      status: "COMPLETED",
      paidAt: new Date(),
      reference,
      proofUrl: input.proofUrl?.slice(0, 500) ?? null,
      approvedBy: input.adminId,
      approvedAt: new Date(),
    },
  });
  if (res.count === 0) {
    return { ok: false, code: "STATE", message: "Ye payout abhi-abhi kisi aur ne complete kar diya" };
  }

  await notifyPartner({
    partnerId: payout.partnerId,
    title: `Payout ho gaya — ${inr(payout.amount)} 🎉`,
    message:
      `${payout.method} se ${inr(payout.amount)} transfer kar diya gaya (ref: ${reference}).` +
      (payout.tdsAmount > 0
        ? ` Gross ${inr(payout.grossAmount)}, TDS ${payout.tdsRate}% ${inr(payout.tdsAmount)}.`
        : ""),
    link: "/partner/earnings",
  });

  if (payout.partner.user.email) {
    await sendPayoutEmail(
      payout.partner.user.email,
      payout.partner.user.name,
      payout.amount,
      payout.method,
      reference,
    ).catch((e) => console.error("[PAYOUT_EMAIL_ERROR]", e));
  }

  return { ok: true, amount: payout.amount };
}

export type ReversePayoutResult =
  | { ok: true; restored: number }
  | { ok: false; code: "NOT_FOUND" | "STATE"; message: string };

/**
 * Undoes a payout whose transfer never landed: the payout becomes FAILED and
 * every earning it swallowed goes back to APPROVED, ready for the next attempt.
 *
 * This is the only sanctioned way out of the PAID terminal state. Editing the
 * earnings directly would leave a payout row claiming money that was returned.
 */
export async function reversePayout(input: {
  payoutId: number;
  reason: string;
  adminId: number;
}): Promise<ReversePayoutResult> {
  const payout = await db.partnerPayout.findUnique({
    where: { id: input.payoutId },
    select: { id: true, status: true, amount: true, partnerId: true, reversedAt: true },
  });
  if (!payout) return { ok: false, code: "NOT_FOUND", message: "Payout nahi mila" };
  if (payout.reversedAt) return { ok: false, code: "STATE", message: "Ye payout pehle hi reverse ho chuka hai" };

  const restored = await db.$transaction(async (tx) => {
    const res = await tx.partnerEarning.updateMany({
      where: { payoutId: input.payoutId, status: "PAID" },
      data: { status: "APPROVED", paidAt: null, payoutId: null },
    });

    await tx.partnerPayout.update({
      where: { id: input.payoutId },
      data: {
        status: "FAILED",
        reversedAt: new Date(),
        reversedBy: input.adminId,
        reverseReason: input.reason.slice(0, 300),
        // Freeing the key lets a corrected payout be created for the same set.
        idempotencyKey: null,
      },
    });

    return res.count;
  });

  await notifyPartner({
    partnerId: payout.partnerId,
    title: "Payout reverse hua",
    message: `${inr(payout.amount)} ka transfer complete nahi ho paya (${input.reason}). Aapki earnings wapas approved ho gayi hain aur agle payout me aayengi.`,
    link: "/partner/earnings",
  });

  return { ok: true, restored };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Bulk
// ─────────────────────────────────────────────────────────────────────────────

export type BulkCandidate = {
  partnerId: number;
  partnerCode: string;
  name: string;
  gross: number;
  count: number;
  blocked: string | null;
};

/**
 * Every partner with a payable balance, and why each one can or cannot be paid.
 * Feeds the "sab eligible partners ka payout banao" action, which is what makes
 * a monthly cycle practical at more than a handful of partners.
 */
export async function getBulkCandidates(): Promise<BulkCandidate[]> {
  const settings = await getProgramSettings();

  const grouped = await db.partnerEarning.groupBy({
    by: ["partnerId"],
    where: { status: "APPROVED", payoutId: null },
    _sum: { amount: true },
    _count: { _all: true },
  });
  if (grouped.length === 0) return [];

  const partners = await db.partnerProfile.findMany({
    where: { id: { in: grouped.map((g) => g.partnerId) } },
    select: {
      id: true, partnerCode: true, panNumber: true, panImage: true, aadhaarNumber: true, aadhaarFrontImage: true, aadhaarBackImage: true, upiId: true,
      bankName: true, bankAccountNo: true, bankIfsc: true, kycVerifiedAt: true,
      status: true, archivedAt: true,
      user: { select: { name: true } },
    },
  });
  const byId = new Map(partners.map((p) => [p.id, p]));

  return grouped
    .map((g) => {
      const p = byId.get(g.partnerId);
      if (!p) return null;
      const gross = g._sum.amount ?? 0;

      let blocked: string | null = null;
      if (p.archivedAt) blocked = "Partner archived";
      else if (p.status !== "APPROVED") blocked = `Partner ${p.status.toLowerCase()}`;
      else {
        const gaps = kycGaps(p);
        if (gaps.length) blocked = `KYC pending: ${gaps.join(", ")}`;
        else if (gross <= 0) blocked = "Balance ₹0 ya negative";
        else if (gross < settings.minPayoutAmount) blocked = `Minimum ${inr(settings.minPayoutAmount)} se kam`;
      }

      return {
        partnerId: p.id,
        partnerCode: p.partnerCode,
        name: p.user.name,
        gross,
        count: g._count._all,
        blocked,
      };
    })
    .filter((x): x is BulkCandidate => x !== null)
    .sort((a, b) => b.gross - a.gross);
}
