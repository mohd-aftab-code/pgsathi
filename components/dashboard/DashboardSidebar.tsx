"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, LayoutGrid } from "lucide-react";
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
 * Single shared sidebar shell used by both the Owner and PG Manager dashboards,
 * so the two roles get one consistent premium nav experience instead of two
 * differently-styled ones. Item visibility is driven by `isOwner` + `ownerOnly`.
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
      {/* ── Desktop Rail — fixed flush to the left edge ─────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-white/80 backdrop-blur-2xl border-r border-white/50 w-64 shadow-[8px_0_30px_rgba(0,0,0,0.04)]">
        {/* Brand mark */}
        <Link href={brandHref} className="flex items-center h-16 shrink-0 border-b border-neutral-100 gap-2.5 px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.png" alt="PGSathi" className="w-8 h-8 object-contain shrink-0" />
          <span className="text-neutral-900 font-bold text-sm whitespace-nowrap">PGSathi</span>
        </Link>

        {backLink && (
          <Link
            href={backLink.href}
            className="group relative flex items-center h-11 mx-2 mt-2 mb-1 rounded-xl px-[13px] gap-3.5 text-neutral-500 hover:bg-neutral-50 hover:text-violet-600 transition-colors shrink-0"
          >
            <ArrowLeft size={20} className="shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap">{backLink.label}</span>
          </Link>
        )}

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-1 custom-scrollbar">
          <div className="flex flex-col gap-1 px-2">
            {visibleGroups.map((group, gi) => (
              <div key={group.category} className={gi > 0 ? "mt-2 pt-2 border-t border-neutral-100" : ""}>
                <p className="px-3 mb-1 text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                  {group.category}
                </p>
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group relative flex items-center h-11 rounded-xl px-[13px] gap-3.5 transition-all duration-300 ${
                          active
                            ? "bg-gradient-to-r from-violet-50 to-violet-100/50 text-violet-700 font-bold shadow-sm shadow-violet-900/5 ring-1 ring-violet-100"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-violet-600 hover:translate-x-1"
                        }`}
                      >
                        {!active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-violet-500 rounded-r-md transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:h-5" />
                        )}
                        <Icon
                          size={20}
                          className={`shrink-0 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`}
                        />
                        <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {footer && <div className="px-2 pb-3 shrink-0">{footer}</div>}
      </aside>

      {/* ── Content — static offset for fixed sidebar ─────── */}
      <div className="lg:pl-64">{children}</div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="bg-white/80 backdrop-blur-2xl border-t border-white/50 shadow-[0_-8px_32px_rgba(0,0,0,0.06)] rounded-t-3xl overflow-hidden mx-1">
          <div className="flex items-end justify-around px-1 h-[68px]">
            {primaryMobile.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative pb-1 pt-2"
                >
                  {active && <span className="absolute top-1 w-1 h-1 rounded-full bg-violet-600 animate-pulse" />}
                  <div
                    className={`w-10 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      active ? "bg-violet-100 scale-110" : "hover:bg-neutral-100 scale-100"
                    }`}
                  >
                    <Icon size={20} className={active ? "text-violet-700" : "text-neutral-500"} strokeWidth={active ? 2.5 : 1.8} />
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
              <div className="w-10 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-neutral-100 scale-100">
                <LayoutGrid size={20} className="text-neutral-500" strokeWidth={1.8} />
              </div>
              <span className="text-[10px] font-semibold transition-colors text-neutral-400">More</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile "More" Menu Overlay ── */}
      {isMoreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMoreOpen(false)}
        >
          <div className="bg-white rounded-t-3xl overflow-hidden max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
              <h2 className="font-bold text-neutral-900">All Sections</h2>
              <button onClick={() => setIsMoreOpen(false)} className="p-2 bg-neutral-100 rounded-full text-neutral-600">
                <ArrowLeft size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex flex-col gap-4">
              {visibleGroups.map((group) => (
                <div key={group.category}>
                  <p className="px-2 mb-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">{group.category}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMoreOpen(false)}
                          className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-colors ${
                            active ? "bg-violet-50 text-violet-700" : "hover:bg-neutral-50 text-neutral-600"
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
