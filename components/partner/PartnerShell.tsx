"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, IndianRupee, FileBarChart, Bell,
  User, Users, Settings, LogOut, X, Plus, LayoutGrid, Megaphone,
  Target, Trophy
} from "lucide-react";
import { ThemeToggle, applyStoredPartnerTheme } from "./ThemeToggle";
import { PartnerBell } from "./PartnerBell";

const NAV = [
  { name: "Dashboard", href: "/partner/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/partner/leads", icon: Target },
  { name: "Owners", href: "/partner/owners", icon: Users },
  { name: "My PGs", href: "/partner/pgs", icon: Building2 },
  { name: "Earnings", href: "/partner/earnings", icon: IndianRupee },
  { name: "Reports", href: "/partner/reports", icon: FileBarChart },
  { name: "Marketing", href: "/partner/marketing", icon: Megaphone },
  { name: "Leaderboard", href: "/partner/leaderboard", icon: Trophy },
  { name: "Notifications", href: "/partner/notifications", icon: Bell },
];

const ACCOUNT = [
  { name: "Profile", href: "/partner/profile", icon: User },
  { name: "Settings", href: "/partner/settings", icon: Settings },
];

/**
 * The bottom bar holds five slots: two tabs, the centre Add-PG button, one tab,
 * and More. Everything else lives in the More sheet.
 *
 * Picked by href, not by index into NAV — indexes silently point at the wrong
 * screen the moment an item is inserted into the list above.
 */
const tab = (href: string) => NAV.find((n) => n.href === href)!;
const TABS_LEFT = [tab("/partner/dashboard"), tab("/partner/owners")];
const TABS_RIGHT = [tab("/partner/earnings")];

/**
 * Portal chrome: fixed sidebar on desktop, native-app bottom tab bar on mobile —
 * the same pattern the Owner dashboard uses, so a partner who also owns a PG gets
 * one consistent experience instead of two different navigation models.
 *
 * Purely presentational — all data is fetched by the server pages it wraps.
 */
