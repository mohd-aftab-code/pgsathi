import { db } from "@/lib/db";
import { format, subMonths, startOfMonth } from "date-fns";
import {
  TrendingUp, Users, Building2, IndianRupee, MapPin,
  MessageSquare, CheckCircle2, Clock, XCircle, Star,
} from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Reports — Admin | PGSathi" };

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default async function AdminReportsPage() {
  const now = new Date();

  // Build 6-month buckets
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = startOfMonth(subMonths(now, 5 - i));
    return { label: format(d, "MMM yy"), start: d, end: startOfMonth(subMonths(now, 4 - i)) };
  });

  const [
    totalUsers, totalOwners, totalTenants,
    totalListings, activeListings, pendingListings, inactiveListings,
    totalLeads, totalReviews,
    subscriptions,
    cityCounts,
    monthlyUsers,
    monthlyLeads,
    monthlyListings,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "OWNER" } }),
    db.user.count({ where: { role: "TENANT" } }),
    db.listing.count(),
    db.listing.count({ where: { status: "ACTIVE" } }),
    db.listing.count({ where: { status: "PENDING" } }),
    db.listing.count({ where: { status: "INACTIVE" } }),
    db.lead.count(),
    db.review.count(),
    db.subscription.findMany({
      where: { status: "ACTIVE" },
      select: { amount: true, startDate: true, billingCycle: true, plan: { select: { name: true } } },
    }),
    db.city.findMany({
      where: { isActive: true },
      select: { name: true, state: true, _count: { select: { listings: true } } },
      orderBy: { listings: { _count: "desc" } },
      take: 10,
    }),
    // Monthly signups
    Promise.all(months.map((m) =>
      db.user.count({ where: { createdAt: { gte: m.start, lt: m.end } } })
    )),
    // Monthly leads
    Promise.all(months.map((m) =>
      db.lead.count({ where: { createdAt: { gte: m.start, lt: m.end } } })
    )),
    // Monthly listings added
    Promise.all(months.map((m) =>
      db.listing.count({ where: { createdAt: { gte: m.start, lt: m.end } } })
    )),
  ]);

  const totalRevenue = subscriptions.reduce((s, sub) => s + sub.amount, 0);
  const monthlyRevenue = subscriptions.filter((s) => s.billingCycle === "MONTHLY").reduce((a, s) => a + s.amount, 0);

  // Plan distribution
  const planDist: Record<string, number> = {};
  for (const sub of subscriptions) {
    const name = sub.plan?.name ?? "Unknown";
    planDist[name] = (planDist[name] ?? 0) + 1;
  }

  const chartData = months.map((m, i) => ({
    label: m.label,
    users: monthlyUsers[i],
    leads: monthlyLeads[i],
    listings: monthlyListings[i],
  }));

  const maxUsers = Math.max(...chartData.map((d) => d.users), 1);
  const maxLeads = Math.max(...chartData.map((d) => d.leads), 1);
  const maxListings = Math.max(...chartData.map((d) => d.listings), 1);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Analytics & Reports</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Platform-wide metrics — {format(now, "MMMM yyyy")}</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <a
            href="/api/admin/reports/export?type=users"
            className="h-8 px-3 rounded-xl bg-white/60 backdrop-blur-md border border-neutral-200/60 hover:border-violet-300 hover:text-violet-700 text-neutral-600 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            Export Users CSV
          </a>
          <a
            href="/api/admin/reports/export?type=listings"
            className="h-8 px-3 rounded-xl bg-white/60 backdrop-blur-md border border-neutral-200/60 hover:border-violet-300 hover:text-violet-700 text-neutral-600 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            Export Listings CSV
          </a>
        </div>
      </div>

      {/* KPI Grid */}
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: totalUsers, sub: `${totalOwners} owners · ${totalTenants} tenants`, icon: Users, color: "text-blue-600", bg: "bg-blue-50/50 border-blue-200/50" },
          { label: "Total PGs", value: totalListings, sub: `${activeListings} active · ${pendingListings} pending`, icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50/50 border-emerald-200/50" },
          { label: "Active Revenue", value: inr(totalRevenue), sub: `${subscriptions.length} active plans`, icon: IndianRupee, color: "text-violet-600", bg: "bg-violet-50/50 border-violet-200/50" },
          { label: "Total Leads", value: totalLeads.toLocaleString(), sub: `${totalReviews} platform reviews`, icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-50/50 border-amber-200/50" },
        ].map((s) => (
          <div key={s.label} className={`bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border ${s.bg}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">{s.label}</div>
              <div className={`p-1.5 rounded-2xl bg-white/60 backdrop-blur-md border ${s.bg} bg-opacity-50`}><s.icon size={12} className={s.color} /></div>
            </div>
            <div className="text-2xl font-black text-neutral-900 leading-none">{s.value}</div>
            <div className="text-[9px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Listing Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-neutral-200/60">
          <h2 className="text-[11px] font-black text-neutral-900 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Building2 size={12} className="text-violet-600" /> Listing Status Breakdown
          </h2>
          <div className="space-y-3">
            {[
              { label: "Active", count: activeListings, total: totalListings, color: "bg-emerald-500", textColor: "text-emerald-700", badgeBg: "bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
              { label: "Pending Review", count: pendingListings, total: totalListings, color: "bg-amber-500", textColor: "text-amber-700", badgeBg: "bg-amber-50 border-amber-100", icon: Clock },
              { label: "Inactive", count: inactiveListings, total: totalListings, color: "bg-neutral-400", textColor: "text-neutral-600", badgeBg: "bg-neutral-50 border-neutral-200/60", icon: XCircle },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                    <s.icon size={13} className={s.textColor} /> {s.label}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badgeBg} ${s.textColor}`}>
                    {s.count}
                  </span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color} transition-all`}
                    style={{ width: `${totalListings > 0 ? (s.count / totalListings) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  {totalListings > 0 ? Math.round((s.count / totalListings) * 100) : 0}% of total
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription / Plan Distribution */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-neutral-200/60">
          <h2 className="text-[11px] font-black text-neutral-900 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <IndianRupee size={12} className="text-violet-600" /> Subscription Breakdown
          </h2>
          {Object.keys(planDist).length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-sm">No active subscriptions</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(planDist)
                .sort((a, b) => b[1] - a[1])
                .map(([plan, count]) => (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-neutral-700">{plan}</span>
                      <span className="text-xs font-bold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">{count}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{ width: `${(count / subscriptions.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              <div className="pt-2 border-t border-neutral-100">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500 font-medium">Monthly Revenue</span>
                  <span className="font-bold text-violet-700">{inr(monthlyRevenue)}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-neutral-500 font-medium">Total Active Revenue</span>
                  <span className="font-bold text-emerald-700">{inr(totalRevenue)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Breakdown */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-neutral-200/60">
          <h2 className="text-[11px] font-black text-neutral-900 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Users size={12} className="text-blue-600" /> User Breakdown
          </h2>
          <div className="space-y-3">
            {[
              { label: "PG Owners", count: totalOwners, color: "bg-violet-500", pct: totalUsers > 0 ? (totalOwners / totalUsers) * 100 : 0 },
              { label: "Tenants", count: totalTenants, color: "bg-blue-500", pct: totalUsers > 0 ? (totalTenants / totalUsers) * 100 : 0 },
              { label: "Admins", count: totalUsers - totalOwners - totalTenants, color: "bg-red-400", pct: totalUsers > 0 ? ((totalUsers - totalOwners - totalTenants) / totalUsers) * 100 : 0 },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-neutral-700">{s.label}</span>
                  <span className="text-xs font-bold text-neutral-600">{s.count}</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-neutral-100 flex justify-between text-xs">
              <span className="text-neutral-500 font-medium">Total Users</span>
              <span className="font-bold text-neutral-800">{totalUsers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Charts (bar chart using CSS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* New Users */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-neutral-200/60">
          <h2 className="text-[11px] font-black text-neutral-900 uppercase tracking-widest mb-1">New Users / Month</h2>
          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-4">Last 6 months</p>
          <div className="flex items-end gap-1.5 h-24">
            {chartData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-blue-600">{d.users}</span>
                <div className="w-full bg-neutral-100 rounded-t-md overflow-hidden" style={{ height: "80px" }}>
                  <div
                    className="bg-blue-500 rounded-t-md w-full transition-all"
                    style={{ height: `${(d.users / maxUsers) * 100}%`, marginTop: "auto" }}
                  />
                </div>
                <span className="text-[9px] text-neutral-400 font-medium">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* New Leads */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-neutral-200/60">
          <h2 className="text-[11px] font-black text-neutral-900 uppercase tracking-widest mb-1">Leads / Month</h2>
          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-4">Last 6 months</p>
          <div className="flex items-end gap-1.5 h-24">
            {chartData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-amber-600">{d.leads}</span>
                <div className="w-full bg-neutral-100 rounded-t-md overflow-hidden" style={{ height: "80px" }}>
                  <div
                    className="bg-amber-500 rounded-t-md w-full"
                    style={{ height: `${(d.leads / maxLeads) * 100}%`, marginTop: "auto" }}
                  />
                </div>
                <span className="text-[9px] text-neutral-400 font-medium">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* New Listings */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-neutral-200/60">
          <h2 className="text-[11px] font-black text-neutral-900 uppercase tracking-widest mb-1">New PGs Added / Month</h2>
          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-4">Last 6 months</p>
          <div className="flex items-end gap-1.5 h-24">
            {chartData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-emerald-600">{d.listings}</span>
                <div className="w-full bg-neutral-100 rounded-t-md overflow-hidden" style={{ height: "80px" }}>
                  <div
                    className="bg-emerald-500 rounded-t-md w-full"
                    style={{ height: `${(d.listings / maxListings) * 100}%`, marginTop: "auto" }}
                  />
                </div>
                <span className="text-[9px] text-neutral-400 font-medium">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* City-wise PG Distribution */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-neutral-200/60 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100/60">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-violet-600" />
            <h2 className="text-[11px] font-black text-neutral-900 uppercase tracking-widest">Top Cities by PG Count</h2>
          </div>
          <Link href="/dashboard/admin/cities" className="text-[10px] font-bold text-violet-600 hover:text-violet-700 uppercase tracking-wider">
            Manage Cities →
          </Link>
        </div>
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="text-left text-[9px] uppercase tracking-wider text-neutral-400 bg-neutral-50/50 border-b border-neutral-100/60">
                <th className="px-4 py-2 font-bold">#</th>
                <th className="px-4 py-2 font-bold">City</th>
                <th className="px-4 py-2 font-bold">State</th>
                <th className="px-4 py-2 font-bold">PGs Listed</th>
                <th className="px-4 py-2 font-bold">Distribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50/60 text-[11px]">
              {cityCounts.map((city, i) => (
                <tr key={city.name} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="px-4 py-2 font-bold text-neutral-400">#{i + 1}</td>
                  <td className="px-4 py-2 font-bold text-neutral-900">{city.name}</td>
                  <td className="px-4 py-2 font-medium text-neutral-500">{city.state}</td>
                  <td className="px-4 py-2">
                    <span className="text-[11px] font-black text-violet-700">{city._count.listings}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden" style={{ width: "100px" }}>
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${activeListings > 0 ? (city._count.listings / (cityCounts[0]._count.listings || 1)) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {totalListings > 0 ? Math.round((city._count.listings / totalListings) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {cityCounts.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-neutral-400 text-sm">No cities found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards for Top Cities */}
        <div className="grid grid-cols-1 gap-0 divide-y divide-neutral-100 md:hidden">
          {cityCounts.map((city, i) => (
            <div key={city.name} className="p-3 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-neutral-400">#{i + 1}</span>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">{city.name}</div>
                    <div className="text-[10px] text-neutral-500">{city.state}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">PGs Listed</div>
                  <div className="text-sm font-black text-violet-700 leading-none mt-0.5">{city._count.listings}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${activeListings > 0 ? (city._count.listings / (cityCounts[0]._count.listings || 1)) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-400 font-bold">
                  {totalListings > 0 ? Math.round((city._count.listings / totalListings) * 100) : 0}% of total
                </span>
              </div>
            </div>
          ))}
          {cityCounts.length === 0 && (
            <div className="text-center py-8 text-neutral-400 text-sm">No cities found.</div>
          )}
        </div>
      </div>

    </div>
  );
}
