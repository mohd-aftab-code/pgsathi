import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  Wrench,
  ChefHat,
  BellRing,
  LogOut,
  Building2,
  ArrowRight,
} from "lucide-react";
import LogoutButton from "@/components/common/LogoutButton";
import Image from "next/image";
import logoImg from "@/app/assets/logo/logo.png";
export const metadata = {
  title: "Manager Dashboard — PGSathi",
};

export const dynamic = "force-dynamic";

export default async function ManagerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Only managers can access this
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/manager");
  }

  const isManager = (session.user as any).isManager;
  if (!isManager) {
    // Owners and admins redirect to their respective dashboards
    if (session.user.role === "ADMIN") redirect("/dashboard/admin");
    if (session.user.role === "OWNER") redirect("/dashboard/owner");
    redirect("/dashboard");
  }

  const managerRole = (session.user as any).managerRole as string;
  const ownerId     = (session.user as any).ownerId as number;

  const navItems = [
    { name: "Overview",    href: "/dashboard/manager",            icon: LayoutDashboard },
    { name: "Tenants",     href: "/dashboard/manager/tenants",    icon: Users },
    { name: "Payments",    href: "/dashboard/manager/payments",   icon: Wallet },
    { name: "Billing",     href: "/dashboard/manager/billing",    icon: FileText },
    { name: "Complaints",  href: "/dashboard/manager/complaints", icon: Wrench },
    { name: "Mess Menu",   href: "/dashboard/manager/mess",       icon: ChefHat },
    { name: "Reminders",   href: "/dashboard/manager/reminders",  icon: BellRing },
  ];

  const roleColors: Record<string, string> = {
    MANAGER:    "bg-violet-100 text-violet-700",
    WARDEN:     "bg-blue-100 text-blue-700",
    ACCOUNTANT: "bg-green-100 text-green-700",
  };
  const roleBadgeCls = roleColors[managerRole] ?? "bg-neutral-100 text-neutral-600";

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ── Top Header ──────────────────────────────────────── */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container-max section-padding h-16 flex items-center justify-between">
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
              <span className="text-neutral-400 text-xs ml-1 font-medium">/ Manager</span>
            </div>
          </Link>

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-neutral-800">
                {session.user.name}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleBadgeCls}`}>
                {managerRole}
              </span>
            </div>
            <div className="w-9 h-9 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
              {session.user.name?.charAt(0).toUpperCase() || "M"}
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="container-max section-padding py-6 flex flex-col lg:flex-row gap-8">
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className="hidden lg:block w-56 shrink-0">
          <nav className="bg-white rounded-2xl p-3 border border-neutral-200 shadow-sm sticky top-24">
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Navigation
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

            <div className="mt-3 pt-3 border-t border-neutral-100 px-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-xs text-neutral-400 hover:text-violet-600 transition-colors"
              >
                <ArrowRight size={12} />
                Go to main site
              </Link>
            </div>
          </nav>
        </aside>

        {/* ── Main ────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* ── Mobile Bottom Nav ──────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
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