export function PartnerShell({
  name,
  partnerCode,
  children,
}: {
  name: string;
  partnerCode: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // The root layout's <head> script themes the portal before paint on a full
  // page load. Arriving here via client-side navigation runs no such script, so
  // re-apply it on mount — otherwise a partner who clicks in from the public
  // site sees the portal in light mode until they reload.
  useEffect(() => {
    applyStoredPartnerTheme();
  }, []);

  const isActive = (href: string) =>
    href === "/partner/dashboard" ? pathname === href : pathname.startsWith(href);

  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  const NavList = () => (
    <nav className="flex flex-col gap-1 px-3">
      <p className="px-3 mt-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        Main
      </p>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-semibold transition-colors ${
            isActive(item.href)
              ? "bg-primary-500 text-white shadow-md shadow-primary-500/25"
              : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <item.icon size={17} className="shrink-0" />
          {item.name}
        </Link>
      ))}

      <p className="px-3 mt-4 mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        Account
      </p>
      {ACCOUNT.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-semibold transition-colors ${
            isActive(item.href)
              ? "bg-primary-500 text-white shadow-md shadow-primary-500/25"
              : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <item.icon size={17} className="shrink-0" />
          {item.name}
        </Link>
      ))}
    </nav>
  );

  const Tab = ({ item }: { item: (typeof NAV)[number] }) => {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        className="flex flex-col items-center justify-center flex-1 h-full gap-1 pb-1 pt-2"
      >
        <div
          className={`w-10 h-9 rounded-lg grid place-items-center transition-colors ${
            active ? "bg-primary-100 dark:bg-primary-900/40" : ""
          }`}
        >
          <item.icon
            size={20}
            strokeWidth={active ? 2.5 : 1.8}
            className={active ? "text-primary-700 dark:text-primary-300" : "text-neutral-500 dark:text-neutral-400"}
          />
        </div>
        <span
          className={`text-[10px] font-semibold transition-colors ${
            active ? "text-primary-700 dark:text-primary-300" : "text-neutral-400 dark:text-neutral-500"
          }`}
        >
          {item.name}
        </span>
      </Link>
    );
  };

  const Brand = () => (
    <Link href="/partner/dashboard" className="flex items-center justify-center h-20 px-4 shrink-0 border-b border-neutral-200 dark:border-neutral-800">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-vertical.png" alt="PGSathi" className="h-14 w-auto object-contain" />
    </Link>
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 z-40">
        <Brand />
        <div className="flex-1 min-h-0 overflow-y-auto py-2">
          <NavList />
        </div>
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 grid place-items-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-neutral-900 dark:text-white truncate">{name}</div>
              <div className="text-[10px] font-bold tracking-widest text-primary-600 dark:text-primary-400">{partnerCode}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
            {/* Mobile top app bar: logo + code. Navigation lives in the bottom bar. */}
            <Link href="/partner/dashboard" className="lg:hidden flex items-center gap-2 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-vertical.png" alt="PGSathi" className="h-9 w-auto object-contain shrink-0" />
              <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400 tracking-widest truncate">{partnerCode}</div>
            </Link>

            <div className="hidden lg:block text-sm text-neutral-500 dark:text-neutral-400">
              Partner Code{" "}
              <span className="font-bold tracking-widest text-primary-600 dark:text-primary-400">{partnerCode}</span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <PartnerBell />
              <ThemeToggle />
              <Link
                href="/api/auth/signout"
                aria-label="Logout"
                className="inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </Link>
            </div>
          </div>
        </header>

        {/* pb-28 keeps the last row clear of the fixed bottom bar on mobile. */}
        <main className="p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-8">{children}</main>
      </div>

      {/* ── Mobile bottom tab bar ───────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="mx-1 rounded-t-3xl overflow-hidden bg-white/85 dark:bg-neutral-900/85 backdrop-blur-2xl border-t border-white/50 dark:border-neutral-700/50 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
          <div className="flex items-end justify-around px-1 h-[68px]">
            {TABS_LEFT.map((item) => <Tab key={item.href} item={item} />)}

            {/* Registering a PG is the partner's core action — give it the centre slot. */}
            <Link
              href="/partner/pgs/new"
              aria-label="Register new PG"
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 pb-1 pt-2"
            >
              <div className="w-12 h-12 -mt-5 rounded-2xl bg-primary-500 grid place-items-center shadow-lg shadow-primary-500/40 ring-4 ring-white dark:ring-neutral-900 active:scale-95 transition-transform">
                <Plus className="text-white" size={22} strokeWidth={2.6} />
              </div>
              <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">Add PG</span>
            </Link>

            {TABS_RIGHT.map((item) => <Tab key={item.href} item={item} />)}

            <button
              onClick={() => setOpen(true)}
              aria-label="More sections"
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 pb-1 pt-2"
            >
              <div className="w-10 h-9 rounded-lg grid place-items-center">
                <LayoutGrid size={20} className="text-neutral-500 dark:text-neutral-400" strokeWidth={1.8} />
              </div>
              <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">More</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile "More" sheet ─────────────────────────────────── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-t-3xl overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 grid place-items-center text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-neutral-900 dark:text-white truncate">{name}</div>
                  <div className="text-[10px] font-bold tracking-widest text-primary-600 dark:text-primary-400">{partnerCode}</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="w-9 h-9 grid place-items-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 flex flex-col gap-5">
              {[{ label: "Main", items: NAV }, { label: "Account", items: ACCOUNT }].map((group) => (
                <div key={group.label}>
                  <p className="px-2 mb-2 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {group.items.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl transition-colors ${
                            active
                              ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                              : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          }`}
                        >
                          <item.icon size={21} className={active ? "text-primary-600 dark:text-primary-400" : "text-neutral-400 dark:text-neutral-500"} />
                          <span className="text-[9px] font-semibold text-center leading-tight">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              <Link
                href="/api/auth/signout"
                className="flex items-center justify-center gap-2 h-12 rounded-2xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold text-sm"
              >
                <LogOut size={16} /> Logout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
