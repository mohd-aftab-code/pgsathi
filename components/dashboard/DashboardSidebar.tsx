"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, LayoutGrid, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SidebarNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  /** Only visible when the signed-in user is the PG owner (hidden for manager-role staff). */
  ownerOnly?: boolean;
  /** Excluded from the primary mobile tab row; still reachable via the "More" sheet. */
  hideMobile?: boolean;
  /** Highlighted CTA styling in navigation rail */
  highlight?: boolean;
  /** Optional badge text displayed next to item */
  badge?: string;
};

export type SidebarNavGroup = {
  category: string;
  items: SidebarNavItem[];
};

/**
 * Single shared sidebar shell used by Owner, PG Manager, and Admin dashboards.
 * Premium dark-violet gradient rail on desktop, glassmorphism mobile bottom bar.
 */
export function DashboardSidebar({
  brandHref,
  groups,
  isOwner = true,
  backLink,
  footer,
  mobileItems,
  children,
}: {
  brandHref: string;
  groups: SidebarNavGroup[];
  isOwner?: boolean;
  backLink?: { href: string; label: string };
  footer?: React.ReactNode;
  mobileItems?: SidebarNavItem[];
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isActive = (item: SidebarNavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const visibleGroups = groups
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.ownerOnly || isOwner) }))
    .filter((group) => group.items.length > 0);

  const allItems = visibleGroups.flatMap((group) => group.items);
  const primaryMobile = (mobileItems ?? allItems.filter((item) => !item.hideMobile)).slice(0, 4);

  return (
    <>
      {/* ── Desktop Rail — clean white SaaS sidebar with crisp border ─────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-white border-r border-slate-200/80 shadow-[1px_0_12px_rgba(0,0,0,0.02)] w-64">

        {/* Brand mark */}
        <Link
          href={brandHref}
          className="flex items-center justify-center h-16 shrink-0 border-b border-slate-100 px-5 bg-white hover:bg-slate-50/50 transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/owner%20logo.png"
            alt="PGSathi"
            className="h-10 w-auto object-contain transition-all hover:scale-[1.02]"
          />
        </Link>

        {backLink && (
          <Link
            href={backLink.href}
            className="flex items-center h-9 mx-3 mt-3 rounded-lg px-3 gap-2 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-all shrink-0 border border-slate-200/60"
          >
            <ArrowLeft size={15} className="shrink-0 text-slate-400" />
            <span className="text-xs font-semibold whitespace-nowrap">{backLink.label}</span>
          </Link>
        )}

        {/* Nav + footer scroll container */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col scrollbar-hide">
          <nav className="flex flex-col px-3 py-3 space-y-3.5">
            {visibleGroups.map((group) => (
              <div key={group.category}>
                <p className="px-3 mb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  {group.category}
                </p>
                <div className="flex flex-col space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group relative flex items-center h-9 rounded-lg px-3 gap-2.5 text-xs transition-all duration-150 ${
                          active
                            ? "bg-violet-50 text-violet-700 font-bold border border-violet-200/70 shadow-2xs"
                            : "text-slate-600 font-medium hover:bg-slate-100/70 hover:text-slate-900"
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-violet-600" />
                        )}
                        <Icon
                          size={17}
                          strokeWidth={active ? 2.2 : 1.8}
                          className={`shrink-0 transition-colors ${
                            active ? "text-violet-600" : "text-slate-400 group-hover:text-slate-700"
                          }`}
                        />
                        <span className="whitespace-nowrap flex-1 truncate">{item.name}</span>
                        {item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 uppercase tracking-wider">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {footer && <div className="mt-auto px-3 pt-2 pb-3">{footer}</div>}
        </div>
      </aside>

      {/* ── Content — static offset for fixed sidebar & clearance for mobile bottom bar ─────── */}
      <div className="lg:pl-64 pb-24 lg:pb-0">{children}</div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div
          className="mx-2 rounded-t-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(226,232,240,0.8)",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-end justify-around px-2 h-[64px]">
            {primaryMobile.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative pb-1 pt-1.5"
                >
                  <div
                    className={`w-9 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
                      active
                        ? "bg-violet-100 shadow-2xs"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={active ? "text-violet-700" : "text-slate-400"}
                      strokeWidth={active ? 2.4 : 1.8}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold transition-colors ${active ? "text-violet-700" : "text-slate-400"}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
            <button
              onClick={() => setIsMoreOpen(true)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative pb-1 pt-1.5"
            >
              <div className="w-9 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:bg-slate-100">
                <LayoutGrid size={18} className="text-slate-400" strokeWidth={1.8} />
              </div>
              <span className="text-[10px] font-semibold text-slate-400">More</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile "More" Menu Overlay ── */}
      {isMoreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="rounded-t-2xl overflow-hidden max-h-[80vh] flex flex-col bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 text-sm">All Sections</h2>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex flex-col gap-4">
              {visibleGroups.map((group) => (
                <div key={group.category}>
                  <p className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.category}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMoreOpen(false)}
                          className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl transition-all duration-150 ${
                            active
                              ? "bg-violet-50 text-violet-700 shadow-2xs border border-violet-100"
                              : "hover:bg-slate-50 text-slate-600 border border-transparent"
                          }`}
                        >
                          <Icon size={20} className={active ? "text-violet-600" : "text-slate-400"} />
                          <span className="text-[9px] font-semibold text-center leading-tight truncate w-full">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
