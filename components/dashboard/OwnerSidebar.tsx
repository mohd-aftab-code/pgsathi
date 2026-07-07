"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Star,
  CreditCard,
  MessageSquare,
  Settings,
  Layers,
  ArrowLeft,
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
  Megaphone
} from "lucide-react";

const OWNER_NAV = [
  { name: "Overview", href: "/dashboard/owner", icon: LayoutDashboard },
  { name: "My PGs", href: "/dashboard/owner/listings", icon: Building2 },
  { name: "PG Manager", href: "/dashboard/owner/manage", icon: Layers, hideMobile: false },
  { name: "Inventory", href: "/dashboard/owner/inventory", icon: Layers, hideMobile: true },
  { name: "Leads", href: "/dashboard/owner/leads", icon: MessageSquare },
  { name: "Reviews", href: "/dashboard/owner/reviews", icon: Star, hideMobile: true },
  { name: "Settings", href: "/dashboard/owner/settings", icon: Settings },
];

const MANAGER_NAV = [
  { name: "Overview",       href: "/dashboard/owner/manage",            icon: LayoutDashboard, exact: true },
  { name: "Tenants",        href: "/dashboard/owner/manage/tenants",    icon: Users },
  { name: "Rooms & Beds",   href: "/dashboard/owner/manage/rooms",      icon: DoorClosed, hideMobile: true },
  { name: "Payments",       href: "/dashboard/owner/manage/payments",   icon: Wallet },
  { name: "Billing",        href: "/dashboard/owner/manage/billing",    icon: FileText, hideMobile: true },
  { name: "Reminders",      href: "/dashboard/owner/manage/reminders",  icon: BellRing },
  { name: "Enquiries",      href: "/dashboard/owner/manage/enquiries",  icon: UserPlus, hideMobile: true },
  { name: "Complaints",     href: "/dashboard/owner/manage/complaints", icon: Wrench },
  { name: "Expenses",       href: "/dashboard/owner/manage/expenses",   icon: Receipt, hideMobile: true },
  { name: "Staff",          href: "/dashboard/owner/manage/staff",      icon: UsersRound, hideMobile: true },
  { name: "Mess Menu",      href: "/dashboard/owner/manage/mess",       icon: ChefHat, hideMobile: true },
  { name: "Reports",        href: "/dashboard/owner/manage/reports",    icon: BarChart3, hideMobile: true },
  { name: "Notices",        href: "/dashboard/owner/manage/announcements", icon: Megaphone, hideMobile: true },
  { name: "Activity Log",   href: "/dashboard/owner/manage/audit",      icon: ShieldCheck, hideMobile: true },
];

export function OwnerSidebar() {
  const pathname = usePathname();
  const isManagerMode = pathname.startsWith("/dashboard/owner/manage");

  const currentNav = isManagerMode ? MANAGER_NAV : OWNER_NAV;

  const isActive = (item: any) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href) && (item.href !== "/dashboard/owner" || pathname === "/dashboard/owner");

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:block w-64 shrink-0">
        <nav className="bg-white rounded-2xl border border-neutral-200 shadow-sm sticky top-24 overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
          
          <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
            {isManagerMode ? (
              <Link 
                href="/dashboard/owner" 
                className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-primary-600 transition-colors uppercase tracking-wider"
              >
                <ArrowLeft size={14} />
                Back to Dashboard
              </Link>
            ) : (
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Main Menu
              </p>
            )}
          </div>

          <div className="p-3 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex flex-col gap-1">
              {currentNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-primary-50 text-primary-700 shadow-sm border border-primary-100"
                        : "text-neutral-600 hover:text-primary-600 hover:bg-primary-50/50 border border-transparent"
                    }`}
                  >
                    <Icon size={18} className={active ? "text-primary-600" : "text-neutral-400"} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>

      {/* ── Mobile Bottom Navigation Bar ─────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          {isManagerMode && (
             <Link
                href="/dashboard/owner"
                className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-primary-600 hover:bg-neutral-50 rounded-xl transition-colors gap-1"
             >
                <ArrowLeft size={20} />
                <span className="text-[10px] font-medium">Back</span>
             </Link>
          )}

          {currentNav.filter(item => !item.hideMobile).slice(0, isManagerMode ? 4 : 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full rounded-xl transition-colors gap-1 ${
                  active ? "text-primary-600" : "text-neutral-500 hover:text-primary-600 hover:bg-neutral-50"
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
