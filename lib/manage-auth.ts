/**
 * lib/manage-auth.ts
 * Plan check helpers for the PG Manager feature.
 * Only GROWTH and PRO plan subscribers get access.
 */
import "server-only";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type PlanTier = "NONE" | "STARTER" | "GROWTH" | "PRO" | "SCALE";

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

/** Returns the active plan tier for a given userId. "NONE" if no active sub. */
export async function getPlanTier(userId: number): Promise<PlanTier> {
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
  if (slug.includes("SCALE")) return "SCALE";
  if (slug.includes("PRO")) return "PRO";
  if (slug.includes("GROWTH") || slug.includes("BASIC")) return "GROWTH";
  return "STARTER";
}

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

  const tier = await getPlanTier(userId);
  const trial = await isTrialActive(userId);

  return {
    userId,
    tier,
    name,
    role,
    email: session.user.email ?? "",
    hasPaidPlan: tier === "GROWTH" || tier === "PRO" || tier === "SCALE",
    hasAccess: tier === "GROWTH" || tier === "PRO" || tier === "SCALE" || trial.active,
  };
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
