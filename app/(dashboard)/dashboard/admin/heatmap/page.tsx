"use client";
import { useState, useEffect } from "react";
import { BarChart, Search, Map, TrendingUp } from "lucide-react";

export default function AdminHeatmapPage() {
  const [data, setData] = useState<{ topQueries: any[], topCities: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/heatmap");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error("Heatmap fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-neutral-500">Loading demand heatmap...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 flex items-center gap-2">
            <TrendingUp className="text-rose-500" size={28} /> Demand Heatmap (Search Analytics)
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Track what tenants are searching for in real-time to identify high-demand zones.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Search Queries */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center gap-2">
            <Search className="text-indigo-500" size={20} />
            <h2 className="text-lg font-bold text-neutral-900">Top Search Queries (Micro-locations)</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              {data?.topQueries?.map((item: any, i: number) => (
                <li key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="font-semibold text-neutral-800">{item.query}</span>
                  </div>
                  <span className="text-sm font-bold text-neutral-500">{item._count.query} searches</span>
                </li>
              ))}
              {(!data?.topQueries || data.topQueries.length === 0) && (
                <p className="text-sm text-neutral-500">No search queries logged yet.</p>
              )}
            </ul>
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center gap-2">
            <Map className="text-emerald-500" size={20} />
            <h2 className="text-lg font-bold text-neutral-900">Most Searched Cities</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              {data?.topCities?.map((item: any, i: number) => (
                <li key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="font-semibold text-neutral-800 capitalize">{item.citySlug?.replace(/-/g, ' ')}</span>
                  </div>
                  <span className="text-sm font-bold text-neutral-500">{item._count.citySlug} searches</span>
                </li>
              ))}
              {(!data?.topCities || data.topCities.length === 0) && (
                <p className="text-sm text-neutral-500">No city searches logged yet.</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
