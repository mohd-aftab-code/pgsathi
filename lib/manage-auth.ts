/**
 * lib/manage-auth.ts
 * Plan check helpers for the PG Manager feature.
 * Only GROWTH and PRO plan subscribers get access.
 */
import "server-only";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type PlanTier = "NONE" | "STARTER" | "GROWTH" | "PRO";

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

  return {
    userId,
    tier,
    name,
    role,
    email: session.user.email ?? "",
    hasPaidPlan: tier === "GROWTH" || tier === "PRO",
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
