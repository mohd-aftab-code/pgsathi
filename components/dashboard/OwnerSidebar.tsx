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
      items: [{ name: "Overview", href: "/dashboard/owner", icon: LayoutDashboard, exact: true }],
    },
    {
      category: "Business",
      items: [
        { name: "My PGs", href: "/dashboard/owner/listings", icon: Building2 },
        // PG Manager deliberately does NOT live here. It is a separate app, not
        // another page of this one, and sitting between "My PGs" and "Bed
        // Report" made it read as a sibling page — which is exactly the
        // confusion it caused. Its entry point is in the top header instead.
        //
        // Read-only occupancy report. Rooms and beds are entered in PG Manager;
        // the owner just needs to see where things stand.
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
  const displayTier = tier === "NONE" || tier === "STARTER" ? "Basic" : tier;
  const isEnterprise = tier === "ENTERPRISE";

  const planWidget = (
    <div className={`rounded-xl bg-white border ${hasPaidPlan ? 'border-primary-100' : trialDaysLeft > 0 ? 'border-violet-100' : 'border-red-100'} p-3 shadow-sm`}>
      <p className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Current Plan</p>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Sparkles size={14} className={hasPaidPlan ? 'text-primary-600' : trialDaysLeft > 0 ? 'text-violet-600' : 'text-neutral-600'} />
        <p className={`text-sm font-bold ${hasPaidPlan ? 'text-primary-900' : trialDaysLeft > 0 ? 'text-violet-900' : 'text-neutral-900'}`}>
          {displayTier} Plan
        </p>
      </div>
      
      {!hasPaidPlan && trialDaysLeft > 0 && (
        <p className="text-[10px] text-violet-700/80 mb-2.5 whitespace-nowrap">
          {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left in Trial
        </p>
      )}
      {!hasPaidPlan && trialDaysLeft <= 0 && (
        <p className="text-[10px] text-red-700/80 mb-2.5 whitespace-nowrap">
          Free Tier / Trial Expired
        </p>
      )}
      {hasPaidPlan && !isEnterprise && <div className="h-2"></div>}
      
      {!isEnterprise && (
        <Link
          href="/dashboard/owner/subscription/upgrade"
          className={`block text-center text-xs font-bold rounded-lg py-1.5 transition-colors ${
            hasPaidPlan 
              ? 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-100' 
              : trialDaysLeft > 0 
                ? 'bg-violet-500 text-white hover:bg-violet-600'
                : 'bg-red-600 text-white hover:bg-red-700'
          }`}
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
