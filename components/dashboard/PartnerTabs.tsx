"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Handshake, IndianRupee, Wallet, SlidersHorizontal } from "lucide-react";

const TABS = [
  { name: "Directory", href: "/dashboard/admin/partners", exact: true, icon: Handshake },
  { name: "Earnings", href: "/dashboard/admin/partners/earnings", exact: false, icon: IndianRupee },
  { name: "Payouts", href: "/dashboard/admin/partners/payouts", exact: false, icon: Wallet },
  { name: "Settings", href: "/dashboard/admin/partners/settings", exact: false, icon: SlidersHorizontal },
];

export function PartnerTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide border-b border-neutral-200/60">
      {TABS.map((tab) => {
        const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              isActive
                ? "bg-violet-100 text-violet-800 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            <Icon size={14} className={isActive ? "text-violet-600" : "text-neutral-400"} />
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
