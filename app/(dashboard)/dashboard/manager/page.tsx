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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function ManagerDashboardPage() {
  const session = await auth();
  const ownerId = (session?.user as any)?.ownerId as number;
  const managerName = session?.user?.name || "Manager";
  const managerRole = (session?.user as any)?.managerRole as string;

  // Fetch relevant data for manager
  const [
    activeTenants,
    pendingComplaints,
    pendingPayments,
    recentTenants,
    openComplaints,
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
  ]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      {/* ── Welcome Banner ──────────────────────────────────── */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-violet-200 text-sm font-medium">{greeting},</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">
            {managerName} 👋
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold">
              <Building2 size={12} />
              {managerRole} — PGSathi Manager
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {/* Active Tenants */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-violet-50 rounded-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Active Tenants
            </p>
            <div className="w-9 h-9 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-neutral-900">{activeTenants}</p>
          <Link
            href="/dashboard/manager/tenants"
            className="mt-2 inline-flex items-center gap-1 text-xs text-violet-600 font-semibold hover:underline"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {/* Open Complaints */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-orange-50 rounded-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Open Issues
            </p>
            <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
              <Wrench size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-neutral-900">{pendingComplaints}</p>
          <Link
            href="/dashboard/manager/complaints"
            className="mt-2 inline-flex items-center gap-1 text-xs text-orange-600 font-semibold hover:underline"
          >
            Resolve <ArrowRight size={12} />
          </Link>
        </div>

        {/* Pending Bills */}
        <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-50 rounded-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Pending Bills
            </p>
            <div className="w-9 h-9 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-neutral-900">{pendingPayments}</p>
          <Link
            href="/dashboard/manager/billing"
            className="mt-2 inline-flex items-center gap-1 text-xs text-green-600 font-semibold hover:underline"
          >
            View bills <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            href: "/dashboard/manager/tenants",
            icon: Users,
            label: "Add Tenant",
            color: "bg-violet-600 hover:bg-violet-700",
          },
          {
            href: "/dashboard/manager/payments",
            icon: Wallet,
            label: "Record Payment",
            color: "bg-green-600 hover:bg-green-700",
          },
          {
            href: "/dashboard/manager/complaints",
            icon: Wrench,
            label: "New Complaint",
            color: "bg-orange-500 hover:bg-orange-600",
          },
          {
            href: "/dashboard/manager/reminders",
            icon: BellRing,
            label: "Set Reminder",
            color: "bg-indigo-600 hover:bg-indigo-700",
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`${action.color} text-white flex flex-col items-center justify-center gap-2 rounded-2xl p-4 text-sm font-semibold transition-all hover:shadow-lg active:scale-95`}
            >
              <Icon size={22} />
              <span className="text-center text-xs leading-tight">{action.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Recent Tenants ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
            <h2 className="font-bold text-neutral-900 flex items-center gap-2">
              <Users size={16} className="text-violet-600" />
              Recent Tenants
            </h2>
            <Link
              href="/dashboard/manager/tenants"
              className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentTenants.length === 0 ? (
            <div className="text-center py-8">
              <Users size={32} className="mx-auto text-neutral-300 mb-2" />
              <p className="text-sm text-neutral-400">No active tenants yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTenants.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800 truncate">
                      {t.name}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      {t.listing?.title} {t.room ? `· ${t.room.name}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <CheckCircle2 size={13} className="text-green-500" />
                    <span className="text-xs font-medium text-green-600">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Open Complaints ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
            <h2 className="font-bold text-neutral-900 flex items-center gap-2">
              <Wrench size={16} className="text-orange-500" />
              Open Complaints
            </h2>
            <Link
              href="/dashboard/manager/complaints"
              className="text-xs font-bold text-orange-500 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {openComplaints.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 size={32} className="mx-auto text-green-300 mb-2" />
              <p className="text-sm text-green-600 font-medium">
                No open complaints!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {openComplaints.map((c) => {
                const priorityColors: Record<string, string> = {
                  URGENT: "bg-red-100 text-red-700",
                  HIGH:   "bg-orange-100 text-orange-700",
                  MEDIUM: "bg-yellow-100 text-yellow-700",
                  LOW:    "bg-neutral-100 text-neutral-600",
                };
                const statusIcons: Record<string, React.ReactNode> = {
                  OPEN:        <AlertCircle size={13} className="text-red-500" />,
                  IN_PROGRESS: <Clock size={13} className="text-yellow-500" />,
                };
                return (
                  <div
                    key={c.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors"
                  >
                    <div className="mt-0.5">
                      {statusIcons[c.status] || <AlertCircle size={13} className="text-neutral-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-800 truncate">
                        {c.title}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {c.listing?.title}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {formatDistanceToNow(new Date(c.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${priorityColors[c.priority] ?? priorityColors.LOW}`}
                    >
                      {c.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
