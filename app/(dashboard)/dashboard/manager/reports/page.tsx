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
    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-4 sm:p-5 hover:bg-white/80 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{label}</span>
        <div className={`p-2 rounded-xl ${t.bg}`}><Icon size={16} className={t.icon} /></div>
      </div>
      <p className={`text-2xl font-black tracking-tight ${t.text}`}>{value}</p>
      {sub && <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mt-1">{sub}</p>}
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
        <div className="h-8 w-56 bg-white/40 skeleton rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white/40 skeleton rounded-2xl border border-neutral-200/40" />)}
        </div>
        <div className="h-72 bg-white/40 skeleton rounded-3xl border border-neutral-200/40" />
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
      <div className="flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-neutral-200/60">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase flex items-center gap-2">
            <BarChart2 className="text-violet-600" size={22} /> Reports & Analytics
          </h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">
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
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-md rounded-3xl border border-neutral-200/60 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 size={16} className="text-neutral-400" /> 6-Month Trend
            </h2>
            {/* Toggle */}
            <div className="flex bg-white/50 border border-neutral-200/60 rounded-xl p-1 gap-1">
              {(["both", "income", "expense"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`text-[9px] font-black tracking-wider uppercase px-3 py-1.5 rounded-2xl transition-all ${
                    view === v ? "bg-white/60 backdrop-blur-md shadow-sm text-violet-700" : "text-neutral-500 hover:text-neutral-700 hover:bg-white/40"
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
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none bg-neutral-900 text-white text-xs rounded-2xl p-2 whitespace-nowrap left-1/2 -translate-x-1/2">
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
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-5 sm:p-6">
            <h3 className="text-[10px] font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BedDouble size={15} className="text-violet-500" /> Occupancy
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
            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-3">
              {c.totalBeds - c.occupiedBeds} beds vacant
            </p>
          </div>

          {/* Rent Collection */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-5 sm:p-6">
            <h3 className="text-[10px] font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Wallet size={15} className="text-emerald-500" /> Rent Collection
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
            <div className="space-y-2.5 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex justify-between items-center bg-white/40 p-2 rounded-2xl border border-neutral-200/40">
                <span className="text-neutral-500">Expected</span>
                <span className="font-black text-neutral-800">{formatINR(c.expectedRent)}</span>
              </div>
              <div className="flex justify-between items-center bg-white/40 p-2 rounded-2xl border border-neutral-200/40">
                <span className="text-neutral-500">Collected</span>
                <span className="font-black text-emerald-700">{formatINR(c.collectedRent)}</span>
              </div>
              <div className="flex justify-between items-center bg-white/40 p-2 rounded-2xl border border-neutral-200/40">
                <span className="text-neutral-500">Pending</span>
                <span className="font-black text-red-600">{formatINR(c.pendingRent)}</span>
              </div>
            </div>
          </div>

          {/* Status breakdown */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-5 sm:p-6">
            <h3 className="text-[10px] font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <PieChart size={15} className="text-blue-500" /> Quick Status
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "Pending Bills", value: c.pendingBills ?? 0, icon: AlertCircle, cls: "text-red-600 bg-red-50" },
                { label: "Resolved Complaints", value: c.resolvedComplaints ?? 0, icon: CheckCircle2, cls: "text-green-600 bg-green-50" },
                { label: "Open Complaints", value: c.openComplaints ?? 0, icon: AlertCircle, cls: "text-orange-600 bg-orange-50" },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center justify-between bg-white/40 p-2 rounded-2xl border border-neutral-200/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-2">
                      <span className={`p-1.5 rounded-xl ${s.cls}`}><Icon size={12} /></span>
                      {s.label}
                    </span>
                    <span className="font-black text-neutral-900 text-xs">{s.value}</span>
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
