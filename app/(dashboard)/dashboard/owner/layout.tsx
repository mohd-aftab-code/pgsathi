import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Building2, Star, CreditCard, MessageSquare, Settings, Layers } from "lucide-react";
import LogoutButton from "@/components/common/LogoutButton";

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

  const navItems = [
    { name: "Overview", href: "/dashboard/owner", icon: LayoutDashboard },
    { name: "My PGs", href: "/dashboard/owner/listings", icon: Building2 },
    { name: "PG Manager", href: "/dashboard/owner/manage", icon: Layers, hideMobile: false },
    { name: "Inventory", href: "/dashboard/owner/inventory", icon: Layers, hideMobile: true },
    { name: "Leads", href: "/dashboard/owner/leads", icon: MessageSquare },
    { name: "Reviews", href: "/dashboard/owner/reviews", icon: Star, hideMobile: true },
    { name: "Settings", href: "/dashboard/owner/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ── Top Header ──────────────────────────────────────── */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container-max section-padding h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-sm">
              <Building2 size={16} className="text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-neutral-900">PGSathi</span>
              <span className="text-neutral-400 text-xs ml-1">/ Owner</span>
            </div>
          </Link>

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-neutral-800 line-clamp-1 max-w-[150px]">
                {session.user.name || "Owner"}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 uppercase">
                {session.user.role || "OWNER"}
              </span>
            </div>
            <div className="w-9 h-9 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
              {session.user.name?.charAt(0).toUpperCase() || "O"}
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="container-max section-padding py-6 flex flex-col lg:flex-row gap-8 pb-24 lg:pb-16">
        
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
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
          {navItems.filter(item => !item.hideMobile).slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-orange-600 hover:bg-neutral-50 rounded-xl transition-colors gap-1"
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
