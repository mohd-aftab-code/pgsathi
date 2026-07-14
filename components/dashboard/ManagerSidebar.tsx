"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  ChevronsLeft,
  ChevronsRight,
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

export function ManagerSidebar({ isOwner, children }: { isOwner: boolean; children?: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      {/* ── Desktop Rail — fixed flush to the left edge, click-to-pin icon rail ─────── */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-white/80 backdrop-blur-2xl border-r border-white/50 w-64 shadow-[8px_0_30px_rgba(0,0,0,0.04)] transition-none`}
      >
        {/* Brand mark */}
        <Link
          href="/dashboard/manager"
          className="flex items-center h-16 shrink-0 border-b border-neutral-100 gap-2.5 px-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.png" alt="PGSathi" className="w-8 h-8 object-contain shrink-0" />
          <span className="text-neutral-900 font-bold text-sm whitespace-nowrap">PGSathi</span>
        </Link>

        {isOwner && (
          <Link
            href="/dashboard/owner"
            className="group relative flex items-center h-11 mx-2 mb-1 rounded-xl px-[13px] gap-3.5 text-neutral-500 hover:bg-neutral-50 hover:text-violet-600 transition-colors shrink-0"
          >
            <ArrowLeft size={20} className="shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap opacity-100">
              Owner Dashboard
            </span>
          </Link>
        )}

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-1 custom-scrollbar">
          <div className="flex flex-col gap-1 px-2">
            {navGroups.map((group, gi) => {
              const visibleItems = group.items.filter(item => !item.ownerOnly || isOwner);
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.category} className={gi > 0 ? "mt-2 pt-2 border-t border-neutral-100" : ""}>
                  <p className="px-3 mb-1 text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap opacity-100 h-auto">
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
                          className={`group relative flex items-center h-11 rounded-xl px-[13px] gap-3.5 transition-all duration-200 ${
                            active
                              ? "bg-gradient-to-r from-violet-50 to-violet-100/50 text-violet-700 font-bold shadow-sm shadow-violet-900/5 ring-1 ring-violet-100"
                              : "text-neutral-600 hover:bg-white hover:text-violet-600 hover:shadow-sm"
                          }`}
                        >
                          <Icon size={20} className="shrink-0" />
                          <span className="text-sm font-medium whitespace-nowrap opacity-100">
                            {item.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* ── Content — static offset for fixed sidebar ─────── */}
      <div className="lg:pl-64">
        {children}
      </div>

      {/* ── Mobile Bottom Nav — App-Like Premium Design ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="bg-white/80 backdrop-blur-2xl border-t border-white/50 shadow-[0_-8px_32px_rgba(0,0,0,0.06)] rounded-t-3xl overflow-hidden mx-1">
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
            {/* Rooms */}
            <MobileNavItem href="/dashboard/manager/rooms" icon={DoorClosed} label="Rooms" isActive={pathname.startsWith("/dashboard/manager/rooms")} color="violet" />
          </div>
        </div>
      </div>
    </>
  );
}
