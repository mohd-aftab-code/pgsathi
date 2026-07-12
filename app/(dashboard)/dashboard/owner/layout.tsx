import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Building2 } from "lucide-react";
import LogoutButton from "@/components/common/LogoutButton";
import { OwnerSidebar } from "@/components/dashboard/OwnerSidebar";
import Image from "next/image";
import logoImg from "@/app/assets/logo/logo.png";
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
      {/* ── Top Header ──────────────────────────────────────── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/60 sticky top-0 z-40 shadow-sm">
        <div className="container-max section-padding h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image 
              src={logoImg} 
              alt="PGSathi Logo" 
              width={100}
              height={36}
              priority
              className="h-8 w-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform" 
            />
            <div className="flex items-baseline gap-1.5">
              <span className="text-neutral-400 text-xs font-medium">/ Owner</span>
            </div>
          </Link>

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

      <div className="container-max section-padding py-6 flex flex-col lg:flex-row gap-8 pb-24 lg:pb-16">
        
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <OwnerSidebar hasPaidPlan={hasPaidPlan} trialDaysLeft={trial.active ? trial.daysLeft : 0} />

        {/* ── Main Content Area ──────────────────────────────── */}
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
