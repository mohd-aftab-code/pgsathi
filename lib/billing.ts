/**
 * lib/billing.ts
 * One place that knows what a billing cycle costs and how long it lasts.
 *
 * Every cycle price is a column on the Plan row, so the super-admin controls all
 * four from the Plans panel. A null column means that cycle isn't offered for
 * that plan — callers must treat null as "not purchasable", never as free.
 */
import type { BillingCycle } from "@prisma/client";

export const BILLING_CYCLES = ["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"] as const;
export type CycleId = (typeof BILLING_CYCLES)[number];

type CycleMeta = {
  label: string;
  shortLabel: string;
  months: number;
  /** Plan column holding this cycle's price. */
  priceField: "price" | "quarterlyPrice" | "halfYearlyPrice" | "yearlyPrice";
};

export const CYCLE_META: Record<CycleId, CycleMeta> = {
  MONTHLY:     { label: "Monthly",   shortLabel: "1 Month",  months: 1,  priceField: "price" },
  QUARTERLY:   { label: "3 Months",  shortLabel: "3 Month",  months: 3,  priceField: "quarterlyPrice" },
  HALF_YEARLY: { label: "6 Months",  shortLabel: "6 Month",  months: 6,  priceField: "halfYearlyPrice" },
  YEARLY:      { label: "1 Year",    shortLabel: "1 Year",   months: 12, priceField: "yearlyPrice" },
};

export function isValidCycle(v: unknown): v is CycleId {
  return typeof v === "string" && (BILLING_CYCLES as readonly string[]).includes(v);
}

type PricedPlan = {
  price: number;
  quarterlyPrice?: number | null;
  halfYearlyPrice?: number | null;
  yearlyPrice?: number | null;
};

/**
 * Price of one cycle, or null when the plan doesn't offer it.
 *
 * MONTHLY always resolves (`price` is non-null on every plan). A free plan
 * legitimately returns 0 for MONTHLY — callers distinguish "free" (0) from
 * "not offered" (null), which is why this returns null rather than 0 on a miss.
 */
export function priceForCycle(plan: PricedPlan, cycle: CycleId): number | null {
  const raw = plan[CYCLE_META[cycle].priceField];
  return typeof raw === "number" ? raw : null;
}

/** Every cycle a plan can actually be bought on, cheapest-first by duration. */
export function availableCycles(plan: PricedPlan): { cycle: CycleId; price: number; meta: CycleMeta }[] {
  return BILLING_CYCLES.flatMap((cycle) => {
    const price = priceForCycle(plan, cycle);
    return price === null ? [] : [{ cycle, price, meta: CYCLE_META[cycle] }];
  });
}

/** End of a billing period that starts at `from`. */
export function cycleEndDate(from: Date, cycle: CycleId): Date {
  const end = new Date(from);
  end.setMonth(end.getMonth() + CYCLE_META[cycle].months);
  return end;
}

/**
 * What one month of a cycle effectively costs — used to show "₹1,033/month" on a
 * 6-month plan so buyers can compare cycles honestly. Rounded, display only.
 */
export function effectiveMonthly(price: number, cycle: CycleId): number {
  return Math.round(price / CYCLE_META[cycle].months);
}

/** Percent saved versus paying the monthly rate for the same duration. 0 if none. */
export function cycleSavingPercent(plan: PricedPlan, cycle: CycleId): number {
  const price = priceForCycle(plan, cycle);
  if (price === null || plan.price <= 0) return 0;
  const straight = plan.price * CYCLE_META[cycle].months;
  if (straight <= price) return 0;
  return Math.round(((straight - price) / straight) * 100);
}

export function cycleLabel(cycle: BillingCycle | CycleId): string {
  return CYCLE_META[cycle as CycleId]?.shortLabel ?? String(cycle);
}
