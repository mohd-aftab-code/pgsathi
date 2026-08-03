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
      {/* ── Desktop Rail — clean violet, original style ─────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-violet-300 border-r border-violet-400 w-64">

        {/* Brand mark */}
        <Link
          href={brandHref}
          className="flex items-center justify-center h-20 [@media(min-height:800px)]:h-24 shrink-0 border-b border-violet-400 px-4 hover:bg-violet-200/40 transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/owner%20logo.png"
            alt="PGSathi"
            className="h-14 [@media(min-height:800px)]:h-16 w-auto object-contain transition-all"
          />
        </Link>

        {backLink && (
          <Link
            href={backLink.href}
            className="flex items-center h-9 mx-3 mt-3 rounded-md px-3 gap-3 text-neutral-600 hover:bg-white/50 hover:text-neutral-900 transition-colors shrink-0"
          >
            <ArrowLeft size={16} className="shrink-0" />
            <span className="text-sm font-semibold whitespace-nowrap">{backLink.label}</span>
          </Link>
        )}

        {/* Nav + footer scroll container */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col scrollbar-hide">
          <nav className="flex flex-col px-3 py-2 [@media(min-height:800px)]:py-3">
            {visibleGroups.map((group, gi) => (
              <div key={group.category} className={gi > 0 ? "mt-2 [@media(min-height:800px)]:mt-3" : ""}>
                <p className="px-3 mb-1 text-[11px] font-bold text-neutral-500 uppercase tracking-wide whitespace-nowrap">
                  {group.category}
                </p>
                <div className="flex flex-col">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center h-8 rounded-md px-3 gap-3 text-sm transition-colors ${
                          active
                            ? "bg-white text-violet-700 font-bold shadow-sm"
                            : "text-neutral-700 font-semibold hover:bg-white/60 hover:text-neutral-900"
                        }`}
                      >
                        <Icon size={17} strokeWidth={2} className="shrink-0" />
                        <span className="whitespace-nowrap">{item.name}</span>
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
