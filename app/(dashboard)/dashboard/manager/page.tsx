import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  Users,
  Wallet,
  Wrench,
  BellRing,
  ArrowRight,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { requireManagerAccess } from "@/lib/manager-auth";
import { currentMonth } from "@/lib/manage-utils";

export default async function ManagerDashboardPage() {
  const { userId: ownerId, name: managerName, managerRole, isOwner } = await requireManagerAccess();

  const forMonth = currentMonth();

  // Fetch relevant data for manager
  const [
    activeTenants,
    pendingComplaints,
    pendingPayments,
    recentTenants,
    openComplaints,
    tenantsWithDues,
  ] = await Promise.all([
    db.pgTenant.count({
      where: { ownerId, status: "ACTIVE" },
    }),
    db.pgComplaint.count({
      where: { ownerId, status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
    db.pgRentBill.count({
      where: {
        ownerId,
        payments: { none: {} },
      },
    }),
    db.pgTenant.findMany({
      where: { ownerId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        listing: { select: { title: true } },
        room: { select: { name: true } },
      },
    }),
    db.pgComplaint.findMany({
      where: { ownerId, status: { in: ["OPEN", "IN_PROGRESS"] } },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        listing: { select: { title: true } },
      },
    }),
    db.pgTenant.findMany({
      where: { ownerId, status: "ACTIVE", deletedAt: null, monthlyRent: { gt: 0 } },
      select: {
        monthlyRent: true,
        payments: { where: { type: "RENT", forMonth, voided: false }, select: { amount: true } },
      },
    }),
  ]);

  const pendingRemindersCount = tenantsWithDues.filter(
    (t) => t.monthlyRent - t.payments.reduce((s, p) => s + p.amount, 0) > 0
  ).length;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* ── CRM Style Header ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            Welcome back, {managerName}
          </h1>
          <p className="text-sm text-neutral-500 mt-1 flex items-center gap-2">
            <Building2 size={14} className="text-neutral-400" />
            <span className="font-medium text-neutral-700">{managerRole}</span> — PG Management Workspace
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/manager/tenants/new" className="btn-primary py-2 px-4 text-sm font-semibold rounded-lg shadow-sm">
            + Add Tenant
          </Link>
          <Link href="/dashboard/manager/complaints/new" className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 py-2 px-4 text-sm font-semibold rounded-lg shadow-sm transition-colors">
            Log Issue
          </Link>
        </div>
      </div>

      {/* ── CRM Key Metrics ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Tenants", value: activeTenants, icon: Users, color: "text-violet-600", bg: "bg-violet-50", link: "/dashboard/manager/tenants" },
          { label: "Open Issues", value: pendingComplaints, icon: Wrench, color: "text-orange-600", bg: "bg-orange-50", link: "/dashboard/manager/complaints" },
          { label: "Pending Bills", value: pendingPayments, icon: Wallet, color: "text-red-600", bg: "bg-red-50", link: "/dashboard/manager/billing" },
          { label: "Reminders", value: pendingRemindersCount, icon: BellRing, color: "text-blue-600", bg: "bg-blue-50", link: "/dashboard/manager/reminders" },
        ].map((stat, i) => (
          <Link key={i} href={stat.link} className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-violet-200 transition-all duration-300 group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-neutral-500 group-hover:text-neutral-700 transition-colors">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon size={16} className={stat.color} />
              </div>
            </div>
            <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
          </Link>
        ))}
      </div>

      {/* ── Role-Based Blur UI: Revenue (Owner-Only) ───────────────── */}
      <div className="relative rounded-3xl border border-neutral-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-violet-600" />
            <h2 className="font-bold text-neutral-900 text-sm">Revenue & Analytics</h2>
          </div>
          {!isOwner && (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock size={10} /> Owner Only
            </span>
          )}
        </div>
        {/* Content (always rendered — just blurred for non-owners) */}
        <div className={`p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 ${!isOwner ? "blur-sm select-none pointer-events-none" : ""}`}>
          {[
            { label: "Rent Collected", value: "₹1,24,500", trend: "+12%", color: "text-green-600", bg: "bg-green-50" },
            { label: "Pending Dues", value: "₹18,000", trend: "-3%", color: "text-red-600", bg: "bg-red-50" },
            { label: "Expenses", value: "₹32,800", trend: "+8%", color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Net Profit", value: "₹72,700", trend: "+15%", color: "text-violet-600", bg: "bg-violet-50" },
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-xl ${item.bg}`}>
              <div className="text-xs font-semibold text-neutral-500 mb-1">{item.label}</div>
              <div className={`text-xl font-extrabold ${item.color}`}>{item.value}</div>
              <div className={`text-xs font-bold mt-1 ${item.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>{item.trend} vs last month</div>
            </div>
          ))}
        </div>
        {/* Blur overlay with unlock CTA for non-owners */}
        {!isOwner && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md z-10">
            <div className="text-center px-6">
              <div className="w-12 h-12 bg-amber-100 border-2 border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Lock size={22} className="text-amber-600" />
              </div>
              <p className="font-bold text-neutral-800 mb-1">Owner Access Required</p>
              <p className="text-xs text-neutral-500">Revenue data is only visible to the PG Owner. Contact your owner for financial reports.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Recent Tenants (CRM Table Style) ───────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
            <h2 className="font-semibold text-neutral-800 flex items-center gap-2 text-sm">
              <Users size={16} className="text-neutral-500" />
              Recently Onboarded Tenants
            </h2>
            <Link href="/dashboard/manager/tenants" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
              View All
            </Link>
          </div>

          <div className="flex-1 p-0">
            {recentTenants.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-neutral-500">No active tenants found.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase border-b border-neutral-100">
                  <tr>
                    <th className="px-5 py-3 font-medium">Tenant</th>
                    <th className="px-5 py-3 font-medium">Property & Room</th>
                    <th className="px-5 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {recentTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {t.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-neutral-800">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-neutral-600">
                        {t.listing?.title} {t.room ? <span className="text-neutral-400">({t.room.name})</span> : ""}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-100">
                          <CheckCircle2 size={10} /> ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Open Complaints (CRM Feed Style) ──────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
            <h2 className="font-semibold text-neutral-800 flex items-center gap-2 text-sm">
              <Wrench size={16} className="text-neutral-500" />
              Action Items
            </h2>
            <Link href="/dashboard/manager/complaints" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
              View All
            </Link>
          </div>

          <div className="p-4 flex-1">
            {openComplaints.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 size={24} className="mx-auto text-green-400 mb-2" />
                <p className="text-xs text-neutral-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {openComplaints.map((c) => {
                  const isUrgent = c.priority === "URGENT" || c.priority === "HIGH";
                  return (
                    <div key={c.id} className="flex gap-3">
                      <div className="mt-0.5 relative">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${isUrgent ? 'bg-red-500' : 'bg-orange-400'}`} />
                        <div className="absolute top-4 left-1 w-px h-full bg-neutral-200 -z-10" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-800 line-clamp-1">{c.title}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{c.listing?.title}</p>
                        <p className="text-[10px] font-medium text-neutral-400 mt-1 uppercase">
                          {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
