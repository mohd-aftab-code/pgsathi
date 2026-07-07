/**
 * app/(main)/dashboard/owner/manage/reports/page.tsx
 * Analytics & Reports dashboard.
 */
"use client";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, BedDouble, Wallet } from "lucide-react";
import { StatCard } from "@/components/manage/StatCard";

function formatINR(n: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n); }
function formatMonth(d: string) { return new Date(d).toLocaleDateString("en-IN", { month: "long", year: "numeric" }); }

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/manage/reports?months=6")
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    );
  }

  const c = data.current;
  const m = data.monthly;
  const maxVal = Math.max(...m.map((x: any) => Math.max(x.income, x.expense, 100)));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-neutral-900">Reports & Analytics</h1>
        <p className="text-sm text-neutral-500 mt-1">Current Month: {formatMonth(c.month)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={TrendingUp}   label="Total Income"    value={formatINR(c.income)}  tone="green" />
        <StatCard icon={TrendingDown} label="Total Expenses"  value={formatINR(c.expense)} tone="red" />
        <StatCard icon={Wallet}       label="Net Profit"      value={formatINR(c.net)}     tone={c.net >= 0 ? "green" : "red"} />
        <StatCard icon={Users}        label="Active Tenants"  value={c.activeTenants}      tone="purple" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart (CSS based for simplicity, avoids recharts dependency issues if not installed correctly) */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-bold text-neutral-900 mb-6">6-Month Trend</h3>
          <div className="h-64 flex items-end justify-between gap-2 pt-10 relative">
            {m.map((x: any, i: number) => {
              const incH = (x.income / maxVal) * 100;
              const expH = (x.expense / maxVal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group relative">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition text-xs whitespace-nowrap bg-neutral-900 text-white p-2 rounded z-10 pointer-events-none">
                    <div>Inc: {formatINR(x.income)}</div>
                    <div>Exp: {formatINR(x.expense)}</div>
                  </div>
                  <div className="w-full max-w-[40px] flex items-end gap-1">
                    <div className="w-1/2 bg-green-500 rounded-t-sm" style={{ height: `${incH}%` }} />
                    <div className="w-1/2 bg-red-500 rounded-t-sm" style={{ height: `${expH}%` }} />
                  </div>
                  <div className="text-[10px] text-neutral-500 font-semibold">{x.month.split("-")[1]}/{x.month.split("-")[0].slice(-2)}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold text-neutral-500">
            <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-green-500"/> Income</div>
            <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-red-500"/> Expense</div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2"><BedDouble className="h-4 w-4" /> Occupancy</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-500">Occupied Beds</span>
                  <span className="font-bold text-neutral-900">{c.occupiedBeds} / {c.totalBeds}</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${c.occupancyPct}%` }} />
                </div>
              </div>
              <div className="text-xs text-neutral-400 text-right">{c.occupancyPct}% Booked</div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2"><Wallet className="h-4 w-4" /> Rent Collection</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Expected Rent</span>
                <span className="font-bold text-neutral-900">{formatINR(c.expectedRent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Collected</span>
                <span className="font-bold text-green-700">{formatINR(c.collectedRent)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-100">
                <span className="text-neutral-500">Pending</span>
                <span className="font-bold text-red-600">{formatINR(c.pendingRent)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
