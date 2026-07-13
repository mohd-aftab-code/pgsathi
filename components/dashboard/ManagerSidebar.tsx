"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  DoorClosed,
  UserPlus,
  Wrench,
  ChefHat,
  Wallet,
  FileText,
  Receipt,
  BellRing,
  Megaphone,
  BarChart3,
  ShieldCheck,
  ArrowLeft,
  Settings,
} from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: any;
  exact?: boolean;
  ownerOnly?: boolean;
};

type NavGroup = {
  category: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    category: "Main",
    items: [
      { name: "Overview", href: "/dashboard/manager", icon: LayoutDashboard, exact: true },
    ]
  },
  {
    category: "People",
    items: [
      { name: "Tenants", href: "/dashboard/manager/tenants", icon: Users },
    ]
  },
  {
    category: "Operations",
    items: [
      { name: "Rooms & Beds", href: "/dashboard/manager/rooms", icon: DoorClosed },
      { name: "Enquiries", href: "/dashboard/manager/enquiries", icon: UserPlus },
      { name: "Complaints", href: "/dashboard/manager/complaints", icon: Wrench },
      { name: "Mess Menu", href: "/dashboard/manager/mess", icon: ChefHat },
    ]
  },
  {
    category: "Finance",
    items: [
      { name: "Payments", href: "/dashboard/manager/payments", icon: Wallet },
      { name: "Billing", href: "/dashboard/manager/billing", icon: FileText },
      { name: "Expenses", href: "/dashboard/manager/expenses", icon: Receipt },
    ]
  },
  {
    category: "System",
    items: [
      { name: "Reminders", href: "/dashboard/manager/reminders", icon: BellRing },
      { name: "Announcements", href: "/dashboard/manager/announcements", icon: Megaphone },
      { name: "Reports", href: "/dashboard/manager/reports", icon: BarChart3, ownerOnly: true },
      { name: "Activity Log", href: "/dashboard/manager/audit", icon: ShieldCheck, ownerOnly: true },
    ]
  }
];

// ─────────────────────────────────────────────────────────
// MobileNavItem — reusable bottom nav tab
// ─────────────────────────────────────────────────────────
function MobileNavItem({
  href, icon: Icon, label, isActive, color = "violet"
}: {
  href: string;
  icon: any;
  label: string;
  isActive: boolean;
  color?: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative pb-1 pt-2"
    >
      {/* Active indicator dot */}
      {isActive && (
        <span className="absolute top-1 w-1 h-1 rounded-full bg-violet-600 animate-pulse" />
      )}
      <div className={`w-10 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
        isActive
          ? "bg-violet-100 scale-110"
          : "hover:bg-neutral-100 scale-100"
      }`}>
        <Icon size={20} className={isActive ? "text-violet-700" : "text-neutral-500"} strokeWidth={isActive ? 2.5 : 1.8} />
      </div>
      <span className={`text-[10px] font-semibold transition-colors ${
        isActive ? "text-violet-700" : "text-neutral-400"
      }`}>
        {label}
      </span>
    </Link>
  );
}

export function ManagerSidebar({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();

  const isActive = (item: any) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href) && (item.href !== "/dashboard/manager" || pathname === "/dashboard/manager");

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-4">
        {isOwner && (
          <Link 
            href="/dashboard/owner"
            className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-violet-700 transition-colors bg-white rounded-xl p-3 shadow-sm border border-neutral-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
              <ArrowLeft size={16} className="text-neutral-500 group-hover:text-violet-700" />
            </div>
            <div>
              <span className="block text-xs text-neutral-400">Return to</span>
              Owner Dashboard
            </div>
          </Link>
        )}

        <nav className="bg-white rounded-2xl border border-neutral-200 shadow-sm sticky top-24 overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
          <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              CRM Workspace
            </p>
            <Settings size={14} className="text-neutral-400" />
          </div>

          <div className="p-3 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex flex-col gap-5">
              {navGroups.map((group) => {
                const visibleItems = group.items.filter(item => !item.ownerOnly || isOwner);
                if (visibleItems.length === 0) return null;

                return (
                  <div key={group.category}>
                    <p className="px-3 mb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      {group.category}
                    </p>
                    <div className="flex flex-col gap-1">
                      {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                              active
                                ? "bg-violet-50 text-violet-700 shadow-sm border border-violet-100 font-semibold"
                                : "text-neutral-600 hover:text-violet-700 hover:bg-violet-50/50 border border-transparent"
                            }`}
                          >
                            <Icon size={18} className={active ? "text-violet-600" : "text-neutral-400"} />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>

      {/* ── Mobile Bottom Nav — App-Like Premium Design ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="bg-white/95 backdrop-blur-xl border-t border-neutral-200/60 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
          <div className="flex items-end justify-around px-1 h-[68px]">
            {/* Home */}
            <MobileNavItem href="/dashboard/manager" icon={LayoutDashboard} label="Home" isActive={pathname === "/dashboard/manager"} color="violet" />
            {/* Tenants */}
            <MobileNavItem href="/dashboard/manager/tenants" icon={Users} label="Tenants" isActive={pathname.startsWith("/dashboard/manager/tenants")} color="violet" />
            {/* CENTER: Payments — prominent */}
            <Link
              href="/dashboard/manager/payments"
              className="flex flex-col items-center justify-center -mt-5 relative"
            >
              <div className={`w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 ${
                pathname.startsWith("/dashboard/manager/payments") 
                  ? "bg-violet-600 scale-110 shadow-violet-300" 
                  : "bg-violet-500 hover:bg-violet-600 hover:scale-105"
              }`}>
                <Wallet size={26} className="text-white" />
              </div>
              <span className={`text-[9px] font-bold mt-1.5 ${
                pathname.startsWith("/dashboard/manager/payments") ? "text-violet-700" : "text-neutral-500"
              }`}>Payments</span>
            </Link>
            {/* Complaints */}
            <MobileNavItem href="/dashboard/manager/complaints" icon={Wrench} label="Issues" isActive={pathname.startsWith("/dashboard/manager/complaints")} color="violet" />
            {/* More — opens to other pages */}
            <MobileNavItem href="/dashboard/manager/tenants" icon={UsersRound} label="More" isActive={false} color="violet" />
          </div>
        </div>
      </div>
    </>
  );
}
