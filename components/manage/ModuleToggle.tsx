"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Receipt } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import toast from "react-hot-toast";

type ModuleKey = "messMenuEnabled" | "expensesEnabled";

// Icons live INSIDE this client component — a server component (the Settings page)
// cannot pass a function/component (lucide icon) as a prop across the RSC boundary.
const ICONS: Record<ModuleKey, LucideIcon> = {
  messMenuEnabled: ChefHat,
  expensesEnabled: Receipt,
};

/**
 * Owner-facing switch for an optional CRM module (Mess Menu, Expenses, …).
 * Persists the owner preference via /api/account/preferences and refreshes so
 * the CRM sidebar re-renders with/without the module's nav item.
 */
export function ModuleToggle({
  moduleKey,
  title,
  description,
  initialEnabled,
}: {
  moduleKey: ModuleKey;
  title: string;
  description: string;
  initialEnabled: boolean;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const Icon = ICONS[moduleKey];

  async function toggle() {
    if (saving) return;
    const next = !enabled;
    setEnabled(next); // optimistic
    setSaving(true);
    try {
      const res = await fetch("/api/account/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [moduleKey]: next }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message || "Failed to update");
      toast.success(next ? `${title} enabled — check the sidebar` : `${title} hidden`);
      router.refresh();
    } catch (err: any) {
      setEnabled(!next); // revert
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-white rounded-lg border border-neutral-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-violet-50 p-2 rounded-lg">
          <Icon size={18} className="text-violet-600" />
        </div>
        <div>
          <div className="text-sm font-bold text-neutral-900">{title}</div>
          <div className="text-xs text-neutral-500">{description}</div>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle ${title} module`}
        disabled={saving}
        onClick={toggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
          enabled ? "bg-violet-600" : "bg-neutral-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
