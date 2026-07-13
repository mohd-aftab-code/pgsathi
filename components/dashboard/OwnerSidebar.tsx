"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Star,
  MessageSquare,
  Settings,
  Layers,
  Boxes,
  UsersRound,
  Sparkles,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const OWNER_NAV = [
  { name: "Overview", href: "/dashboard/owner", icon: LayoutDashboard },
  { name: "My PGs", href: "/dashboard/owner/listings", icon: Building2 },
  { name: "PG Manager", href: "/dashboard/manager", icon: Layers },
  { name: "Team & Staff", href: "/dashboard/owner/staff", icon: UsersRound, hideMobile: true },
  { name: "Inventory", href: "/dashboard/owner/inventory", icon: Boxes, hideMobile: true },
  { name: "Leads", href: "/dashboard/owner/leads", icon: MessageSquare },
  { name: "Reviews", href: "/dashboard/owner/reviews", icon: Star, hideMobile: true },
  { name: "Settings", href: "/dashboard/owner/settings", icon: Settings },
];

export function OwnerSidebar({
  hasPaidPlan = false,
  trialDaysLeft = 0,
  children,
}: {
  hasPaidPlan?: boolean;
  trialDaysLeft?: number;
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  const isActive = (item: (typeof OWNER_NAV)[number]) =>
    item.href === "/dashboard/owner"
      ? pathname === item.href
      : pathname.startsWith(item.href);

  return (
    <>
      {/* ── Desktop Rail — fixed flush to the left edge, click-to-pin icon rail ─────── */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-white border-r border-neutral-200 transition-[width] duration-200 ease-in-out ${
          expanded ? "w-64 shadow-xl shadow-neutral-900/10" : "w-[72px]"
        }`}
      >
        {/* Brand mark */}
        <Link
          href="/dashboard/owner"
          className={`flex items-center h-16 shrink-0 border-b border-neutral-100 gap-2.5 ${
            expanded ? "px-4" : "justify-center"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.png" alt="PGSathi" className="w-8 h-8 object-contain shrink-0" />
          {expanded && <span className="text-neutral-900 font-bold text-sm whitespace-nowrap">PGSathi</span>}
        </Link>

        {/* Expand / collapse toggle — always accessible, click-based (not hover) */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center justify-center h-10 mx-2 my-2 rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors shrink-0"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
        </button>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-1 custom-scrollbar">
          <div className="flex flex-col gap-1 px-2">
            {OWNER_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center h-11 rounded-xl px-[13px] gap-3.5 transition-colors ${
                    active
                      ? "bg-primary-50 text-primary-700 font-semibold"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-primary-600"
                  }`}
                >
                  <Icon size={20} className="shrink-0" />
                  <span
                    className={`text-sm font-medium whitespace-nowrap transition-opacity duration-150 ${
                      expanded ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {item.name}
                  </span>
                  {/* Tooltip — only needed while collapsed */}
                  {!expanded && (
                    <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-md bg-neutral-800 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg ring-1 ring-black/20 transition-opacity duration-150 group-hover:opacity-100 z-50">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Trial / upgrade footer */}
        {!hasPaidPlan && (
          <div className="px-2 pb-3 shrink-0">
            {expanded ? (
              trialDaysLeft > 0 ? (
                <div className="rounded-xl bg-primary-50 border border-primary-100 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={13} className="text-primary-600 shrink-0" />
                    <p className="text-xs font-bold text-primary-900 whitespace-nowrap">Free Trial Active</p>
                  </div>
                  <p className="text-[10px] text-primary-700/80 mb-2.5 whitespace-nowrap">
                    {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left
                  </p>
                  <Link
                    href="/dashboard/owner/subscription/upgrade"
                    className="block text-center text-xs font-bold bg-primary-600 text-white rounded-lg py-1.5 hover:bg-primary-700 transition-colors"
                  >
                    Upgrade
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl bg-red-50 border border-red-100 p-3">
                  <p className="text-xs font-bold text-red-700 mb-2 whitespace-nowrap">Trial Expired</p>
                  <Link
                    href="/dashboard/owner/subscription/upgrade"
                    className="block text-center text-xs font-bold bg-red-600 text-white rounded-lg py-1.5 hover:bg-red-700 transition-colors"
                  >
                    Upgrade Now
                  </Link>
                </div>
              )
            ) : (
              <Link
                href="/dashboard/owner/subscription/upgrade"
                className={`group relative flex items-center justify-center h-11 rounded-xl border ${
                  trialDaysLeft > 0
                    ? "bg-primary-50 border-primary-100"
                    : "bg-red-50 border-red-100"
                }`}
              >
                <Sparkles size={18} className={trialDaysLeft > 0 ? "text-primary-600" : "text-red-600"} />
                <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-md bg-neutral-800 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg ring-1 ring-black/20 transition-opacity duration-150 group-hover:opacity-100 z-50">
                  {trialDaysLeft > 0 ? `${trialDaysLeft} days left in trial` : "Trial expired — upgrade"}
                </span>
              </Link>
            )}
          </div>
        )}
      </aside>

      {/* ── Content — shifts right with the rail so nothing sits underneath it ─────── */}
      <div className={`transition-[padding] duration-200 ease-in-out ${expanded ? "lg:pl-64" : "lg:pl-[72px]"}`}>
        {children}
      </div>

      {/* ── Mobile Bottom Navigation Bar — App-Like Premium Design ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="bg-white/95 backdrop-blur-xl border-t border-neutral-200/60 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
          <div className="flex items-end justify-around px-1 h-[68px]">
            {OWNER_NAV.filter(item => !item.hideMobile).slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative pb-1 pt-2"
                >
                  {/* Active indicator dot */}
                  {active && (
                    <span className="absolute top-1 w-1 h-1 rounded-full bg-primary-600 animate-pulse" />
                  )}
                  <div className={`w-10 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    active ? "bg-primary-100 scale-110" : "hover:bg-neutral-100 scale-100"
                  }`}>
                    <Icon
                      size={20}
                      className={active ? "text-primary-700" : "text-neutral-500"}
                      strokeWidth={active ? 2.5 : 1.8}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold transition-colors ${
                    active ? "text-primary-700" : "text-neutral-400"
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
