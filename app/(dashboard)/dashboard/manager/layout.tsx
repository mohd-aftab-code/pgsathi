import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LogoutButton from "@/components/common/LogoutButton";
import { NotificationBell } from "@/components/common/NotificationBell";
import { db } from "@/lib/db";
import { requireManagerAccess } from "@/lib/manager-auth";
import { ManagerSidebar } from "@/components/dashboard/ManagerSidebar";
import { ManagerFAB } from "@/components/dashboard/ManagerFAB";

export const metadata = {
  title: "CRM Workspace — PGSathi",
};

export const dynamic = "force-dynamic";

export default async function ManagerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, name, managerRole, isOwner, trial, hasPaidPlan } = await requireManagerAccess();

  // Optional modules — owner-level preferences that drive the sidebar nav items.
  const owner = await db.user.findUnique({
    where: { id: userId },
    select: { messMenuEnabled: true, expensesEnabled: true },
  });
  const messEnabled = owner?.messMenuEnabled ?? false;
  const expensesEnabled = owner?.expensesEnabled ?? false;

  const roleColors: Record<string, string> = {
    MANAGER:    "bg-violet-100 text-violet-700",
    WARDEN:     "bg-blue-100 text-blue-700",
    ACCOUNTANT: "bg-green-100 text-green-700",
    OWNER:      "bg-amber-100 text-amber-700"
  };
  const roleBadgeCls = roleColors[managerRole] ?? "bg-neutral-100 text-neutral-600";

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Sidebar — fixed, full height, flush to the screen edge, owns the brand logo ─ */}
      {/* ── and shifts the content below to the right when expanded ────────────────── */}
      <ManagerSidebar isOwner={isOwner} messEnabled={messEnabled} expensesEnabled={expensesEnabled}>
        {/* ── Top Header ────────────────────────────────────── */}
        <header className="bg-white/70 backdrop-blur-2xl border-b border-white/50 sticky top-0 z-20 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="section-padding h-16 flex items-center justify-between gap-3">
            {/* Symmetric to the owner layout's "PG Manager →" button — owners
                can switch back to the owner dashboard from here. Staff managers
                don't have an owner dashboard, so they just see the label. */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-neutral-500 text-sm font-semibold hidden sm:block shrink-0">
                CRM Workspace
              </span>
              {isOwner && (
                <>
                  <span className="w-px h-5 bg-neutral-200 hidden sm:block shrink-0" />
                  <Link
                    href="/dashboard/owner"
                    className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-xs sm:text-sm font-bold border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors shrink-0 shadow-sm"
                  >
                    <ArrowLeft size={15} />
                    Owner Dashboard
                  </Link>
                </>
              )}
            </div>

            {/* User info */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-neutral-800 line-clamp-1 max-w-[150px]">
                    {name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${roleBadgeCls}`}>
                    {managerRole}
                  </span>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-violet-100 to-violet-50 border border-violet-200 text-violet-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  {name?.charAt(0).toUpperCase() || "M"}
                </div>
              </div>
              <NotificationBell viewAllHref="/dashboard/manager/notifications" />
              <div className="w-px h-6 bg-neutral-200 hidden sm:block"></div>
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* ── Main Content Area ────────────────────────────── */}
        <div className="section-padding py-6 pb-24 lg:pb-16">
          <main className="w-full min-w-0">
            {isOwner && !hasPaidPlan && trial?.active && (
              <div className="mb-6 rounded-xl bg-indigo-50 border border-indigo-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div>
                  <h3 className="font-bold text-indigo-900">CRM Premium Trial Active</h3>
                  <p className="text-sm text-indigo-700">
                    You have <strong>{trial.daysLeft} days left</strong> in your free trial. Upgrade now to avoid losing access to rent tracking and lead contacts.
                  </p>
                </div>
                <Link href="/dashboard/owner/subscription/upgrade" className="btn-primary shrink-0 text-sm py-2 bg-indigo-600 hover:bg-indigo-700 border-none">
                  Upgrade Now
                </Link>
              </div>
            )}
            {children}
            {/* Global Quick-Action FAB */}
            <ManagerFAB />
          </main>
        </div>
      </ManagerSidebar>
    </div>
  );
}
