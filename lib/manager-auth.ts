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
  if (!isManager) {
    redirect("/dashboard");
  }

  const ownerId = (session.user as any).ownerId as number;
  const managerRole = (session.user as any).managerRole as string;
  const tier = await getPlanTier(ownerId);

  return {
    userId: ownerId,
    tier,
    name: session.user.name ?? "Manager",
    email: session.user.email ?? "",
    managerRole,
  };
}

export { logPgAudit } from "@/lib/manage-auth";
