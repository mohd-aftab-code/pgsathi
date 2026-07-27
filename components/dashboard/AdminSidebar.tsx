"use client";

import {
  LayoutDashboard, ShieldCheck, Users, PieChart, Settings, Handshake,
  IndianRupee, ShieldAlert, Wallet, FileBarChart, MapPin, Activity,
} from "lucide-react";
import { DashboardSidebar, type SidebarNavGroup } from "./DashboardSidebar";

/**
 * Admin chrome, on the same shell the Owner and PG Manager dashboards use — one
 * navigation model for all three roles instead of three different ones.
 *
 * This has to be a client component: the nav carries Lucide icon *functions*,
 * and a Server Component cannot pass functions across the boundary to
 * DashboardSidebar. (OwnerSidebar exists for exactly the same reason.)
 *
 * `hideMobile` keeps a section out of the primary phone tab row; it is still one
 * tap away under "More". The old admin bar showed only its first five items and
 * left the rest unreachable on a phone entirely.
 */
const NAV: SidebarNavGroup[] = [
  {
    category: "Main",
    items: [{ name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard, exact: true }],
  },
  {
    category: "Moderation",
    items: [
      { name: "Verify Listings", href: "/dashboard/admin/verify", icon: ShieldCheck },
      { name: "Cities", href: "/dashboard/admin/cities", icon: MapPin, hideMobile: true },
    ],
  },
  {
    category: "People",
    items: [
      { name: "Users", href: "/dashboard/admin/users", icon: Users },
      { name: "Partners", href: "/dashboard/admin/partners", icon: Handshake },
    ],
  },
  {
    category: "Money",
    items: [
      { name: "Plans", href: "/dashboard/admin/plans", icon: PieChart, hideMobile: true },
      { name: "Earnings", href: "/dashboard/admin/partner-earnings", icon: IndianRupee, hideMobile: true },
      { name: "Payouts", href: "/dashboard/admin/partner-payouts", icon: Wallet, hideMobile: true },
    ],
  },
  {
    category: "System",
    items: [
      { name: "Reports", href: "/dashboard/admin/reports", icon: FileBarChart, hideMobile: true },
      { name: "Audit Logs", href: "/dashboard/admin/audit-logs", icon: Activity, hideMobile: true },
      { name: "Settings", href: "/dashboard/admin/settings", icon: Settings, hideMobile: true },
    ],
  },
];

export function AdminSidebar({
  footer,
  children,
}: {
  /** Rendered at the bottom of the desktop rail — identity + logout. */
  footer?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <DashboardSidebar brandHref="/dashboard/admin" groups={NAV} footer={footer}>
      {children}
    </DashboardSidebar>
  );
}
