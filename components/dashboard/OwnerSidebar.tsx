"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  Star,
  MessageSquare,
  Settings,
  UsersRound,
  Sparkles,
  CreditCard,
  BedDouble,
  BarChart3,
  Gift,
} from "lucide-react";
import { DashboardSidebar, type SidebarNavGroup } from "./DashboardSidebar";
import { AdSlot } from "./AdSlot";
import type { PlanTier } from "@/lib/manage-auth";

function buildOwnerNav(): SidebarNavGroup[] {
  return [
    {
      category: "Main",
      items: [
        { name: "Overview", href: "/dashboard/owner", icon: LayoutDashboard, exact: true },
      ],
    },
    {
      category: "Business",
      items: [
        { name: "My PGs", href: "/dashboard/owner/listings", icon: Building2 },
        { name: "Bed Report", href: "/dashboard/owner/inventory", icon: BedDouble, hideMobile: true },
        { name: "Analytics", href: "/dashboard/owner/analytics", icon: BarChart3, hideMobile: true },
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
      items: [
        { name: "Subscription", href: "/dashboard/owner/subscription", icon: CreditCard, hideMobile: true },
        { name: "Refer & Earn", href: "/dashboard/owner/refer", icon: Gift, hideMobile: true },
        { name: "Settings", href: "/dashboard/owner/settings", icon: Settings, hideMobile: true }
      ],
    },
  ];
}

export function OwnerSidebar({
  hasPaidPlan = false,
  trialDaysLeft = 0,
  tier = "NONE",
  showAds: showAdsProp,
  children,
}: {
  hasPaidPlan?: boolean;
  trialDaysLeft?: number;
  /** Billing tier — used only for the plan-name label, not for gating. */
  tier?: PlanTier;
  /** Whether to show dashboard ads — the inverse of the plan's `adsFree`
   *  capability (super-admin controlled). Falls back to the old tier logic. */
  showAds?: boolean;
  children?: React.ReactNode;
}) {
  const ownerNav = buildOwnerNav();
  const showAds = showAdsProp ?? (tier !== "PRO" && tier !== "SCALE" && tier !== "ENTERPRISE");
  const displayTier = tier === "NONE" || tier === "STARTER" ? "Growth" : tier;
  const isEnterprise = tier === "ENTERPRISE";

  const planWidget = (
    <div className="rounded-2xl bg-white border border-violet-100/80 p-3.5 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">
          Current Plan
        </p>
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 uppercase">
          {displayTier}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100">
          <Sparkles size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-neutral-900 leading-tight">
            {displayTier} Plan
          </p>
          <p className="text-[10px] font-medium text-neutral-500 truncate">
            {hasPaidPlan
              ? "PG Manager Included"
              : trialDaysLeft > 0
              ? `${trialDaysLeft} days left in Trial`
              : "Upgrade for PG Manager"}
          </p>
        </div>
      </div>

      {!isEnterprise && (
        <Link
          href="/dashboard/owner/subscription/upgrade"
          className="block text-center text-xs font-bold rounded-xl py-2 px-3 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200/60 transition-all"
        >
          Upgrade Now
        </Link>
      )}
    </div>
  );

  const footer = planWidget || showAds ? (
    <div className="space-y-3">
      {planWidget}
      {showAds && <AdSlot />}
    </div>
  ) : null;

  return (
    <DashboardSidebar brandHref="/dashboard/owner" groups={ownerNav} footer={footer}>
      {children}
    </DashboardSidebar>
  );
}
