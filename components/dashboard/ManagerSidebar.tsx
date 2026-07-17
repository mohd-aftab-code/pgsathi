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

const MANAGER_NAV: SidebarNavGroup[] = [
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
      { name: "Mess Menu", href: "/dashboard/manager/mess", icon: ChefHat, hideMobile: true },
    ],
  },
  {
    category: "Finance",
    items: [
      { name: "Payments", href: "/dashboard/manager/payments", icon: Wallet },
      { name: "Billing", href: "/dashboard/manager/billing", icon: FileText, hideMobile: true },
      { name: "Expenses", href: "/dashboard/manager/expenses", icon: Receipt, hideMobile: true },
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

export function ManagerSidebar({ isOwner, children }: { isOwner: boolean; children?: React.ReactNode }) {
  return (
    <DashboardSidebar
      brandHref="/dashboard/manager"
      groups={MANAGER_NAV}
      isOwner={isOwner}
      backLink={isOwner ? { href: "/dashboard/owner", label: "Owner Dashboard" } : undefined}
    >
      {children}
    </DashboardSidebar>
  );
}
