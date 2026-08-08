/**
 * lib/plans.ts
 * Canonical owner subscription plan prices.
 * Server routes must derive amounts from here — never trust a client-supplied amount.
 */
export type PlanId = "free" | "standard" | "pro" | "growth";

export const PLANS: Record<PlanId, { name: string; price: number; duration: string }> = {
  free:     { name: "Starter",    price: 0,    duration: "30 Days" },
  standard: { name: "Standard",   price: 1499, duration: "1 Month" },
  pro:      { name: "Pro",        price: 2199, duration: "1 Month" },
  growth:   { name: "Growth",     price: 3999, duration: "1 Month" },
};

/**
 * Tenant / property caps per plan. Unlimited (-1) is reserved for Enterprise —
 * every plan below it has a hard number so there is a reason to move up.
 * The DB `Plan` rows are the runtime source of truth; this mirrors them so a
 * missing row can be re-created identically.
 */
export const PLAN_LIMITS: Record<PlanId, { maxListings: number; maxPhotos: number; maxTenants: number }> = {
  free:     { maxListings: 1,  maxPhotos: 5,  maxTenants: 5 },
  standard: { maxListings: 1,  maxPhotos: 15, maxTenants: 50 },
  pro:      { maxListings: 3,  maxPhotos: 30, maxTenants: 150 },
  growth:   { maxListings: -1, maxPhotos: 99, maxTenants: -1 },
};

export function isValidPlanId(planId: string): planId is PlanId {
  return planId === "free" || planId === "standard" || planId === "pro" || planId === "growth";
}

export const GST_RATE = 0.18;

/**
 * The amount actually charged. Listed prices are GST-INCLUSIVE, so this is
 * simply the listed price — nothing is added on top at checkout.
 */
export function getPlanTotalAmount(planId: PlanId): number {
  return PLANS[planId].price;
}

/**
 * Splits a GST-inclusive price back into taxable value + GST, for the invoice
 * breakdown. base = price / 1.18; the GST line takes the rounding remainder so
 * base + gst always adds up exactly to the listed price.
 */
export function getPlanPriceBreakdown(planId: PlanId): { base: number; gst: number; total: number } {
  const total = PLANS[planId].price;
  const base = Math.round(total / (1 + GST_RATE));
  return { base, gst: total - base, total };
}
