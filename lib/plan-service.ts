/**
 * lib/plan-service.ts (server-only)
 * The authoritative, super-admin-controlled plan amounts — read from the DB.
 *
 * Payment routes MUST get the charge amount from here, never from anything the
 * client sends. The DB row is the source of truth; the hardcoded PLANS map is a
 * last-resort fallback so a missing row can't break checkout.
 */
import "server-only";
import { db } from "@/lib/db";
import { PLANS, isValidPlanId, GST_RATE } from "@/lib/plans";
import { priceForCycle, type CycleId } from "@/lib/billing";

/**
 * Charge amount (GST-inclusive) for a plan slug on a billing cycle.
 *
 * Returns null both for "no such plan" and for "this plan doesn't offer that
 * cycle" — callers must reject, never fall back to the monthly price. Charging
 * ₹1199 for a purchase the app then records as a 6-month subscription is exactly
 * the bug this signature exists to prevent.
 */
export async function getServerPlanAmount(
  slug: string,
  cycle: CycleId = "MONTHLY",
): Promise<number | null> {
  const plan = await db.plan.findUnique({
    where: { slug },
    select: { price: true, quarterlyPrice: true, halfYearlyPrice: true, yearlyPrice: true, isActive: true },
  });
  if (plan) return priceForCycle(plan, cycle);
  // Fallback: a canonical slug whose row hasn't been created yet. Only the
  // monthly price exists in the hardcoded map.
  if (isValidPlanId(slug)) return cycle === "MONTHLY" ? PLANS[slug].price : null;
  return null;
}

/** Taxable value + GST split of the (GST-inclusive) amount, for the invoice view. */
export async function getServerPlanBreakdown(
  slug: string,
  cycle: CycleId = "MONTHLY",
): Promise<{ base: number; gst: number; total: number } | null> {
  const total = await getServerPlanAmount(slug, cycle);
  if (total === null) return null;
  const base = Math.round(total / (1 + GST_RATE));
  return { base, gst: total - base, total };
}
