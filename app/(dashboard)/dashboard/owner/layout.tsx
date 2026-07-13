import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import LogoutButton from "@/components/common/LogoutButton";
import { OwnerSidebar } from "@/components/dashboard/OwnerSidebar";
import { getPlanTier, isTrialActive } from "@/lib/manage-auth";

export const metadata = {
  title: "Owner Dashboard - PGSathi",
};

export const dynamic = "force-dynamic";

export default async function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session) {
    redirect("/login?callbackUrl=/dashboard/owner");
  }

  // ✅ SECURE: Only OWNER role can access this dashboard
  if (session.user?.role !== "OWNER") {
    redirect("/dashboard");
  }

  const userId = parseInt(session.user.id);
  const [tier, trial] = await Promise.all([getPlanTier(userId), isTrialActive(userId)]);
  const hasPaidPlan = tier === "GROWTH" || tier === "PRO";

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* ── Sidebar — fixed, full height, flush to the screen edge, owns the brand logo ─ */}
      {/* ── and shifts the content below to the right when expanded ────────────────── */}
      <OwnerSidebar hasPaidPlan={hasPaidPlan} trialDaysLeft={trial.active ? trial.daysLeft : 0}>
        {/* ── Top Header ────────────────────────────────────── */}
        <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/60 sticky top-0 z-20 shadow-sm">
          <div className="container-max section-padding h-16 flex items-center justify-between">
            <span className="text-neutral-500 text-sm font-semibold">Owner Dashboard</span>

            {/* User info */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-neutral-800 line-clamp-1 max-w-[150px]">
                    {session.user.name || "Owner"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-50 text-primary-600 uppercase tracking-wider">
                    {session.user.role || "OWNER"}
                  </span>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-primary-100 to-primary-50 border border-primary-200 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  {session.user.name?.charAt(0).toUpperCase() || "O"}
                </div>
              </div>
              <div className="w-px h-6 bg-neutral-200 hidden sm:block"></div>
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* ── Main Content Area ────────────────────────────── */}
        <div className="container-max section-padding py-6 pb-24 lg:pb-16">
          <main className="w-full min-w-0">
            {/* Mobile-only trial/upgrade reminder (desktop version lives in the sidebar) */}
            {!hasPaidPlan && (
              <div className="lg:hidden mb-5">
                {trial.active ? (
                  <Link
                    href="/dashboard/owner/subscription/upgrade"
                    className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100/50 border border-primary-100 px-4 py-3"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                      <Sparkles size={16} className="text-primary-600 shrink-0" />
                      {trial.daysLeft} {trial.daysLeft === 1 ? "day" : "days"} left in free trial
                    </span>
                    <span className="text-xs font-bold text-primary-700 shrink-0">Upgrade →</span>
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/owner/subscription/upgrade"
                    className="flex items-center justify-between gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-red-900">Trial expired — upgrade to continue</span>
                    <span className="text-xs font-bold text-red-700 shrink-0">Upgrade →</span>
                  </Link>
                )}
              </div>
            )}
            {children}
          </main>
        </div>
      </OwnerSidebar>
    </div>
  );
}
