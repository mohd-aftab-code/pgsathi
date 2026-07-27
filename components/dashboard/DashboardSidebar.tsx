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
      {/* ── Desktop Rail — premium dark gradient ─────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col w-64"
        style={{
          background: "linear-gradient(180deg, #3b0764 0%, #4c1d95 30%, #5b21b6 70%, #4c1d95 100%)",
          borderRight: "1px solid rgba(167,139,250,0.15)",
          boxShadow: "4px 0 32px rgba(109,40,217,0.18)",
        }}
      >
        {/* Subtle background texture */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-violet-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-16 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        {/* Brand mark */}
        <Link
          href={brandHref}
          className="relative z-10 flex items-center justify-center h-20 shrink-0 border-b border-white/10 px-4 hover:bg-white/5 transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-vertical.png"
            alt="PGSathi"
            className="h-14 w-auto object-contain transition-all brightness-110"
          />
        </Link>

        {backLink && (
          <Link
            href={backLink.href}
            className="relative z-10 flex items-center h-9 mx-3 mt-3 rounded-lg px-3 gap-3 text-violet-200/70 hover:bg-white/10 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft size={16} className="shrink-0" />
            <span className="text-sm font-semibold whitespace-nowrap">{backLink.label}</span>
          </Link>
        )}

        {/* Nav + footer scroll container */}
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col scrollbar-hide">
          <nav className="flex flex-col px-3 py-3">
            {visibleGroups.map((group, gi) => (
              <div key={group.category} className={gi > 0 ? "mt-4" : ""}>
                <p className="px-3 mb-1.5 text-[10px] font-bold text-violet-300/50 uppercase tracking-widest whitespace-nowrap">
                  {group.category}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center h-9 rounded-xl px-3 gap-3 text-sm transition-all duration-200 ${
                          active
                            ? "bg-white text-violet-700 font-bold shadow-lg shadow-violet-900/30"
                            : "text-violet-100/80 font-medium hover:bg-white/12 hover:text-white"
                        }`}
                      >
                        <Icon
                          size={16}
                          strokeWidth={active ? 2.5 : 2}
                          className={`shrink-0 transition-colors ${active ? "text-violet-600" : ""}`}
                        />
                        <span className="whitespace-nowrap">{item.name}</span>
                        {active && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {footer && <div className="mt-auto px-3 pt-2 pb-4 relative z-10">{footer}</div>}
        </div>
      </aside>

      {/* ── Content — static offset for fixed sidebar ─────── */}
      <div className="lg:pl-64">{children}</div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div
          className="mx-2 rounded-t-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 -8px 32px rgba(109,40,217,0.08), 0 -2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-end justify-around px-2 h-[68px]">
            {primaryMobile.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative pb-1 pt-2"
                >
                  <div
                    className={`w-10 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      active
                        ? "bg-violet-100 shadow-sm"
                        : "hover:bg-neutral-100"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={active ? "text-violet-700" : "text-neutral-400"}
                      strokeWidth={active ? 2.5 : 1.8}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold transition-colors ${active ? "text-violet-700" : "text-neutral-400"}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
            <button
              onClick={() => setIsMoreOpen(true)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative pb-1 pt-2"
            >
              <div className="w-10 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-neutral-100">
                <LayoutGrid size={20} className="text-neutral-400" strokeWidth={1.8} />
              </div>
              <span className="text-[10px] font-semibold text-neutral-400">More</span>
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
            className="rounded-t-3xl overflow-hidden max-h-[80vh] flex flex-col"
            style={{ background: "rgba(255,255,255,0.98)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
              <h2 className="font-bold text-neutral-900">All Sections</h2>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full text-neutral-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex flex-col gap-5">
              {visibleGroups.map((group) => (
                <div key={group.category}>
                  <p className="px-2 mb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{group.category}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMoreOpen(false)}
                          className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all duration-200 ${
                            active
                              ? "bg-violet-50 text-violet-700 shadow-sm border border-violet-100"
                              : "hover:bg-neutral-50 text-neutral-600 border border-transparent"
                          }`}
                        >
                          <Icon size={22} className={active ? "text-violet-600" : "text-neutral-400"} />
                          <span className="text-[9px] font-semibold text-center leading-tight">{item.name}</span>
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
