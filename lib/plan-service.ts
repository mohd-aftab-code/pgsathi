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

/** Charge amount (GST-inclusive) for a plan slug, or null if no such plan. */
export async function getServerPlanAmount(slug: string): Promise<number | null> {
  const plan = await db.plan.findUnique({ where: { slug }, select: { price: true, isActive: true } });
  if (plan) return plan.price;
  // Fallback: a canonical slug whose row hasn't been created yet.
  if (isValidPlanId(slug)) return PLANS[slug].price;
  return null;
}

/** Taxable value + GST split of the (GST-inclusive) amount, for the invoice view. */
export async function getServerPlanBreakdown(
  slug: string
): Promise<{ base: number; gst: number; total: number } | null> {
  const total = await getServerPlanAmount(slug);
  if (total === null) return null;
  const base = Math.round(total / (1 + GST_RATE));
  return { base, gst: total - base, total };
}
