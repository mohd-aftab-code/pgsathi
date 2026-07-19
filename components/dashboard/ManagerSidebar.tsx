"use client";

import {
  LayoutDashboard,
  Users,
  DoorClosed,
  UserPlus,
  Wrench,
  ChefHat,
  Wallet,
  FileText,
  Receipt,
  BellRing,
  Megaphone,
  BarChart3,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { DashboardSidebar, type SidebarNavGroup } from "./DashboardSidebar";

// "Mess Menu" and "Expenses" are optional modules — OFF by default and toggled on from
// Settings. buildManagerNav() only includes each when enabled, keeping the nav uncluttered
// for owners who don't use them.
function buildManagerNav(messEnabled: boolean, expensesEnabled: boolean): SidebarNavGroup[] {
  return [
    {
      category: "Main",
      items: [{ name: "Overview", href: "/dashboard/manager", icon: LayoutDashboard, exact: true }],
    },
    {
      category: "People",
      items: [{ name: "Tenants", href: "/dashboard/manager/tenants", icon: Users }],
    },
    {
      category: "Operations",
      items: [
        { name: "Rooms & Beds", href: "/dashboard/manager/rooms", icon: DoorClosed, hideMobile: true },
        { name: "Enquiries", href: "/dashboard/manager/enquiries", icon: UserPlus, hideMobile: true },
        { name: "Complaints", href: "/dashboard/manager/complaints", icon: Wrench },
        ...(messEnabled
          ? [{ name: "Mess Menu", href: "/dashboard/manager/mess", icon: ChefHat, hideMobile: true }]
          : []),
      ],
    },
    {
      category: "Finance",
      items: [
        { name: "Payments", href: "/dashboard/manager/payments", icon: Wallet },
        { name: "Billing", href: "/dashboard/manager/billing", icon: FileText, hideMobile: true },
        ...(expensesEnabled
          ? [{ name: "Expenses", href: "/dashboard/manager/expenses", icon: Receipt, hideMobile: true }]
          : []),
      ],
    },
    {
      category: "System",
      items: [
        { name: "Reminders", href: "/dashboard/manager/reminders", icon: BellRing, hideMobile: true },
        { name: "Announcements", href: "/dashboard/manager/announcements", icon: Megaphone, hideMobile: true },
        { name: "Reports", href: "/dashboard/manager/reports", icon: BarChart3, ownerOnly: true, hideMobile: true },
        { name: "Activity Log", href: "/dashboard/manager/audit", icon: ShieldCheck, ownerOnly: true, hideMobile: true },
        { name: "Settings", href: "/dashboard/manager/settings", icon: Settings, hideMobile: true },
      ],
    },
  ];
}

export function ManagerSidebar({
  isOwner,
  messEnabled = false,
  expensesEnabled = false,
  children,
}: {
  isOwner: boolean;
  /** Whether the owner has enabled the optional Mess Menu module from Settings. */
  messEnabled?: boolean;
  /** Whether the owner has enabled the optional Expenses module from Settings. */
  expensesEnabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <DashboardSidebar
      brandHref="/dashboard/manager"
      groups={buildManagerNav(messEnabled, expensesEnabled)}
      isOwner={isOwner}
      backLink={isOwner ? { href: "/dashboard/owner", label: "Owner Dashboard" } : undefined}
    >
      {children}
    </DashboardSidebar>
  );
}
