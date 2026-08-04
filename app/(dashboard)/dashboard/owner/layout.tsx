import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Sparkles, Layers, Lock, ArrowRight } from "lucide-react";
import LogoutButton from "@/components/common/LogoutButton";
import { NotificationBell } from "@/components/common/NotificationBell";
import { OwnerSidebar } from "@/components/dashboard/OwnerSidebar";
import { getPlanTier, isTrialActive, isPaidTier, getPlanCapabilities } from "@/lib/manage-auth";

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
  const [tier, trial, capabilities] = await Promise.all([
    getPlanTier(userId),
    isTrialActive(userId),
    getPlanCapabilities(userId),
  ]);
  const hasPaidPlan = isPaidTier(tier);
  // Same rule the sidebar used: a live trial gets in too, so owners can try the
  // CRM before paying. The /dashboard/manager route re-checks this itself.
  const hasManagerAccess = hasPaidPlan || trial.active;
  // Ads hide when the plan's adsFree capability is on (super-admin controlled).
  const showAds = !capabilities.adsFree;

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Sidebar — fixed, full height, flush to the screen edge, owns the brand logo ─ */}
      {/* ── and shifts the content below to the right when expanded ────────────────── */}
      <OwnerSidebar hasPaidPlan={hasPaidPlan} trialDaysLeft={trial.active ? trial.daysLeft : 0} tier={tier} showAds={showAds}>
        {/* ── Top Header ────────────────────────────────────── */}
        <header className="bg-white/70 backdrop-blur-2xl border-b border-white/50 sticky top-0 z-20 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="section-padding h-16 flex items-center justify-between gap-3">
            {/* PG Manager is a separate application, not another page of this
                dashboard. In the sidebar it sat between "My PGs" and "Bed
                Report" and read as a sibling page, which is what made it
                confusing. Up here, beside the current context, it reads as what
                it is: a switch into the other app. It lives in the shared
                header so it stays reachable from every owner page. */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-neutral-500 text-sm font-semibold hidden sm:block shrink-0">
                Owner Dashboard
              </span>
              <span className="w-px h-5 bg-neutral-200 hidden sm:block shrink-0" />
              <Link
                href={hasManagerAccess ? "/dashboard/manager" : "/dashboard/owner/subscription/upgrade"}
                className={`inline-flex items-center gap-2 h-10 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 shrink-0 shadow-md ${
                  hasManagerAccess
                    ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 hover:scale-[1.02] shadow-violet-500/25 border border-violet-400/30"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:scale-[1.02] shadow-amber-500/25"
                }`}
              >
                {hasManagerAccess ? (
                  <Sparkles size={16} className="text-amber-300 animate-pulse shrink-0" />
                ) : (
                  <Lock size={15} className="shrink-0" />
                )}
                <span>Launch PG Manager 🚀</span>
                {!hasManagerAccess ? (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/20 text-white uppercase tracking-wider">
                    Pro
                  </span>
                ) : (
                  <ArrowRight size={14} className="ml-0.5 opacity-90 shrink-0" />
                )}
              </Link>
            </div>

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
              <NotificationBell viewAllHref="/dashboard/owner/notifications" />
              <div className="w-px h-6 bg-neutral-200 hidden sm:block"></div>
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* ── Main Content Area ────────────────────────────── */}
        <div className="section-padding py-6 pb-24 lg:pb-16">
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
