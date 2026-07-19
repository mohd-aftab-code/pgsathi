import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Heart, CalendarClock, Receipt, Settings, User, Wrench } from "lucide-react";
import LogoutButton from "@/components/common/LogoutButton";
import Image from "next/image";
import logoImg from "@/app/assets/logo/logo.png";
export const metadata = {
  title: "Tenant Dashboard - PGSathi",
};

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

  const navItems = [
    { name: "My Profile", href: "/dashboard/tenant", icon: User },
    { name: "Saved PGs", href: "/dashboard/tenant/saved", icon: Heart },
    { name: "Rent Receipts", href: "/dashboard/tenant/receipts", icon: Receipt },
    { name: "My Complaints", href: "/dashboard/tenant/complaints", icon: Wrench },
    { name: "Settings", href: "/dashboard/tenant/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ── Top Header ──────────────────────────────────────── */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="section-padding h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image 
              src={logoImg} 
              alt="PGSathi Logo" 
              width={100}
              height={36}
              priority
              className="h-8 w-auto object-contain mix-blend-multiply" 
            />
            <div>
              <span className="text-neutral-400 text-xs ml-1 font-medium">/ Tenant</span>
            </div>
          </Link>

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-neutral-800 line-clamp-1 max-w-[150px]">
                {session.user.name || "Tenant"}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 uppercase">
                TENANT
              </span>
            </div>
            <div className="w-9 h-9 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
              {session.user.name?.charAt(0).toUpperCase() || "T"}
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="section-padding py-6 flex flex-col lg:flex-row gap-8 pb-24 lg:pb-16">
        
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className="hidden lg:block w-56 shrink-0">
          <nav className="bg-white rounded-2xl p-3 border border-neutral-200 shadow-sm sticky top-24">
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Menu
              </p>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* ── Main Content Area ──────────────────────────────── */}
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar ─────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-violet-700 hover:bg-neutral-50 rounded-xl transition-colors gap-1"
              >
                <Icon size={20} />
                <span className="text-[9px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
