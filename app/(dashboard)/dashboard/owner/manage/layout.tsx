/**
 * app/(main)/dashboard/owner/manage/layout.tsx
 * Layout for all /dashboard/owner/manage/* pages.
 * - Checks auth + plan access
 * - Wraps content with ManageSidebar
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPlanTier } from "@/lib/manage-auth";
import { ManageSidebarWrapper } from "@/components/manage/ManageSidebarWrapper";
import { PlanGate } from "@/components/manage/PlanGate";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "PG Manager — PGSathi",
};

export default async function ManageLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/owner/manage");
  }

  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/dashboard/owner");
  }

  const userId = parseInt(session.user.id);
  const tier   = await getPlanTier(userId);
  const hasPaidPlan = tier === "GROWTH" || tier === "PRO";

  if (!hasPaidPlan) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <div className="container-max section-padding py-8">
          <PlanGate currentPlan={tier === "NONE" ? "No Plan" : tier} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <ManageSidebarWrapper
        ownerName={session.user.name ?? "Owner"}
        planTier={tier}
      >
        {children}
      </ManageSidebarWrapper>
    </div>
  );
}
