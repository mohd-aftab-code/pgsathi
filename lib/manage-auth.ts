/**
 * lib/manage-auth.ts
 * Plan check helpers for the PG Manager feature.
 * Only GROWTH and PRO plan subscribers get access.
 */
import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { readCapabilities, NO_CAPABILITIES, type PlanCapabilities } from "@/lib/plan-capabilities";

export type PlanTier = "NONE" | "STARTER" | "GROWTH" | "PRO" | "SCALE" | "ENTERPRISE";

/** Every tier that counts as a paid subscription. Add new paid tiers here only. */
export const PAID_TIERS: PlanTier[] = ["GROWTH", "PRO", "SCALE", "ENTERPRISE"];

export function isPaidTier(tier: string): boolean {
  return (PAID_TIERS as string[]).includes(tier);
}

/**
 * Accounts created before this cutoff keep the old "free 15-day CRM trial on
 * signup" behavior. Accounts created at/after it get no automatic trial —
 * they're routed to the plans page when they try to open PG Manager, and
 * must pick a paid plan (or stay on the free Starter tier's own limits).
 */
export const TRIAL_CUTOFF = new Date("2026-07-18T07:06:51.477Z");

export async function isTrialActive(userId: number): Promise<{ active: boolean; daysLeft: number; endDate: Date }> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { createdAt: true } });
  if (!user) return { active: false, daysLeft: 0, endDate: new Date() };

  if (user.createdAt >= TRIAL_CUTOFF) {
    return { active: false, daysLeft: 0, endDate: user.createdAt };
  }

  const trialEndDate = new Date(user.createdAt);
  trialEndDate.setDate(trialEndDate.getDate() + 15);
  
  const now = new Date();
  const diffTime = trialEndDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    active: daysLeft > 0,
    daysLeft: daysLeft > 0 ? daysLeft : 0,
    endDate: trialEndDate
  };
}

/**
 * Returns the active plan tier for a given userId. "NONE" if no active sub.
 *
 * Wrapped with React cache() so multiple callers in the same server render
 * (e.g. layout + page) share a single Postgres round-trip instead of each
 * issuing their own query.
 */
export const getPlanTier = cache(async (userId: number): Promise<PlanTier> => {
  const sub = await db.subscription.findFirst({
    where: {
      userId,
      status: { in: ["ACTIVE", "TRIAL"] },
      endDate: { gt: new Date() },
    },
    include: { plan: true },
    orderBy: { endDate: "desc" },
  });

  if (!sub) return "NONE";

  const slug = sub.plan.slug.toUpperCase();
  // Order matters — check the highest tier first so a slug never falls through.
  if (slug.includes("ENTERPRISE")) return "ENTERPRISE";
  if (slug.includes("SCALE")) return "SCALE";
  if (slug.includes("PRO")) return "PRO";
  if (slug.includes("GROWTH") || slug.includes("BASIC")) return "GROWTH";
  return "STARTER";
});

/**
 * The feature switches for a user's active plan — the DB-driven replacement for
 * hardcoded `tier === "PRO"` gates. No active plan → nothing unlocked. During a
 * trial the trial plan's own capabilities apply (same as its tier did before).
 *
 * Wrapped with React cache() — same reasoning as getPlanTier.
 */
export const getPlanCapabilities = cache(async (userId: number): Promise<PlanCapabilities> => {
  const sub = await db.subscription.findFirst({
    where: { userId, status: { in: ["ACTIVE", "TRIAL"] }, endDate: { gt: new Date() } },
    include: { plan: true },
    orderBy: { endDate: "desc" },
  });
  if (!sub) return NO_CAPABILITIES;
  return readCapabilities(sub.plan.capabilities);
});

/**
 * Checks that the current user is a logged-in OWNER with an active
 * paid plan (GROWTH or PRO). Redirects otherwise.
 * Returns { userId, tier, name, email }.
 */
export async function requireManageAccess() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/owner/manage");
  }

  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/dashboard/owner");
  }

  const userId = parseInt(session.user.id);
  const tier = await getPlanTier(userId);

  if (tier === "NONE" || tier === "STARTER") {
    redirect("/dashboard/owner/subscription");
  }

  return {
    userId,
    tier,
    name: session.user.name ?? "Owner",
    email: session.user.email ?? "",
  };
}

/**
 * Returns auth context without redirecting — for layout checks
 * where we want to show the page with gating rather than hard redirect.
 */
export async function getManageContext() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const isManager = (session.user as any).isManager;
  let userId: number;
  let name: string;
  let role: string;

  if (isManager) {
    userId = (session.user as any).ownerId as number;
    name = session.user.name ?? "Manager";
    role = "MANAGER";
  } else {
    userId = parseInt(session.user.id);
    name = session.user.name ?? "Owner";
    role = session.user.role ?? "OWNER";
  }

  // Which PGs this session may touch. The owner always sees all of theirs; a
  // manager sees only the ones assigned to them. `null` means "no restriction"
  // and is what callers should treat as full access — an empty array would
  // otherwise be ambiguous with "assigned to nothing".
  const allowedListingIds = await resolveAllowedListings(session, userId, isManager);

  const [tier, trial, capabilities] = await Promise.all([
    getPlanTier(userId),
    isTrialActive(userId),
    getPlanCapabilities(userId),
  ]);

  return {
    userId,
    tier,
    name,
    role,
    email: session.user.email ?? "",
    hasPaidPlan: isPaidTier(tier),
    hasAccess: isPaidTier(tier) || trial.active,
    capabilities,
    allowedListingIds,
    isManager: !!isManager,
  };
}

/**
 * The listing ids this session is limited to, or null for no limit.
 *
 * Read from the DB rather than the JWT so that revoking a manager's access to a
 * PG takes effect on their very next request instead of whenever their token
 * happens to refresh.
 */
export async function resolveAllowedListings(
  session: any,
  ownerId: number,
  isManager: boolean,
): Promise<number[] | null> {
  if (!isManager) return null; // the owner sees every PG they own

  const email = session.user?.email;
  if (!email) return [];

  const member = await db.pgTeamMember.findUnique({
    where: { email },
    select: { listingIds: true, active: true, ownerId: true },
  });
  if (!member || !member.active || member.ownerId !== ownerId) return [];

  try {
    const parsed = JSON.parse(member.listingIds ?? "[]");
    if (!Array.isArray(parsed) || parsed.length === 0) return null; // "[]" = all PGs
    return parsed.map((n: unknown) => parseInt(String(n))).filter((n) => !Number.isNaN(n));
  } catch {
    return null;
  }
}

/**
 * A Prisma `where` fragment that scopes a query to the PGs this session may see.
 * Pass the name of the listing-id column on the model being queried.
 *
 *   where: { ownerId: ctx.userId, ...listingScope(ctx, "listingId") }
 */
export function listingScope(
  ctx: { allowedListingIds: number[] | null },
  field: string = "listingId",
): Record<string, unknown> {
  if (ctx.allowedListingIds === null) return {};
  return { [field]: { in: ctx.allowedListingIds } };
}

/** Logs an audit entry for an owner action. Never throws. */
export async function logPgAudit(
  ownerId: number,
  actor: string,
  action: string,
  entity?: string
) {
  try {
    await db.pgAuditLog.create({
      data: { ownerId, actor, action, entity: entity ?? null },
    });
  } catch {
    // Audit failures should not break user flows
  }
}
