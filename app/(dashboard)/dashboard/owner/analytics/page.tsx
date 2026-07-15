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
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Analytics Dashboard</h1>
          <p className="text-neutral-500">Track how your PG listings are performing.</p>
        </div>
        <button onClick={fetchAnalytics} className="btn-outline text-sm flex items-center gap-2">
          <RefreshCcw size={14} /> Refresh Data
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center gap-3 text-neutral-500 mb-2 font-medium text-sm">
            <MousePointerClick size={18} className="text-blue-500" />
            Total Profile Views
          </div>
          <div className="text-3xl font-extrabold text-neutral-900">{data.stats.views}</div>
          <div className="text-xs text-neutral-400 mt-2">All time</div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center gap-3 text-neutral-500 mb-2 font-medium text-sm">
            <Users size={18} className="text-green-500" />
            Leads Generated
          </div>
          <div className="text-3xl font-extrabold text-neutral-900">{data.stats.leads30}</div>
          <div className="text-xs text-neutral-400 mt-2">Last 30 days</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center gap-3 text-neutral-500 mb-2 font-medium text-sm">
            <BarChart3 size={18} className="text-purple-500" />
            Conversion Rate
          </div>
          <div className="text-3xl font-extrabold text-neutral-900">{data.stats.conversion}%</div>
          <div className="text-xs text-neutral-400 mt-2">Views to Leads</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center gap-3 text-neutral-500 mb-2 font-medium text-sm">
            <TrendingUp size={18} className="text-orange-500" />
            Active Properties
          </div>
          <div className="text-3xl font-extrabold text-neutral-900">{data.stats.totalListings}</div>
          <div className="text-xs text-neutral-400 mt-2">Currently published</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leads Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-neutral-200">
          <h3 className="font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-neutral-400" /> Leads Over Time (6 Months)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="month" tickFormatter={formatMonth} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="leads" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads by Source */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-neutral-200">
          <h3 className="font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Users size={18} className="text-neutral-400" /> Leads by Source
          </h3>
          <div className="h-52 w-full">
            {data.sources.length === 0 ? (
              <div className="h-full flex items-center justify-center text-neutral-400 text-sm">No leads recorded yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.sources}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={5} dataKey="count"
                  >
                    {data.sources.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="mt-4 space-y-2">
            {data.sources.map((s: any, idx: number) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {s.name}
                </span>
                <span className="font-bold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
