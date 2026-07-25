"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, IndianRupee, FileBarChart, Bell,
  User, Settings, Handshake, LogOut, Menu, X,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { PartnerBell } from "./PartnerBell";

const NAV = [
  { name: "Dashboard", href: "/partner/dashboard", icon: LayoutDashboard },
  { name: "My PGs", href: "/partner/pgs", icon: Building2 },
  { name: "Earnings", href: "/partner/earnings", icon: IndianRupee },
  { name: "Reports", href: "/partner/reports", icon: FileBarChart },
  { name: "Notifications", href: "/partner/notifications", icon: Bell },
];

const ACCOUNT = [
  { name: "Profile", href: "/partner/profile", icon: User },
  { name: "Settings", href: "/partner/settings", icon: Settings },
];

/**
 * Portal chrome: fixed sidebar on desktop, slide-over drawer on mobile.
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

  const Brand = () => (
    <Link href="/partner/dashboard" className="flex items-center gap-2.5 h-16 px-5 shrink-0">
      <div className="w-9 h-9 rounded-xl bg-primary-500 grid place-items-center shadow-lg shadow-primary-500/25">
        <Handshake className="text-white" size={18} />
      </div>
      <div>
        <div className="font-extrabold text-neutral-900 dark:text-white text-sm leading-tight">PGSathi</div>
        <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Partner</div>
      </div>
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

      {/* ── Mobile drawer ───────────────────────────────────────── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-72 max-w-[85%] bg-white dark:bg-neutral-900 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="w-9 h-9 grid place-items-center rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto py-2">
              <NavList />
            </div>
          </aside>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="lg:hidden w-9 h-9 grid place-items-center rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
            >
              <Menu size={18} />
            </button>

            <div className="hidden lg:block text-sm text-neutral-500 dark:text-neutral-400">
              Partner Code{" "}
              <span className="font-bold tracking-widest text-primary-600 dark:text-primary-400">{partnerCode}</span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <PartnerBell />
              <ThemeToggle />
              <Link
                href="/api/auth/signout"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
