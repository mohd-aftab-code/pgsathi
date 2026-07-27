import { db } from "@/lib/db";
import {
  Users, Building2, ShieldAlert, BadgeIndianRupee, TrendingUp, Activity,
  ArrowRight, CheckCircle2, FileBarChart, ShieldCheck, Handshake, PieChart,
  IndianRupee, Wallet, Settings, Eye, AlertCircle, Clock, Zap,
  BarChart3, UserCheck, XCircle,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

export default async function AdminDashboardPage() {
  try {
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
        take: 6,
        where: { cityId: { gt: 0 } },
        orderBy: { createdAt: "desc" },
        include: { owner: { select: { name: true } }, city: true },
      }),
      db.user.count({ where: { role: "OWNER" } }),
      db.user.findMany({
        take: 4,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
    ]);

    // Calculate real revenue from active subscriptions
    const totalRevenue = activeSubscriptions.reduce((acc, sub) => acc + sub.amount, 0);
    const inactiveListings = totalListings - activeListings - pendingListings;

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    return (
      <div className="space-y-8">

        {/* ── Premium Hero Header ───────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900 via-violet-800 to-purple-900 p-6 sm:p-8 text-white shadow-2xl">
          {/* Decorative blobs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-8 right-32 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-violet-300 text-sm font-semibold mb-1">{greeting} 👋</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                Super Admin Overview
              </h1>
              <p className="text-violet-200 text-sm max-w-md">
                Platform-wide statistics, revenue insights, and pending actions — all in one place.
              </p>
              <p className="text-violet-300/70 text-xs mt-2 font-medium">
                {format(now, "EEEE, d MMMM yyyy • h:mm a")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-4 py-2.5 rounded-2xl backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                System Online
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-violet-200 bg-white/10 border border-white/15 px-4 py-2.5 rounded-2xl backdrop-blur-sm">
                <Activity size={15} className="text-violet-300" />
                {activeSubscriptions.length} Active Plans
              </div>
            </div>
          </div>

          {/* Mini stat strip */}
          <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total PGs", value: totalListings, color: "text-white" },
              { label: "Active PGs", value: activeListings, color: "text-emerald-300" },
              { label: "Pending", value: pendingListings, color: "text-amber-300" },
              { label: "Total Users", value: totalUsers, color: "text-violet-200" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 border border-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm">
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-violet-300/80 font-semibold mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── KPI Stats Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Pending Approvals — highlighted urgency card */}
          <Link
            href="/dashboard/admin/verify"
            className="group relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-3xl p-5 sm:p-6 shadow-sm border border-amber-200/70 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-amber-200/40 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl border border-amber-200/50 shadow-sm group-hover:scale-110 transition-transform">
                  <ShieldAlert size={22} />
                </div>
                {pendingListings > 0 && (
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                  </span>
                )}
              </div>
              <div className="text-4xl font-black text-amber-900 mb-1">{pendingListings}</div>
              <div className="text-sm font-bold text-amber-700/80 mb-4">Pending Approvals</div>
              <div className="flex items-center justify-between text-sm text-amber-700 font-bold bg-white/70 hover:bg-white px-4 py-2 rounded-xl transition-colors border border-amber-200/40">
                Verify Now <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Active PGs */}
          <div className="group relative bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-neutral-200/80 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-emerald-100/60 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl border border-emerald-100 group-hover:scale-110 transition-transform">
                  <Building2 size={22} />
                </div>
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <div className="text-4xl font-black text-neutral-900 mb-1">{activeListings}</div>
              <div className="text-sm font-medium text-neutral-500 mb-1">Active PGs</div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <CheckCircle2 size={11} /> {activeListings} live
                </span>
                <span>of {totalListings} total</span>
              </div>
            </div>
          </div>

          {/* Total Users */}
          <div className="group relative bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-neutral-200/80 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-blue-100/60 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl border border-blue-100 group-hover:scale-110 transition-transform">
                  <Users size={22} />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {totalOwners} owners
                  </span>
                </div>
              </div>
              <div className="text-4xl font-black text-neutral-900 mb-1">{totalUsers}</div>
              <div className="text-sm font-medium text-neutral-500">Total Registered Users</div>
            </div>
          </div>

          {/* Revenue */}
          <div className="group relative bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-neutral-200/80 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-violet-100/60 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-violet-50 text-violet-600 p-3 rounded-2xl border border-violet-100 group-hover:scale-110 transition-transform">
                  <BadgeIndianRupee size={22} />
                </div>
                <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                  {activeSubscriptions.length} plans
                </span>
              </div>
              <div className="text-3xl font-black text-neutral-900 mb-1">₹{totalRevenue.toLocaleString("en-IN")}</div>
              <div className="text-sm font-medium text-neutral-500">Revenue from Pro Owners</div>
            </div>
          </div>
        </div>

        {/* ── Main Content Grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Listings — 2/3 width */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-neutral-200/80 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="bg-violet-50 text-violet-600 p-2 rounded-xl border border-violet-100">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900">Recently Added PGs</h2>
                  <p className="text-xs text-neutral-400 font-medium">Latest listings on the platform</p>
                </div>
              </div>
              <Link
                href="/dashboard/admin/verify"
                className="text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-xl transition-colors border border-violet-100"
              >
                Verify Pending →
              </Link>
            </div>

            <div className="divide-y divide-neutral-50">
              {recentListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50/70 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      listing.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : listing.status === "PENDING"
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : "bg-neutral-100 text-neutral-400 border border-neutral-200"
                    }`}>
                      {listing.status === "ACTIVE" ? (
                        <CheckCircle2 size={20} />
                      ) : listing.status === "PENDING" ? (
                        <Clock size={20} />
                      ) : (
                        <XCircle size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-neutral-900 text-sm truncate group-hover:text-violet-700 transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-neutral-400 font-medium mt-0.5 truncate">
                        by <span className="text-neutral-600">{listing.owner?.name}</span>
                        {" · "}
                        <span className="text-violet-500">{listing.city?.name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 uppercase tracking-wider mb-1 ${
                      listing.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : listing.status === "PENDING"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                    }`}>
                      {listing.status === "ACTIVE" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />}
                      {listing.status === "PENDING" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />}
                      {listing.status}
                    </div>
                    <div className="text-[11px] font-medium text-neutral-400 block">
                      {formatDistanceToNow(listing.createdAt, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
              {recentListings.length === 0 && (
                <div className="text-center py-12 text-neutral-400 font-medium">
                  <Building2 size={32} className="mx-auto mb-3 opacity-30" />
                  No listings yet.
                </div>
              )}
            </div>
          </div>

          {/* Right column — Quick Actions + Recent Users */}
          <div className="flex flex-col gap-6">

            {/* Quick Actions */}
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-neutral-100">
                <div className="bg-violet-50 p-2 rounded-xl border border-violet-100">
                  <Zap size={16} className="text-violet-600" />
                </div>
                <h2 className="text-base font-bold text-neutral-900">Quick Actions</h2>
              </div>

              <div className="space-y-2.5">
                {[
                  { href: "/dashboard/admin/users", icon: Users, label: "Manage Users", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
                  { href: "/dashboard/admin/verify", icon: ShieldCheck, label: "Verify Listings", color: "text-amber-600", bg: "bg-amber-50 border-amber-100", badge: pendingListings > 0 ? pendingListings : undefined },
                  { href: "/dashboard/admin/partners", icon: Handshake, label: "Partners", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                  { href: "/dashboard/admin/plans", icon: PieChart, label: "Manage Plans", color: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
                  { href: "/dashboard/admin/partner-earnings", icon: IndianRupee, label: "Partner Earnings", color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
                  { href: "/dashboard/admin/reports", icon: FileBarChart, label: "Financial Reports", color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
                  { href: "/dashboard/admin/settings", icon: Settings, label: "System Settings", color: "text-neutral-600", bg: "bg-neutral-50 border-neutral-200" },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="w-full bg-neutral-50/80 hover:bg-violet-50 hover:border-violet-200 border border-neutral-200/70 py-3 px-4 rounded-2xl flex items-center gap-3 transition-all duration-200 group"
                  >
                    <div className={`p-2 rounded-xl border ${action.bg} group-hover:scale-110 transition-transform shrink-0`}>
                      <action.icon size={16} className={action.color} />
                    </div>
                    <span className="flex-1 text-sm font-semibold text-neutral-700 group-hover:text-violet-800">{action.label}</span>
                    {action.badge !== undefined && (
                      <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                        {action.badge}
                      </span>
                    )}
                    <ArrowRight size={14} className="text-neutral-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
                    <UserCheck size={16} className="text-blue-600" />
                  </div>
                  <h2 className="text-base font-bold text-neutral-900">New Users</h2>
                </div>
                <Link href="/dashboard/admin/users" className="text-xs font-bold text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      user.role === "OWNER" ? "bg-violet-100 text-violet-700" :
                      user.role === "ADMIN" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-800 truncate">{user.name || "—"}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      user.role === "OWNER" ? "bg-violet-50 text-violet-600 border border-violet-100" :
                      user.role === "ADMIN" ? "bg-red-50 text-red-600 border border-red-100" :
                      "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
                {recentUsers.length === 0 && (
                  <p className="text-sm text-neutral-400 text-center py-4">No users yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Platform Health Strip ─────────────────────────────────── */}
        <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-violet-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-32 bg-violet-400/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={18} className="text-violet-300" />
              <h2 className="text-sm font-bold text-violet-100 uppercase tracking-wider">Platform Health</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Approval Rate",
                  value: totalListings > 0 ? `${Math.round((activeListings / totalListings) * 100)}%` : "—",
                  sub: `${activeListings} approved`,
                  icon: CheckCircle2,
                  color: "text-emerald-300",
                },
                {
                  label: "Pending Queue",
                  value: String(pendingListings),
                  sub: pendingListings > 0 ? "Needs review" : "Queue clear ✓",
                  icon: Clock,
                  color: "text-amber-300",
                },
                {
                  label: "Pro Subscribers",
                  value: String(activeSubscriptions.length),
                  sub: `₹${totalRevenue.toLocaleString("en-IN")} MRR`,
                  icon: IndianRupee,
                  color: "text-violet-300",
                },
                {
                  label: "Inactive PGs",
                  value: String(inactiveListings),
                  sub: "Not published",
                  icon: AlertCircle,
                  color: "text-rose-300",
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/8 border border-white/10 rounded-2xl px-4 py-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon size={14} className={stat.color} />
                    <span className="text-[11px] text-violet-300/70 font-semibold uppercase tracking-wide">{stat.label}</span>
                  </div>
                  <div className={`text-2xl font-black mb-0.5 ${stat.color}`}>{stat.value}</div>
                  <div className="text-[11px] text-violet-300/60 font-medium">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-3xl text-red-700">
        <AlertCircle size={40} className="mx-auto mb-4 text-red-400" />
        <h2 className="text-xl font-bold mb-2">Dashboard Error</h2>
        <p className="text-sm text-red-600">Could not load the admin dashboard. This is likely due to a database connection issue or missing table.</p>
        <div className="mt-4 text-xs font-mono bg-red-100 p-4 rounded-xl text-left overflow-auto">
          {error.message || String(error)}
        </div>
      </div>
    );
  }
}
