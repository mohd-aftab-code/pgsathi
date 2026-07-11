"use client";
import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Users, BedDouble, Wallet,
  AlertCircle, CheckCircle2, BarChart2, PieChart
} from "lucide-react";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
function monthLabel(m: string) {
  const [year, month] = m.split("-");
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

function StatCard({ icon: Icon, label, value, sub, tone }: {
  icon: any; label: string; value: string | number; sub?: string;
  tone: "green" | "red" | "purple" | "blue" | "orange";
}) {
  const tones = {
    green:  { bg: "bg-green-50",  text: "text-green-700",  icon: "text-green-600"  },
    red:    { bg: "bg-red-50",    text: "text-red-700",    icon: "text-red-600"    },
    purple: { bg: "bg-violet-50", text: "text-violet-700", icon: "text-violet-600" },
    blue:   { bg: "bg-blue-50",   text: "text-blue-700",   icon: "text-blue-600"   },
    orange: { bg: "bg-orange-50", text: "text-orange-700", icon: "text-orange-600" },
  };
  const t = tones[tone];
  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-neutral-500">{label}</span>
        <div className={`p-2 rounded-lg ${t.bg}`}><Icon size={16} className={t.icon} /></div>
      </div>
      <p className={`text-2xl font-bold ${t.text}`}>{value}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function ReportsPage() {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState<"income" | "expense" | "both">("both");

  useEffect(() => {
    fetch("/api/manage/reports?months=6")
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 skeleton rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 skeleton rounded-xl" />)}
        </div>
        <div className="h-72 skeleton rounded-2xl" />
      </div>
    );
  }

  const c   = data.current;
  const m   = data.monthly as any[];
  const maxV = Math.max(...m.map((x: any) => Math.max(x.income, x.expense, 1)));

  const collectionPct = c.expectedRent > 0 ? Math.round((c.collectedRent / c.expectedRent) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <BarChart2 className="text-violet-600" size={22} /> Reports & Analytics
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {new Date(c.month + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })} — Live Data
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp}   label="Total Income"   value={formatINR(c.income)}   sub="This month" tone="green"  />
        <StatCard icon={TrendingDown} label="Total Expenses" value={formatINR(c.expense)}  sub="This month" tone="red"    />
        <StatCard icon={Wallet}       label="Net Profit"     value={formatINR(c.net)}       sub={c.net >= 0 ? "Profitable" : "Loss"} tone={c.net >= 0 ? "green" : "red"} />
        <StatCard icon={Users}        label="Active Tenants" value={c.activeTenants}        sub="Currently"  tone="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-Month Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-neutral-900 flex items-center gap-2">
              <BarChart2 size={16} className="text-neutral-400" /> 6-Month Trend
            </h2>
            {/* Toggle */}
            <div className="flex bg-neutral-100 rounded-lg p-1 gap-1">
              {(["both", "income", "expense"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`text-xs font-semibold px-3 py-1 rounded-md transition-all capitalize ${
                    view === v ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {v === "both" ? "Both" : v === "income" ? "Income" : "Expense"}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-52 flex items-end gap-3">
            {m.map((x: any, i: number) => {
              const incH = Math.max(4, (x.income / maxV) * 100);
              const expH = Math.max(4, (x.expense / maxV) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none bg-neutral-900 text-white text-xs rounded-lg p-2 whitespace-nowrap left-1/2 -translate-x-1/2">
                    <div className="text-green-400">↑ {formatINR(x.income)}</div>
                    <div className="text-red-400">↓ {formatINR(x.expense)}</div>
                  </div>

                  {/* Bars */}
                  <div className="w-full flex items-end justify-center gap-0.5">
                    {(view === "both" || view === "income") && (
                      <div
                        className="w-1/2 max-w-[20px] bg-green-400 rounded-t-sm transition-all duration-500 hover:bg-green-500"
                        style={{ height: `${incH}%` }}
                      />
                    )}
                    {(view === "both" || view === "expense") && (
                      <div
                        className="w-1/2 max-w-[20px] bg-red-400 rounded-t-sm transition-all duration-500 hover:bg-red-500"
                        style={{ height: `${expH}%` }}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">{monthLabel(x.month)}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 text-xs font-semibold text-neutral-500">
            <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-green-400" /> Income</div>
            <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-red-400" /> Expense</div>
          </div>
        </div>

        {/* Right Column: Occupancy + Rent Collection */}
        <div className="space-y-5">
          {/* Occupancy */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
            <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2 text-sm">
              <BedDouble size={15} className="text-neutral-400" /> Occupancy
            </h3>
            <div className="flex items-end gap-4 mb-3">
              <span className="text-3xl font-black text-violet-700">{c.occupancyPct}%</span>
              <span className="text-sm text-neutral-500 pb-1">{c.occupiedBeds}/{c.totalBeds} beds</span>
            </div>
            <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all duration-700"
                style={{ width: `${c.occupancyPct}%` }}
              />
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              {c.totalBeds - c.occupiedBeds} beds vacant
            </p>
          </div>

          {/* Rent Collection */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
            <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2 text-sm">
              <Wallet size={15} className="text-neutral-400" /> Rent Collection
            </h3>
            <div className="flex items-end gap-4 mb-3">
              <span className="text-3xl font-black text-green-700">{collectionPct}%</span>
              <span className="text-sm text-neutral-500 pb-1">collected</span>
            </div>
            <div className="h-3 bg-neutral-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
                style={{ width: `${collectionPct}%` }}
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Expected</span>
                <span className="font-bold text-neutral-800">{formatINR(c.expectedRent)}</span>
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

          {/* Status breakdown */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
            <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2 text-sm">
              <PieChart size={15} className="text-neutral-400" /> Quick Status
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "Pending Bills", value: c.pendingBills ?? 0, icon: AlertCircle, cls: "text-red-600 bg-red-50" },
                { label: "Resolved Complaints", value: c.resolvedComplaints ?? 0, icon: CheckCircle2, cls: "text-green-600 bg-green-50" },
                { label: "Open Complaints", value: c.openComplaints ?? 0, icon: AlertCircle, cls: "text-orange-600 bg-orange-50" },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 flex items-center gap-2">
                      <span className={`p-1 rounded ${s.cls}`}><Icon size={12} /></span>
                      {s.label}
                    </span>
                    <span className="font-bold text-neutral-900">{s.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
