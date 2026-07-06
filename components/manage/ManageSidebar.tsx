/**
 * components/manage/ManageSidebar.tsx
 * Sidebar navigation for the /dashboard/owner/manage section.
 * Desktop: left sidebar. Mobile: bottom tab bar.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  DoorClosed,
  Wallet,
  FileText,
  BellRing,
  UserPlus,
  Wrench,
  Receipt,
  UsersRound,
  ChefHat,
  BarChart3,
  ShieldCheck,
  Megaphone,
  X,
  Menu,
  Building2,
  ArrowLeft,
} from "lucide-react";

const NAV = [
  { href: "/dashboard/owner/manage",            label: "Overview",       icon: LayoutDashboard, exact: true },
  { href: "/dashboard/owner/manage/tenants",    label: "Tenants",        icon: Users },
  { href: "/dashboard/owner/manage/rooms",      label: "Rooms & Beds",   icon: DoorClosed, hideMobile: true },
  { href: "/dashboard/owner/manage/payments",   label: "Payments",       icon: Wallet },
  { href: "/dashboard/owner/manage/billing",    label: "Billing",        icon: FileText, hideMobile: true },
  { href: "/dashboard/owner/manage/reminders",  label: "Reminders",      icon: BellRing },
  { href: "/dashboard/owner/manage/enquiries",  label: "Enquiries",      icon: UserPlus, hideMobile: true },
  { href: "/dashboard/owner/manage/complaints", label: "Complaints",     icon: Wrench },
  { href: "/dashboard/owner/manage/expenses",   label: "Expenses",       icon: Receipt, hideMobile: true },
  { href: "/dashboard/owner/manage/staff",      label: "Staff",          icon: UsersRound, hideMobile: true },
  { href: "/dashboard/owner/manage/mess",       label: "Mess Menu",      icon: ChefHat, hideMobile: true },
  { href: "/dashboard/owner/manage/reports",    label: "Reports",        icon: BarChart3, hideMobile: true },
  { href: "/dashboard/owner/manage/announcements", label: "Notices",     icon: Megaphone, hideMobile: true },
  { href: "/dashboard/owner/manage/audit",      label: "Activity Log",   icon: ShieldCheck, hideMobile: true },
];

interface Props {
  ownerName: string;
  planTier: string;
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export function ManageSidebar({ ownerName, planTier, open, onClose, onOpen }: Props) {
  const pathname = usePathname();

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const planBadge = {
    PRO:     "bg-purple-100 text-purple-700",
    GROWTH:  "bg-blue-100 text-blue-700",
    STARTER: "bg-neutral-100 text-neutral-500",
  }[planTier] ?? "bg-neutral-100 text-neutral-500";

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary-700 text-white">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm">PG Manager</span>
        </div>
        <button
          id="manage-sidebar-toggle"
          onClick={onOpen}
          className="rounded-lg p-2 hover:bg-neutral-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* ── Overlay ─────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-700 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-neutral-900">PG Manager</div>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${planBadge}`}>
                {planTier}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-neutral-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Back to main dashboard */}
        <div className="px-3 pt-3">
          <Link
            href="/dashboard/owner"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-50 hover:text-primary-700 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Listings Dashboard
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {NAV.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-primary-700 text-white shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-100",
                ].join(" ")}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Owner info */}
        <div className="border-t border-neutral-100 px-3 py-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
              {ownerName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold text-neutral-900">{ownerName}</div>
              <div className="text-xs text-neutral-400">PG Owner</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ───────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {NAV.filter((i) => !i.hideMobile).map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex flex-col items-center justify-center w-full h-full rounded-xl gap-1 transition",
                  active ? "text-primary-700" : "text-neutral-500 hover:text-primary-700",
                ].join(" ")}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
