/**
 * components/manage/PlanGate.tsx
 * Shown when a Starter/free plan owner tries to access Manager features.
 */
import Link from "next/link";
import { Lock, Zap, Check } from "lucide-react";

interface Props {
  currentPlan?: string;
}

export function PlanGate({ currentPlan = "STARTER" }: Props) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-primary-50">
        <Lock className="h-10 w-10 text-primary-600" />
      </div>

      <h1 className="text-2xl font-extrabold text-neutral-900">
        PG Manager — Paid Feature
      </h1>
      <p className="mt-3 max-w-md text-neutral-500">
        Aapka current plan <strong>{currentPlan}</strong> hai. PG Manager dashboard access
        karne ke liye <strong>Growth</strong> ya <strong>Pro</strong> plan lena hoga.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 max-w-xl w-full">
        {/* Growth */}
        <div className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-primary-600" />
            <span className="font-bold text-primary-800">Growth — ₹349/mo</span>
          </div>
          <ul className="space-y-1.5 text-sm text-neutral-700">
            {["Tenant Management","Rent & Billing","WhatsApp Reminders","Complaints","Expenses","Staff & Mess","Reports"].map(f => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro */}
        <div className="rounded-2xl border-2 border-purple-400 bg-purple-50 p-6 text-left relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-0.5 text-xs font-bold text-white">
            Best Value
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-purple-600" />
            <span className="font-bold text-purple-800">Pro — ₹1799/mo</span>
          </div>
          <ul className="space-y-1.5 text-sm text-neutral-700">
            {["Everything in Growth","Team Logins (5 members)","PDF Agreements","Excel Export","Advanced Analytics","Priority Support"].map(f => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link
          href="/pricing"
          id="plan-gate-upgrade-btn"
          className="btn-primary"
        >
          Upgrade Plan
        </Link>
        <Link
          href="/dashboard/owner"
          className="btn-outline"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
