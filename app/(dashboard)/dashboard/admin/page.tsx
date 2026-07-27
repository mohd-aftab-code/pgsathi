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
      <div className="space-y-5">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold mb-0.5">Super Admin Overview</h1>
              <p className="text-neutral-400 text-xs">{format(now, "EEEE, d MMMM yyyy")} · Platform-wide statistics</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-green-300 bg-green-400/10 border border-green-400/20 px-3 py-2 rounded-xl shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              System Online
            </div>
          </div>
        </div>

        {/* ── Stats Row ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Pending Approvals */}
          <Link
            href="/dashboard/admin/verify"
            className="group relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 shadow-sm border border-amber-200/70 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="bg-amber-100 text-amber-600 p-2.5 rounded-xl border border-amber-200/50">
                <ShieldAlert size={18} />
              </div>
              {pendingListings > 0 && (
                <span className="flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
              )}
            </div>
            <div className="text-3xl font-black text-amber-900">{pendingListings}</div>
            <div className="text-xs font-semibold text-amber-700/80 mt-0.5">Pending Approvals</div>
            <div className="mt-3 flex items-center justify-between text-xs text-amber-700 font-bold bg-white/70 px-3 py-1.5 rounded-lg">
              Verify Now <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Active PGs */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200/80 overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl border border-emerald-100">
                <Building2 size={18} />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-neutral-900">{activeListings}</div>
            <div className="text-xs font-medium text-neutral-500 mt-0.5">Active PGs</div>
            <div className="mt-2 text-[11px] text-neutral-400">{totalListings} total listings</div>
          </div>

          {/* Users */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200/80 overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100">
                <Users size={18} />
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {totalOwners} owners
              </span>
            </div>
            <div className="text-3xl font-black text-neutral-900">{totalUsers}</div>
            <div className="text-xs font-medium text-neutral-500 mt-0.5">Registered Users</div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200/80 overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-violet-50 text-violet-600 p-2.5 rounded-xl border border-violet-100">
                <BadgeIndianRupee size={18} />
              </div>
              <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                {activeSubscriptions.length} plans
              </span>
            </div>
            <div className="text-2xl font-black text-neutral-900">₹{totalRevenue.toLocaleString("en-IN")}</div>
            <div className="text-xs font-medium text-neutral-500 mt-0.5">Revenue from Pro Owners</div>
          </div>
        </div>

        {/* ── Main Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Listings table — 2/3 */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-200/80 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="bg-violet-50 text-violet-600 p-1.5 rounded-lg border border-violet-100">
                  <Building2 size={15} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">All Listings</h2>
                  <p className="text-[11px] text-neutral-400">
                    {totalListings} total · Page {page} of {totalPages || 1}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/admin/verify"
                className="text-[11px] font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-lg transition-colors border border-violet-100"
              >
                Verify Pending →
              </Link>
            </div>

            {/* Compact table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-50/80 border-b border-neutral-100">
                    <th className="px-5 py-2.5 font-bold">PG Name</th>
                    <th className="px-3 py-2.5 font-bold">Owner</th>
                    <th className="px-3 py-2.5 font-bold">City</th>
                    <th className="px-3 py-2.5 font-bold">Status</th>
                    <th className="px-3 py-2.5 font-bold text-right">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {recentListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-neutral-50/70 transition-colors group">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                            listing.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : listing.status === "PENDING"
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : "bg-neutral-100 text-neutral-400"
                          }`}>
                            {listing.status === "ACTIVE" ? <CheckCircle2 size={14} /> : listing.status === "PENDING" ? <Clock size={14} /> : <AlertCircle size={14} />}
                          </div>
                          <span className="font-semibold text-neutral-800 text-xs line-clamp-1 group-hover:text-violet-700 transition-colors">
                            {listing.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-neutral-500 max-w-[100px]">
                        <span className="truncate block">{listing.owner?.name ?? "—"}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-violet-600 font-medium">
                        {listing.city?.name ?? "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 uppercase tracking-wider ${
                          listing.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : listing.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-neutral-100 text-neutral-500"
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            listing.status === "ACTIVE" ? "bg-emerald-500" :
                            listing.status === "PENDING" ? "bg-amber-500" : "bg-neutral-400"
                          }`} />
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-neutral-400 text-right whitespace-nowrap">
                        {formatDistanceToNow(listing.createdAt, { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                  {recentListings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-neutral-400 text-sm">
                        No listings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 bg-neutral-50/50">
                <span className="text-[11px] text-neutral-400 font-medium">
                  Showing {skip + 1}–{Math.min(skip + PAGE_SIZE, totalListings)} of {totalListings}
                </span>
                <div className="flex items-center gap-1.5">
                  {/* Prev */}
                  {page > 1 ? (
                    <Link
                      href={`?page=${page - 1}`}
                      className="flex items-center gap-1 text-xs font-bold text-neutral-600 hover:text-violet-700 bg-white hover:bg-violet-50 border border-neutral-200 hover:border-violet-200 px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      <ChevronLeft size={13} /> Prev
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-neutral-300 bg-neutral-50 border border-neutral-100 px-2.5 py-1.5 rounded-lg cursor-not-allowed">
                      <ChevronLeft size={13} /> Prev
                    </span>
                  )}

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let p: number;
                      if (totalPages <= 5) {
                        p = i + 1;
                      } else if (page <= 3) {
                        p = i + 1;
                      } else if (page >= totalPages - 2) {
                        p = totalPages - 4 + i;
                      } else {
                        p = page - 2 + i;
                      }
                      return (
                        <Link
                          key={p}
                          href={`?page=${p}`}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                            p === page
                              ? "bg-violet-600 text-white shadow-sm"
                              : "text-neutral-500 hover:bg-violet-50 hover:text-violet-700 border border-neutral-200 hover:border-violet-200 bg-white"
                          }`}
                        >
                          {p}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Next */}
                  {page < totalPages ? (
                    <Link
                      href={`?page=${page + 1}`}
                      className="flex items-center gap-1 text-xs font-bold text-neutral-600 hover:text-violet-700 bg-white hover:bg-violet-50 border border-neutral-200 hover:border-violet-200 px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Next <ChevronRight size={13} />
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-neutral-300 bg-neutral-50 border border-neutral-100 px-2.5 py-1.5 rounded-lg cursor-not-allowed">
                      Next <ChevronRight size={13} />
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Quick Actions */}
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-100">
                <div className="bg-violet-50 p-1.5 rounded-lg border border-violet-100">
                  <Zap size={14} className="text-violet-600" />
                </div>
                <h2 className="text-sm font-bold text-neutral-900">Quick Actions</h2>
              </div>
              <div className="space-y-1.5">
                {[
                  { href: "/dashboard/admin/users", icon: Users, label: "Manage Users", iconClass: "text-blue-600", bgClass: "bg-blue-50 border-blue-100" },
                  { href: "/dashboard/admin/verify", icon: ShieldCheck, label: "Verify Listings", iconClass: "text-amber-600", bgClass: "bg-amber-50 border-amber-100", badge: pendingListings > 0 ? pendingListings : undefined },
                  { href: "/dashboard/admin/partners", icon: Handshake, label: "Partners", iconClass: "text-emerald-600", bgClass: "bg-emerald-50 border-emerald-100" },
                  { href: "/dashboard/admin/plans", icon: PieChart, label: "Manage Plans", iconClass: "text-violet-600", bgClass: "bg-violet-50 border-violet-100" },
                  { href: "/dashboard/admin/partner-earnings", icon: IndianRupee, label: "Partner Earnings", iconClass: "text-purple-600", bgClass: "bg-purple-50 border-purple-100" },
                  { href: "/dashboard/admin/partner-payouts", icon: Wallet, label: "Partner Payouts", iconClass: "text-teal-600", bgClass: "bg-teal-50 border-teal-100" },
                  { href: "/dashboard/admin/reports", icon: FileBarChart, label: "Financial Reports", iconClass: "text-rose-600", bgClass: "bg-rose-50 border-rose-100" },
                  { href: "/dashboard/admin/audit-logs", icon: Activity, label: "Audit Logs", iconClass: "text-orange-600", bgClass: "bg-orange-50 border-orange-100" },
                  { href: "/dashboard/admin/settings", icon: Settings, label: "System Settings", iconClass: "text-neutral-600", bgClass: "bg-neutral-100 border-neutral-200" },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="w-full bg-neutral-50/80 hover:bg-violet-50 hover:border-violet-200 border border-neutral-100 py-2.5 px-3 rounded-xl flex items-center gap-2.5 transition-all duration-150 group"
                  >
                    <div className={`p-1.5 rounded-lg border ${action.bgClass} shrink-0`}>
                      <action.icon size={13} className={action.iconClass} />
                    </div>
                    <span className="flex-1 text-xs font-semibold text-neutral-700 group-hover:text-violet-800">{action.label}</span>
                    {action.badge !== undefined && (
                      <span className="text-[9px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                        {action.badge}
                      </span>
                    )}
                    <ArrowRight size={12} className="text-neutral-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100">
                    <UserCheck size={14} className="text-blue-600" />
                  </div>
                  <h2 className="text-sm font-bold text-neutral-900">New Users</h2>
                </div>
                <Link href="/dashboard/admin/users" className="text-[11px] font-bold text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-2.5">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      user.role === "OWNER" ? "bg-violet-100 text-violet-700" :
                      user.role === "ADMIN" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-neutral-800 truncate">{user.name || "—"}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0 ${
                      user.role === "OWNER" ? "bg-violet-50 text-violet-600 border border-violet-100" :
                      user.role === "ADMIN" ? "bg-red-50 text-red-600 border border-red-100" :
                      "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
                {recentUsers.length === 0 && (
                  <p className="text-xs text-neutral-400 text-center py-3">No users yet.</p>
                )}
              </div>
            </div>

            {/* Platform stats strip */}
            <div className="bg-neutral-900 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-1.5 mb-3">
                <BarChart3 size={13} className="text-neutral-400" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Platform Health</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Approval Rate", value: totalListings > 0 ? `${Math.round((activeListings / totalListings) * 100)}%` : "—", color: "text-emerald-400" },
                  { label: "Pending Queue", value: String(pendingListings), color: pendingListings > 0 ? "text-amber-400" : "text-emerald-400" },
                  { label: "Pro Plans", value: String(activeSubscriptions.length), color: "text-violet-400" },
                  { label: "MRR", value: `₹${(totalRevenue / 1000).toFixed(0)}k`, color: "text-blue-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/8 rounded-xl px-3 py-2.5">
                    <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-neutral-500 font-medium mt-0.5">{s.label}</div>
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
