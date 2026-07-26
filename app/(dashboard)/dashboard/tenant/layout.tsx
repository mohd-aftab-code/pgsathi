import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LogoutButton from "@/components/common/LogoutButton";
import { NotificationBell } from "@/components/common/NotificationBell";
import { TenantSidebar } from "@/components/dashboard/TenantSidebar";

export const metadata = {
  title: "Tenant Dashboard - PGSathi",
};

/**
 * The nav lives in TenantSidebar (a client component) because Lucide icons are
 * functions and cannot cross the Server→Client boundary. This file stays a
 * Server Component so the auth guard runs before anything renders.
 */
export default async function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/tenant");
  }

  // ✅ SECURE: Only TENANT role can access this dashboard
  // Admins, Owners, Managers should be on their own dashboards
  const role = session.user?.role;
  const isManager = (session.user as any)?.isManager;
  if (isManager || role !== "TENANT") {
    redirect("/dashboard");
  }

  const name = session.user.name || "Tenant";
  const initial = name.charAt(0).toUpperCase();

  // Bottom of the desktop rail — the same slot every other role uses for identity.
  const footer = (
    <div className="rounded-xl bg-white border border-violet-100 p-3 shadow-sm">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 grid place-items-center font-bold text-sm shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-neutral-900 truncate">{name}</p>
          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Tenant</p>
        </div>
      </div>
      <LogoutButton className="w-full h-9 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer" />
    </div>
  );

  return (
    <TenantSidebar footer={footer}>
      <div className="min-h-screen bg-canvas">
        {/* Mobile top bar — on a phone the rail is gone, so identity, the bell and
            logout live here instead. */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-neutral-200">
          <div className="h-14 px-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 grid place-items-center font-bold text-sm shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-900 truncate leading-tight">{name}</p>
                <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Tenant</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <NotificationBell viewAllHref="/dashboard/tenant/notifications" />
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Desktop keeps the bell in a slim bar; the rail has no room for it. */}
        <div className="hidden lg:flex items-center justify-end px-8 pt-6">
          <NotificationBell viewAllHref="/dashboard/tenant/notifications" />
        </div>

        {/* pb-28 keeps the last row clear of the fixed mobile tab bar. */}
        <main className="p-4 pb-28 sm:p-6 sm:pb-28 lg:px-8 lg:pt-4 lg:pb-8">{children}</main>
      </div>
    </TenantSidebar>
  );
}
