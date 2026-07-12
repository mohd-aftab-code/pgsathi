/**
 * lib/plans.ts
 * Canonical owner subscription plan prices.
 * Server routes must derive amounts from here — never trust a client-supplied amount.
 */
export type PlanId = "free" | "basic" | "pro";

export const PLANS: Record<PlanId, { name: string; price: number; duration: string }> = {
  free:  { name: "Starter",   price: 0,    duration: "30 Days" },
  basic: { name: "Growth",    price: 349,  duration: "1 Month" },
  pro:   { name: "Pro Owner", price: 1799, duration: "1 Month" },
};

export function isValidPlanId(planId: string): planId is PlanId {
  return planId === "free" || planId === "basic" || planId === "pro";
}

/** Base price + 18% GST, rounded — matches the checkout page's displayed total. */
export function getPlanTotalAmount(planId: PlanId): number {
  const base = PLANS[planId].price;
  return base + Math.round(base * 0.18);
}
