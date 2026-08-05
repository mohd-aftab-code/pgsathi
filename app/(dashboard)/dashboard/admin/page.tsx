import { db } from "@/lib/db";
import {
  Users, Building2, ShieldAlert, BadgeIndianRupee, TrendingUp, Activity,
  ArrowRight, CheckCircle2, FileBarChart, ShieldCheck, Handshake, PieChart,
  IndianRupee, Wallet, Settings, AlertCircle, Clock, Zap,
  BarChart3, UserCheck, ChevronLeft, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

const PAGE_SIZE = 12;

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  try {
    const sp = await searchParams;
    const page = Math.max(1, parseInt(sp?.page ?? "1") || 1);
    const skip = (page - 1) * PAGE_SIZE;

    const [
      pendingListings,
      activeListings,
      totalListings,
      totalUsers,
      activeSubscriptions,
      recentListings,
      totalOwners,
      recentUsers,
    ] = await Promise.all([
      db.listing.count({ where: { status: "PENDING" } }),
      db.listing.count({ where: { status: "ACTIVE" } }),
      db.listing.count(),
      db.user.count(),
      db.subscription.findMany({ where: { status: "ACTIVE" } }),
      db.listing.findMany({
        take: PAGE_SIZE,
        skip,
        where: { cityId: { gt: 0 } },
        orderBy: { createdAt: "desc" },
        include: { owner: { select: { name: true } }, city: true },
      }),
      db.user.count({ where: { role: "OWNER" } }),
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
    ]);

    const totalRevenue = activeSubscriptions.reduce((acc, sub) => acc + sub.amount, 0);
    const totalPages = Math.ceil(totalListings / PAGE_SIZE);
    const now = new Date();

    return (
      <div className="space-y-4 max-w-7xl mx-auto">

        {/* ── Compact Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Admin Overview</h1>
            <p className="text-neutral-500 text-xs font-medium mt-0.5">{format(now, "EEEE, d MMMM yyyy")} · Platform Statistics</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2.5 py-1.5 rounded-full shrink-0 shadow-sm uppercase tracking-wide">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            System Online
          </div>
        </div>

        {/* ── Compact VIP Stats Row ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Pending Approvals */}
          <Link
            href="/dashboard/admin/verify"
            className="group bg-white/60 backdrop-blur-md rounded-2xl p-3.5 shadow-sm border border-neutral-200/60 hover:border-amber-300 hover:shadow-md hover:bg-white transition-all flex flex-col relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-amber-500 bg-amber-50 p-1.5 rounded-xl border border-amber-100/50">
                <ShieldAlert size={16} />
              </div>
              {pendingListings > 0 && (
                <span className="flex h-2 w-2 mr-1 mt-1">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
              )}
            </div>
            <div className="text-2xl font-black text-neutral-900 leading-none">{pendingListings}</div>
            <div className="text-[10px] font-extrabold text-neutral-500 mt-1 uppercase tracking-wider">Pending Approvals</div>
          </Link>

          {/* Active PGs */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3.5 shadow-sm border border-neutral-200/60 hover:bg-white transition-all flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div className="text-emerald-500 bg-emerald-50 p-1.5 rounded-xl border border-emerald-100/50">
                <Building2 size={16} />
              </div>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100/50 uppercase tracking-wider">
                {totalListings} total
              </span>
            </div>
            <div className="text-2xl font-black text-neutral-900 leading-none">{activeListings}</div>
            <div className="text-[10px] font-extrabold text-neutral-500 mt-1 uppercase tracking-wider">Active PGs</div>
          </div>

          {/* Users */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3.5 shadow-sm border border-neutral-200/60 hover:bg-white transition-all flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div className="text-blue-500 bg-blue-50 p-1.5 rounded-xl border border-blue-100/50">
                <Users size={16} />
              </div>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100/50 uppercase tracking-wider">
                {totalOwners} owners
              </span>
            </div>
            <div className="text-2xl font-black text-neutral-900 leading-none">{totalUsers}</div>
            <div className="text-[10px] font-extrabold text-neutral-500 mt-1 uppercase tracking-wider">Registered Users</div>
          </div>

          {/* Revenue */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3.5 shadow-sm border border-neutral-200/60 hover:bg-white transition-all flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div className="text-violet-500 bg-violet-50 p-1.5 rounded-xl border border-violet-100/50">
                <BadgeIndianRupee size={16} />
              </div>
              <span className="text-[9px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md border border-violet-100/50 uppercase tracking-wider">
                {activeSubscriptions.length} plans
              </span>
            </div>
            <div className="text-2xl font-black text-neutral-900 leading-none">₹{totalRevenue.toLocaleString("en-IN")}</div>
            <div className="text-[10px] font-extrabold text-neutral-500 mt-1 uppercase tracking-wider">Pro Revenue</div>
          </div>
        </div>

        {/* ── Main Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Listings table — 2/3 */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-200/80 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="text-violet-600">
                  <Building2 size={16} />
                </div>
                <div>
                  <h2 className="text-[13px] font-extrabold text-neutral-900 uppercase tracking-wide">All Listings</h2>
                </div>
              </div>
              <Link
                href="/dashboard/admin/verify"
                className="text-[10px] font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-md transition-colors border border-violet-100 uppercase tracking-wider"
              >
                Verify Pending →
              </Link>
            </div>

            {/* Compact table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="text-left text-[9px] uppercase tracking-wider text-neutral-400 bg-neutral-50/80 border-b border-neutral-100">
                    <th className="px-4 py-2 font-bold">PG Name</th>
                    <th className="px-3 py-2 font-bold">Owner</th>
                    <th className="px-3 py-2 font-bold">City</th>
                    <th className="px-3 py-2 font-bold">Status</th>
                    <th className="px-3 py-2 font-bold text-right">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {recentListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-neutral-50/70 transition-colors group">
                      <td className="px-4 py-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] ${
                            listing.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : listing.status === "PENDING"
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : "bg-neutral-100 text-neutral-400"
                          }`}>
                            {listing.status === "ACTIVE" ? <CheckCircle2 size={12} /> : listing.status === "PENDING" ? <Clock size={12} /> : <AlertCircle size={12} />}
                          </div>
                          <span className="font-bold text-neutral-800 text-[11px] line-clamp-1 group-hover:text-violet-700 transition-colors">
                            {listing.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-[11px] text-neutral-500 font-medium max-w-[100px] truncate">
                        {listing.owner?.name ?? "—"}
                      </td>
                      <td className="px-3 py-1.5 text-[11px] text-violet-600 font-bold">
                        {listing.city?.name ?? "—"}
                      </td>
                      <td className="px-3 py-1.5">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 uppercase tracking-wider ${
                          listing.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : listing.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-neutral-100 text-neutral-500"
                        }`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-[10px] font-medium text-neutral-400 text-right whitespace-nowrap">
                        {formatDistanceToNow(listing.createdAt, { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                  {recentListings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-neutral-400 text-xs">
                        No listings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-100 bg-neutral-50/50">
                <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                  {skip + 1}–{Math.min(skip + PAGE_SIZE, totalListings)} of {totalListings}
                </span>
                <div className="flex items-center gap-1">
                  {/* Prev */}
                  {page > 1 ? (
                    <Link
                      href={`?page=${page - 1}`}
                      className="flex items-center gap-1 text-[10px] font-bold text-neutral-600 hover:text-violet-700 bg-white border border-neutral-200 px-2 py-1 rounded-md transition-all uppercase tracking-wider"
                    >
                      <ChevronLeft size={12} /> Prev
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-300 bg-neutral-50 border border-neutral-100 px-2 py-1 rounded-md cursor-not-allowed uppercase tracking-wider">
                      <ChevronLeft size={12} /> Prev
                    </span>
                  )}
                  {/* Next */}
                  {page < totalPages ? (
                    <Link
                      href={`?page=${page + 1}`}
                      className="flex items-center gap-1 text-[10px] font-bold text-neutral-600 hover:text-violet-700 bg-white border border-neutral-200 px-2 py-1 rounded-md transition-all uppercase tracking-wider"
                    >
                      Next <ChevronRight size={12} />
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-300 bg-neutral-50 border border-neutral-100 px-2 py-1 rounded-md cursor-not-allowed uppercase tracking-wider">
                      Next <ChevronRight size={12} />
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-md border border-neutral-200/80 rounded-2xl p-3.5 shadow-sm">
              <div className="flex items-center gap-2 mb-2.5 pb-2.5 border-b border-neutral-100">
                <div className="text-violet-600">
                  <Zap size={14} />
                </div>
                <h2 className="text-[12px] font-extrabold text-neutral-900 uppercase tracking-wide">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { href: "/dashboard/admin/users", icon: Users, label: "Users", iconClass: "text-blue-500", bgClass: "bg-blue-50/50" },
                  { href: "/dashboard/admin/verify", icon: ShieldCheck, label: "Verify", iconClass: "text-amber-500", bgClass: "bg-amber-50/50", badge: pendingListings > 0 ? pendingListings : undefined },
                  { href: "/dashboard/admin/partners", icon: Handshake, label: "Partners", iconClass: "text-emerald-500", bgClass: "bg-emerald-50/50" },
                  { href: "/dashboard/admin/plans", icon: PieChart, label: "Plans", iconClass: "text-violet-500", bgClass: "bg-violet-50/50" },
                  { href: "/dashboard/admin/partner-earnings", icon: IndianRupee, label: "Earnings", iconClass: "text-purple-500", bgClass: "bg-purple-50/50" },
                  { href: "/dashboard/admin/partner-payouts", icon: Wallet, label: "Payouts", iconClass: "text-teal-500", bgClass: "bg-teal-50/50" },
                  { href: "/dashboard/admin/reports", icon: FileBarChart, label: "Reports", iconClass: "text-rose-500", bgClass: "bg-rose-50/50" },
                  { href: "/dashboard/admin/settings", icon: Settings, label: "Settings", iconClass: "text-neutral-500", bgClass: "bg-neutral-100/50" },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="w-full bg-white hover:bg-neutral-50 border border-neutral-100 hover:border-neutral-200 py-1.5 px-2 rounded-xl flex items-center gap-1.5 transition-all duration-150 group"
                  >
                    <div className={`p-1 rounded-md ${action.bgClass} shrink-0`}>
                      <action.icon size={11} className={action.iconClass} />
                    </div>
                    <span className="flex-1 text-[10px] font-bold text-neutral-700 group-hover:text-neutral-900 truncate">{action.label}</span>
                    {action.badge !== undefined && (
                      <span className="text-[8px] font-black bg-amber-500 text-white px-1 py-0 rounded-full leading-relaxed shrink-0">
                        {action.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white/80 backdrop-blur-md border border-neutral-200/80 rounded-2xl p-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-2.5 pb-2.5 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="text-blue-600">
                    <UserCheck size={14} />
                  </div>
                  <h2 className="text-[12px] font-extrabold text-neutral-900 uppercase tracking-wide">New Users</h2>
                </div>
                <Link href="/dashboard/admin/users" className="text-[9px] font-bold text-blue-600 hover:underline uppercase tracking-wide">
                  View all
                </Link>
              </div>
              <div className="space-y-1.5">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${
                      user.role === "OWNER" ? "bg-violet-100 text-violet-700" :
                      user.role === "ADMIN" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-neutral-800 truncate">{user.name || "—"}</p>
                    </div>
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ${
                      user.role === "OWNER" ? "bg-violet-50 text-violet-600 border border-violet-100" :
                      user.role === "ADMIN" ? "bg-red-50 text-red-600 border border-red-100" :
                      "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
                {recentUsers.length === 0 && (
                  <p className="text-[10px] text-neutral-400 text-center py-2">No users yet.</p>
                )}
              </div>
            </div>

            {/* Platform stats strip */}
            <div className="bg-neutral-950 rounded-2xl p-3.5 text-white shadow-xl relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-1.5 mb-2.5 relative">
                <BarChart3 size={13} className="text-neutral-400" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Platform Health</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 relative">
                {[
                  { label: "Approval Rate", value: totalListings > 0 ? `${Math.round((activeListings / totalListings) * 100)}%` : "—", color: "text-emerald-400" },
                  { label: "Pending", value: String(pendingListings), color: pendingListings > 0 ? "text-amber-400" : "text-emerald-400" },
                  { label: "Pro Plans", value: String(activeSubscriptions.length), color: "text-violet-400" },
                  { label: "MRR", value: `₹${(totalRevenue / 1000).toFixed(0)}k`, color: "text-blue-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-2">
                    <div className={`text-[13px] font-black ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] text-neutral-400 font-bold mt-0.5 uppercase tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700">
        <AlertCircle size={36} className="mx-auto mb-3 text-red-400" />
        <h2 className="text-lg font-bold mb-2">Dashboard Error</h2>
        <p className="text-sm text-red-600">Could not load the admin dashboard. Database connection issue or missing table.</p>
        <div className="mt-4 text-xs font-mono bg-red-100 p-3 rounded-lg text-left overflow-auto">
          {error.message || String(error)}
        </div>
      </div>
    );
  }
}
