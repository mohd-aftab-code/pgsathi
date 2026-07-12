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
  Megaphone,
  Sparkles
} from "lucide-react";

const OWNER_NAV = [
  { name: "Overview", href: "/dashboard/owner", icon: LayoutDashboard },
  { name: "My PGs", href: "/dashboard/owner/listings", icon: Building2 },
  { name: "PG Manager", href: "/dashboard/manager", icon: Layers, hideMobile: false },
  { name: "Team & Staff", href: "/dashboard/owner/staff", icon: UsersRound, hideMobile: true },
  { name: "Inventory", href: "/dashboard/owner/inventory", icon: Layers, hideMobile: true },
  { name: "Leads", href: "/dashboard/owner/leads", icon: MessageSquare },
  { name: "Reviews", href: "/dashboard/owner/reviews", icon: Star, hideMobile: true },
  { name: "Settings", href: "/dashboard/owner/settings", icon: Settings },
];

export function OwnerSidebar({
  hasPaidPlan = false,
  trialDaysLeft = 0,
}: {
  hasPaidPlan?: boolean;
  trialDaysLeft?: number;
}) {
  const pathname = usePathname();

  const isActive = (item: any) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href) && (item.href !== "/dashboard/owner" || pathname === "/dashboard/owner");

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:block w-64 shrink-0">
        <nav className="bg-white rounded-2xl border border-neutral-200 shadow-sm sticky top-24 overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
          
          <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Main Menu
            </p>
          </div>

          <div className="p-3 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex flex-col gap-1">
              {OWNER_NAV.map((item) => {
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

          {!hasPaidPlan && (
            <div className="p-3 border-t border-neutral-100 shrink-0">
              {trialDaysLeft > 0 ? (
                <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-100 p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={14} className="text-primary-600" />
                    <p className="text-xs font-bold text-primary-900">Free Trial Active</p>
                  </div>
                  <p className="text-[11px] text-primary-700 mb-3">
                    {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left before it ends
                  </p>
                  <Link
                    href="/dashboard/owner/subscription/upgrade"
                    className="block text-center text-xs font-bold bg-primary-600 text-white rounded-lg py-2 hover:bg-primary-700 transition-colors"
                  >
                    Upgrade Your Plan
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl bg-red-50 border border-red-100 p-3.5">
                  <p className="text-xs font-bold text-red-900 mb-1">Trial Expired</p>
                  <p className="text-[11px] text-red-700 mb-3">Upgrade to keep full access.</p>
                  <Link
                    href="/dashboard/owner/subscription/upgrade"
                    className="block text-center text-xs font-bold bg-red-600 text-white rounded-lg py-2 hover:bg-red-700 transition-colors"
                  >
                    Upgrade Now
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>

      {/* ── Mobile Bottom Navigation Bar ─────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          {OWNER_NAV.filter(item => !item.hideMobile).slice(0, 5).map((item) => {
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
