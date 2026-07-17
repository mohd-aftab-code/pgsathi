"use client";

import Link from "next/link";
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
} from "lucide-react";
import { DashboardSidebar, type SidebarNavGroup } from "./DashboardSidebar";

const OWNER_NAV: SidebarNavGroup[] = [
  {
    category: "Main",
    items: [{ name: "Overview", href: "/dashboard/owner", icon: LayoutDashboard, exact: true }],
  },
  {
    category: "Business",
    items: [
      { name: "My PGs", href: "/dashboard/owner/listings", icon: Building2 },
      { name: "PG Manager", href: "/dashboard/manager", icon: Layers },
      { name: "Inventory", href: "/dashboard/owner/inventory", icon: Boxes, hideMobile: true },
    ],
  },
  {
    category: "People",
    items: [
      { name: "Team & Staff", href: "/dashboard/owner/staff", icon: UsersRound, hideMobile: true },
      { name: "Leads", href: "/dashboard/owner/leads", icon: MessageSquare },
      { name: "Reviews", href: "/dashboard/owner/reviews", icon: Star, hideMobile: true },
    ],
  },
  {
    category: "Account",
    items: [{ name: "Settings", href: "/dashboard/owner/settings", icon: Settings, hideMobile: true }],
  },
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
  const footer = hasPaidPlan ? null : trialDaysLeft > 0 ? (
    <div className="rounded-xl bg-violet-50 border border-violet-100 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles size={13} className="text-violet-600 shrink-0" />
        <p className="text-xs font-bold text-violet-900 whitespace-nowrap">Free Trial Active</p>
      </div>
      <p className="text-[10px] text-violet-700/80 mb-2.5 whitespace-nowrap">
        {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left
      </p>
      <Link
        href="/dashboard/owner/subscription/upgrade"
        className="block text-center text-xs font-bold bg-violet-600 text-white rounded-lg py-1.5 hover:bg-violet-700 transition-colors"
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
  );

  return (
    <DashboardSidebar brandHref="/dashboard/owner" groups={OWNER_NAV} footer={footer}>
      {children}
    </DashboardSidebar>
  );
}
