/**
 * lib/manager-auth.ts
 * Auth helpers for the PG Manager role.
 */
import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPlanTier } from "@/lib/manage-auth";

/**
 * Checks that the current user is a logged-in MANAGER.
 * Returns the owner's ID as `userId` so it's compatible with owner manage pages.
 */
export async function requireManagerAccess() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/manager");
  }

  const isManager = (session.user as any).isManager;
  const isOwner = session.user.role === "OWNER" || session.user.role === "ADMIN";

  if (!isManager && !isOwner) {
    redirect("/dashboard");
  }

  let ownerId: number;
  let managerRole = "OWNER";
  let name = session.user.name ?? "Owner";

  if (isManager) {
    ownerId = (session.user as any).ownerId as number;
    managerRole = (session.user as any).managerRole as string;
    name = session.user.name ?? "Manager";
  } else {
    ownerId = parseInt(session.user.id);
  }

  const tier = await getPlanTier(ownerId);

  // Optional: Gate features based on tier for owners
  // if (isOwner && (tier === "NONE" || tier === "STARTER")) {
  //   redirect("/dashboard/owner/subscription");
  // }

  return {
    userId: ownerId,
    tier,
    name,
    email: session.user.email ?? "",
    managerRole,
    isOwner,
    isManager
  };
}

export { logPgAudit } from "@/lib/manage-auth";
