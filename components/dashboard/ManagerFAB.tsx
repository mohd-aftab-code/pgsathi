"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, X, UserPlus, Wrench, Wallet } from "lucide-react";

export function ManagerFAB() {
  const [open, setOpen] = useState(false);

  const actions = [
    {
      label: "Add Tenant",
      href: "/dashboard/manager/tenants/new",
      icon: UserPlus,
      color: "bg-violet-500 hover:bg-violet-600 text-white",
    },
    {
      label: "Log Issue",
      href: "/dashboard/manager/complaints/new",
      icon: Wrench,
      color: "bg-orange-500 hover:bg-orange-600 text-white",
    },
    {
      label: "Record Payment",
      href: "/dashboard/manager/payments/new",
      icon: Wallet,
      color: "bg-green-600 hover:bg-green-700 text-white",
    },
  ];

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* FAB Container */}
      <div className="fixed bottom-[84px] right-4 z-50 lg:bottom-6 lg:right-6 flex flex-col items-end gap-3">
        {/* Action Items */}
        <div className={`flex flex-col items-end gap-2 transition-all duration-300 ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-lg font-semibold text-sm transition-all duration-200 ${action.color} hover:scale-105 hover:shadow-xl`}
              >
                <Icon size={16} />
                {action.label}
              </Link>
            );
          })}
        </div>

        {/* Main FAB Button */}
        <button
          onClick={() => setOpen(!open)}
          className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
            open
              ? "bg-neutral-700 rotate-45 shadow-neutral-400/40"
              : "bg-violet-500 hover:bg-violet-600 shadow-violet-400/40"
          }`}
          aria-label="Quick Actions"
        >
          {open ? (
            <X size={22} className="text-white" />
          ) : (
            <Plus size={26} className="text-white" strokeWidth={2.5} />
          )}
        </button>
      </div>
    </>
  );
}
