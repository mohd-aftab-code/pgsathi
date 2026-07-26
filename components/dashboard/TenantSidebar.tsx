"use client";

import { User, Heart, Receipt, Wrench, Settings, CalendarCheck, Bell } from "lucide-react";
import { DashboardSidebar, type SidebarNavGroup } from "./DashboardSidebar";

/**
 * Tenant chrome on the same shell as Owner, Manager and Admin — one navigation
 * model across every role instead of a separate card-sidebar just for tenants.
 *
 * Client component because the nav carries Lucide icon *functions*, which a
 * Server Component cannot pass across the boundary (same reason OwnerSidebar and
 * AdminSidebar exist).
 *
 * Bookings and Notifications are new here: both pages already existed but were
 * missing from the old nav, so a tenant had no way to open either.
 */
const NAV: SidebarNavGroup[] = [
  {
    category: "Main",
    items: [
      { name: "My Profile", href: "/dashboard/tenant", icon: User, exact: true },
      { name: "Bookings", href: "/dashboard/tenant/bookings", icon: CalendarCheck },
    ],
  },
  {
    category: "My PG",
    items: [
      { name: "Saved PGs", href: "/dashboard/tenant/saved", icon: Heart },
      { name: "Receipts", href: "/dashboard/tenant/receipts", icon: Receipt },
      { name: "Complaints", href: "/dashboard/tenant/complaints", icon: Wrench, hideMobile: true },
    ],
  },
  {
    category: "Account",
    items: [
      { name: "Notifications", href: "/dashboard/tenant/notifications", icon: Bell, hideMobile: true },
      { name: "Settings", href: "/dashboard/tenant/settings", icon: Settings, hideMobile: true },
    ],
  },
];

export function TenantSidebar({
  footer,
  children,
}: {
  footer?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <DashboardSidebar brandHref="/dashboard/tenant" groups={NAV} footer={footer}>
      {children}
    </DashboardSidebar>
  );
}
