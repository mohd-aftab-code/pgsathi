"use client";
import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, MousePointerClick, RefreshCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

function formatMonth(ym: string) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString("en-IN", { month: "short" });
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/analytics");
      const d = await res.json();
      if (d.success) setData(d.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAnalytics(); }, []);

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

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Analytics Dashboard</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Track how your PG listings are performing.</p>
        </div>
        <button onClick={fetchAnalytics} className="flex items-center gap-2 h-8 px-3 bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors shadow-sm">
          <RefreshCcw size={12} /> Refresh
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-neutral-200/60">
          <div className="flex items-center gap-2 text-neutral-500 mb-2 font-bold text-[10px] uppercase tracking-wider">
            <MousePointerClick size={14} className="text-blue-500" />
            Total Profile Views
          </div>
          <div className="text-2xl font-black text-neutral-900 leading-none">{data.stats.views}</div>
          <div className="text-[9px] font-medium text-neutral-400 mt-1.5 uppercase tracking-wider">All time</div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-neutral-200/60">
          <div className="flex items-center gap-2 text-neutral-500 mb-2 font-bold text-[10px] uppercase tracking-wider">
            <Users size={14} className="text-emerald-500" />
            Leads Generated
          </div>
          <div className="text-2xl font-black text-neutral-900 leading-none">{data.stats.leads30}</div>
          <div className="text-[9px] font-medium text-neutral-400 mt-1.5 uppercase tracking-wider">Last 30 days</div>
        </div>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-neutral-200/60">
          <div className="flex items-center gap-2 text-neutral-500 mb-2 font-bold text-[10px] uppercase tracking-wider">
            <BarChart3 size={14} className="text-violet-500" />
            Conversion Rate
          </div>
          <div className="text-2xl font-black text-neutral-900 leading-none">{data.stats.conversion}%</div>
          <div className="text-[9px] font-medium text-neutral-400 mt-1.5 uppercase tracking-wider">Views to Leads</div>
        </div>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-neutral-200/60">
          <div className="flex items-center gap-2 text-neutral-500 mb-2 font-bold text-[10px] uppercase tracking-wider">
            <TrendingUp size={14} className="text-orange-500" />
            Active Properties
          </div>
          <div className="text-2xl font-black text-neutral-900 leading-none">{data.stats.totalListings}</div>
          <div className="text-[9px] font-medium text-neutral-400 mt-1.5 uppercase tracking-wider">Currently published</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Leads Trend */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-neutral-200/60">
          <h3 className="font-black text-neutral-900 text-[11px] uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <BarChart3 size={14} className="text-neutral-400" /> Leads Over Time (6 Months)
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="month" tickFormatter={formatMonth} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888', fontWeight: 600 }} />
                <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="leads" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={30} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads by Source */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-neutral-200/60 flex flex-col">
          <h3 className="font-black text-neutral-900 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users size={14} className="text-neutral-400" /> Leads by Source
          </h3>
          <div className="h-44 w-full shrink-0">
            {data.sources.length === 0 ? (
              <div className="h-full flex items-center justify-center text-neutral-400 text-sm">No leads recorded yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.sources}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={70}
                    paddingAngle={5} dataKey="count"
                  >
                    {data.sources.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="mt-auto space-y-1.5 pt-2">
            {data.sources.map((s: any, idx: number) => (
              <div key={s.name} className="flex items-center justify-between text-[11px] bg-white/60 backdrop-blur-md border border-neutral-100 rounded-2xl px-2.5 py-1.5">
                <span className="flex items-center gap-1.5 font-bold text-neutral-600">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {s.name}
                </span>
                <span className="font-black text-neutral-900">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
