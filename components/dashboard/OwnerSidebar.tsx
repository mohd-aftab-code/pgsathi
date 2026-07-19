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
  Lock,
} from "lucide-react";
import { DashboardSidebar, type SidebarNavGroup } from "./DashboardSidebar";
import { AdSlot } from "./AdSlot";
import type { PlanTier } from "@/lib/manage-auth";

// "PG Manager" is a paid feature (Growth/Pro/Scale plans, or an active trial), but the
// link is ALWAYS shown in the sidebar so owners can discover it. Owners who don't have
// access are sent to the plans/upgrade page on click (and a Lock icon marks it as premium)
// instead of the link being hidden — the CRM route itself also redirects them as a backstop.
function buildOwnerNav(hasManagerAccess: boolean): SidebarNavGroup[] {
  return [
    {
      category: "Main",
      items: [{ name: "Overview", href: "/dashboard/owner", icon: LayoutDashboard, exact: true }],
    },
    {
      category: "Business",
      items: [
        { name: "My PGs", href: "/dashboard/owner/listings", icon: Building2 },
        {
          name: "PG Manager",
          href: hasManagerAccess ? "/dashboard/manager" : "/dashboard/owner/subscription/upgrade",
          icon: hasManagerAccess ? Layers : Lock,
        },
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
}

export function OwnerSidebar({
  hasPaidPlan = false,
  trialDaysLeft = 0,
  tier = "NONE",
  children,
}: {
  hasPaidPlan?: boolean;
  trialDaysLeft?: number;
  /** Actual billing tier — Pro & Scale are ad-free; Starter & Growth (and free trials) see ads. */
  tier?: PlanTier;
  children?: React.ReactNode;
}) {
  const hasManagerAccess = hasPaidPlan || trialDaysLeft > 0;
  const ownerNav = buildOwnerNav(hasManagerAccess);
  const showAds = tier !== "PRO" && tier !== "SCALE";
  const planWidget = hasPaidPlan ? null : trialDaysLeft > 0 ? (
    <div className="rounded-xl bg-white border border-violet-100 p-3 shadow-sm">
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles size={13} className="text-violet-600 shrink-0" />
        <p className="text-xs font-bold text-violet-900 whitespace-nowrap">Free Trial Active</p>
      </div>
      <p className="text-[10px] text-violet-700/80 mb-2.5 whitespace-nowrap">
        {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left
      </p>
      <Link
        href="/dashboard/owner/subscription/upgrade"
        className="block text-center text-xs font-bold bg-violet-500 text-white rounded-lg py-1.5 hover:bg-violet-600 transition-colors"
      >
        Upgrade
      </Link>
    </div>
  ) : (
    <div className="rounded-xl bg-white border border-red-100 p-3 shadow-sm">
      <p className="text-xs font-bold text-red-700 mb-2 whitespace-nowrap">Trial Expired</p>
      <Link
        href="/dashboard/owner/subscription/upgrade"
        className="block text-center text-xs font-bold bg-red-600 text-white rounded-lg py-1.5 hover:bg-red-700 transition-colors"
      >
        Upgrade Now
      </Link>
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
