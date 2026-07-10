"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UsersRound,
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
  ArrowLeft,
  Settings,
} from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: any;
  exact?: boolean;
  ownerOnly?: boolean;
};

type NavGroup = {
  category: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    category: "Main",
    items: [
      { name: "Overview", href: "/dashboard/manager", icon: LayoutDashboard, exact: true },
    ]
  },
  {
    category: "People",
    items: [
      { name: "Tenants", href: "/dashboard/manager/tenants", icon: Users },
      { name: "Staff", href: "/dashboard/manager/staff", icon: UsersRound, ownerOnly: true },
    ]
  },
  {
    category: "Operations",
    items: [
      { name: "Rooms & Beds", href: "/dashboard/manager/rooms", icon: DoorClosed },
      { name: "Enquiries", href: "/dashboard/manager/enquiries", icon: UserPlus },
      { name: "Complaints", href: "/dashboard/manager/complaints", icon: Wrench },
      { name: "Mess Menu", href: "/dashboard/manager/mess", icon: ChefHat },
    ]
  },
  {
    category: "Finance",
    items: [
      { name: "Payments", href: "/dashboard/manager/payments", icon: Wallet },
      { name: "Billing", href: "/dashboard/manager/billing", icon: FileText },
      { name: "Expenses", href: "/dashboard/manager/expenses", icon: Receipt },
    ]
  },
  {
    category: "System",
    items: [
      { name: "Reminders", href: "/dashboard/manager/reminders", icon: BellRing },
      { name: "Announcements", href: "/dashboard/manager/announcements", icon: Megaphone },
      { name: "Reports", href: "/dashboard/manager/reports", icon: BarChart3, ownerOnly: true },
      { name: "Activity Log", href: "/dashboard/manager/audit", icon: ShieldCheck, ownerOnly: true },
    ]
  }
];

export function ManagerSidebar({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();

  const isActive = (item: any) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href) && (item.href !== "/dashboard/manager" || pathname === "/dashboard/manager");

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-4">
        {isOwner && (
          <Link 
            href="/dashboard/owner"
            className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-violet-700 transition-colors bg-white rounded-xl p-3 shadow-sm border border-neutral-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
              <ArrowLeft size={16} className="text-neutral-500 group-hover:text-violet-700" />
            </div>
            <div>
              <span className="block text-xs text-neutral-400">Return to</span>
              Owner Dashboard
            </div>
          </Link>
        )}

        <nav className="bg-white rounded-2xl border border-neutral-200 shadow-sm sticky top-24 overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
          <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              CRM Workspace
            </p>
            <Settings size={14} className="text-neutral-400" />
          </div>

          <div className="p-3 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex flex-col gap-5">
              {navGroups.map((group) => {
                const visibleItems = group.items.filter(item => !item.ownerOnly || isOwner);
                if (visibleItems.length === 0) return null;

                return (
                  <div key={group.category}>
                    <p className="px-3 mb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      {group.category}
                    </p>
                    <div className="flex flex-col gap-1">
                      {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                              active
                                ? "bg-violet-50 text-violet-700 shadow-sm border border-violet-100 font-semibold"
                                : "text-neutral-600 hover:text-violet-700 hover:bg-violet-50/50 border border-transparent"
                            }`}
                          >
                            <Icon size={18} className={active ? "text-violet-600" : "text-neutral-400"} />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile Bottom Nav - Only show a subset */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          {isOwner && (
            <Link
              href="/dashboard/owner"
              className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-violet-700 hover:bg-neutral-50 rounded-xl transition-colors gap-1"
            >
              <ArrowLeft size={20} />
              <span className="text-[10px] font-medium">Back</span>
            </Link>
          )}
          {navGroups.flatMap(g => g.items).filter(item => !item.ownerOnly || isOwner).slice(0, isOwner ? 4 : 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full rounded-xl transition-colors gap-1 ${
                  active ? "text-violet-700" : "text-neutral-500 hover:text-violet-700 hover:bg-neutral-50"
                }`}
              >
                <Icon size={20} className={active ? "text-violet-700" : ""} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
