import { db } from "@/lib/db";
import Link from "next/link";
import {
  Users,
  Wallet,
  Wrench,
  BedDouble,
  CheckCircle2,
  Lock,
  TrendingUp,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

import { requireManagerAccess } from "@/lib/manager-auth";
import { currentMonth, formatMonth, formatINR, initials } from "@/lib/manage-utils";
import { buildRentReminderLink } from "@/lib/whatsapp-reminder";
import { RevenueTrendChart } from "@/components/manage/RevenueTrendChart";
import { LiveTime } from "@/components/manage/LiveTime";
import { PropertyFilterSelect } from "@/components/manage/PropertyFilterSelect";

export default async function ManagerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ listingId?: string }>;
}) {
  const { userId: ownerId, name: managerName, isOwner, allowedListingIds } = await requireManagerAccess();
  const sp = await searchParams;
  const listingId = sp.listingId ? parseInt(sp.listingId) : undefined;

  const ownerListings = await db.listing.findMany({
    where: { ownerId },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  // Per-property filters — applied when a specific PG is chosen from the dropdown
  const listingFilter = listingId ? { listingId } : {};
  const bedListingWhere = listingId ? { ownerId, id: listingId } : { ownerId };

  const forMonth = currentMonth();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    activeTenants,
    newTenantsThisMonth,
    pendingComplaints,
    openComplaints,
    tenantsWithDues,
    totalBeds,
    occupiedBeds,
    payments6mo,
    expenses6mo,
  ] = await Promise.all([
    db.pgTenant.count({ where: { ownerId, status: "ACTIVE", ...listingFilter } }),
    db.pgTenant.count({ where: { ownerId, status: "ACTIVE", createdAt: { gte: monthStart }, ...listingFilter } }),
    db.pgComplaint.count({ where: { ownerId, status: { in: ["OPEN", "IN_PROGRESS"] }, ...listingFilter } }),
    db.pgComplaint.findMany({
      where: { ownerId, status: { in: ["OPEN", "IN_PROGRESS"] }, ...listingFilter },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { listing: { select: { title: true } } },
    }),
    db.pgTenant.findMany({
      where: { ownerId, status: "ACTIVE", deletedAt: null, monthlyRent: { gt: 0 }, ...listingFilter },
      select: {
        id: true,
        name: true,
        phone: true,
        monthlyRent: true,
        listing: { select: { title: true } },
        payments: { where: { type: "RENT", forMonth, voided: false }, select: { amount: true } },
      },
    }),
    db.bed.count({ where: { room: { listing: bedListingWhere } } }),
    db.bed.count({ where: { room: { listing: bedListingWhere }, isOccupied: true } }),
    db.pgPayment.findMany({
      where: { ownerId, voided: false, paidOn: { gte: sixMonthsStart }, ...(listingId ? { tenant: { listingId } } : {}) },
      select: { amount: true, paidOn: true },
    }),
    db.pgExpense.findMany({
      where: { ownerId, spentOn: { gte: sixMonthsStart }, ...(listingId ? { listingId } : {}) },
      select: { amount: true, spentOn: true },
    }),
  ]);

  // ── 6-month trend buckets (income vs expense) ─────────────────────────
  const months: { key: string; label: string; income: number; expense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: format(d, "MMM"), income: 0, expense: 0 });
  }
  const bucketIdx = new Map(months.map((m, i) => [m.key, i]));
  for (const p of payments6mo) {
    const d = new Date(p.paidOn);
    const i = bucketIdx.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) months[i].income += p.amount;
  }
  for (const e of expenses6mo) {
    const d = new Date(e.spentOn);
    const i = bucketIdx.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) months[i].expense += e.amount;
  }
  const trendData = months.map((m) => ({ month: m.label, income: m.income, expense: m.expense }));

  const thisMonthIncome = months[5].income;
  const thisMonthExpense = months[5].expense;

  // ── Rent collection (this month, rent-specific) ───────────────────────
  const pending = tenantsWithDues
    .map((t) => {
      const paid = t.payments.reduce((s, p) => s + p.amount, 0);
      return { ...t, paid, due: Math.max(0, t.monthlyRent - paid) };
    })
    .filter((t) => t.due > 0)
    .sort((a, b) => b.due - a.due);

  const expectedRent = tenantsWithDues.reduce((s, t) => s + t.monthlyRent, 0);
  const collectedRent = tenantsWithDues.reduce(
    (s, t) => s + t.payments.reduce((ps, p) => ps + p.amount, 0),
    0
  );
  const totalPendingDues = Math.max(0, expectedRent - collectedRent);
  const collectionPct = expectedRent > 0 ? Math.round((collectedRent / expectedRent) * 100) : 0;
  const pendingCount = pending.length;

  const occupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : null;

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayStr = format(now, "EEEE, d MMM yyyy");

  const tone: Record<string, { bg: string; text: string; bar: string }> = {
    violet: { bg: "bg-violet-50", text: "text-violet-600", bar: "bg-violet-500" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", bar: "bg-blue-500" },
    red: { bg: "bg-red-50", text: "text-red-600", bar: "bg-red-500" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", bar: "bg-orange-500" },
  };

  const kpis = [
    {
      label: "Active Tenants",
      value: String(activeTenants),
      sub: newTenantsThisMonth > 0 ? `+${newTenantsThisMonth} new this month` : "No new joins this month",
      icon: Users,
      color: "violet",
      href: "/dashboard/manager/tenants",
      bar: null as number | null,
    },
    {
      label: "Occupancy",
      value: occupancyPct !== null ? `${occupancyPct}%` : "—",
      sub: totalBeds > 0 ? `${occupiedBeds}/${totalBeds} beds filled` : "Set up rooms & beds",
      icon: BedDouble,
      color: "blue",
      href: "/dashboard/manager/rooms",
      bar: occupancyPct,
    },
    {
      label: "Rent Pending",
      value: formatINR(totalPendingDues),
      sub: `${pendingCount} tenant${pendingCount === 1 ? "" : "s"} pending`,
      icon: Wallet,
      color: "red",
      href: "/dashboard/manager/reminders",
      bar: null as number | null,
    },
    {
      label: "Open Issues",
      value: String(pendingComplaints),
      sub: pendingComplaints > 0 ? "Needs attention" : "All resolved 🎉",
      icon: Wrench,
      color: "orange",
      href: "/dashboard/manager/complaints",
      bar: null as number | null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-200/60">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            {greeting}, {managerName} 👋
          </h1>
          <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1.5">
            {todayStr} <LiveTime />
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <PropertyFilterSelect listings={ownerListings} value={listingId} className="input-base text-sm w-44 cursor-pointer bg-white/60 backdrop-blur-md" />
          <Link href="/dashboard/manager/tenants/new" className="btn-primary py-2 px-4 text-sm font-semibold rounded-2xl shadow-sm">
            + Add Tenant
          </Link>
          <Link href="/dashboard/manager/complaints/new" className="bg-white/60 backdrop-blur-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 py-2 px-4 text-sm font-semibold rounded-2xl shadow-sm transition-colors">
            Log Issue
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => {
          const t = tone[k.color];
          return (
            <Link
              key={k.label}
              href={k.href}
              className="bg-white/70 backdrop-blur-md rounded-2xl p-3.5 border border-neutral-200/50 shadow-sm hover:shadow hover:-translate-y-0.5 hover:border-violet-200/80 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-2.5 gap-2">
                <span className="text-[10px] font-extrabold text-neutral-500 group-hover:text-neutral-700 transition-colors uppercase tracking-wider">{k.label}</span>
                <div className={`p-1.5 rounded-2xl shrink-0 ${t.bg}`}>
                  <k.icon size={13} className={t.text} />
                </div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-black text-neutral-900 truncate tracking-tight">{k.value}</div>
                {k.bar !== null && (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                    <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${Math.min(100, k.bar)}%` }} />
                  </div>
                )}
                <div className="text-[10px] text-neutral-400 mt-1.5 font-medium line-clamp-1">{k.sub}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Revenue & Analytics (Owner-Only) ───────────────────── */}
      {/* ── Revenue & Analytics (Owner-Only) ───────────────────── */}
      <div className="relative rounded-2xl border border-neutral-200/60 bg-white/60 backdrop-blur-md shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-violet-600" />
            <h2 className="font-extrabold text-neutral-900 text-[13px] uppercase tracking-wide">Revenue & Analytics</h2>
            <span className="text-[10px] text-neutral-400 font-bold">· {formatMonth(forMonth)}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Collected</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> Expenses</span>
            </div>
            {!isOwner && (
              <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-xl uppercase tracking-wider flex items-center gap-1">
                <Lock size={10} /> Owner Only
              </span>
            )}
          </div>
        </div>

        <div className={`p-4 ${!isOwner ? "blur-sm select-none pointer-events-none" : ""}`}>
          {/* Mini financial stats */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div className="p-2.5 rounded-xl bg-green-50/80 border border-green-100">
              <div className="text-[10px] font-bold text-neutral-500 mb-0.5 uppercase tracking-wide">Rent Collected</div>
              <div className="text-base sm:text-lg font-black text-green-600">{formatINR(thisMonthIncome)}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-100">
              <div className="text-[10px] font-bold text-neutral-500 mb-0.5 uppercase tracking-wide">Expenses</div>
              <div className="text-base sm:text-lg font-black text-orange-600">{formatINR(thisMonthExpense)}</div>
            </div>
          </div>

          {/* Collection progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-bold text-neutral-600">This month's collection</span>
              <span className="font-black text-neutral-900">{collectionPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${Math.min(100, collectionPct)}%` }} />
            </div>
            <div className="text-[10px] font-medium text-neutral-400 mt-1.5">
              {formatINR(collectedRent)} collected of {formatINR(expectedRent)} expected
            </div>
          </div>

          {/* 6-month trend chart */}
          <div className="pt-1">
            <RevenueTrendChart data={trendData} />
          </div>
        </div>

        {!isOwner && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md z-10">
            <div className="text-center px-6">
              <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Lock size={18} className="text-amber-600" />
              </div>
              <p className="text-xs font-black uppercase tracking-tight text-neutral-800 mb-1">Owner Access Required</p>
              <p className="text-[11px] text-neutral-500 font-medium">Revenue data is only visible to the PG Owner. Contact your owner for financial reports.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Rent Pending + Action Items ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rent Pending This Month (actionable) */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/40">
            <h2 className="font-extrabold text-neutral-900 text-[13px] uppercase tracking-wide flex items-center gap-2">
              <Wallet size={14} className="text-neutral-500" />
              Rent Pending
              <span className="text-[10px] text-neutral-400 font-bold">· {formatMonth(forMonth)}</span>
            </h2>
            <Link href="/dashboard/manager/reminders" className="text-[10px] uppercase tracking-wider font-extrabold text-violet-600 hover:text-violet-700">
              View All
            </Link>
          </div>

          <div className="flex-1">
            {pending.length === 0 ? (
              <div className="text-center py-10 px-4">
                <CheckCircle2 size={24} className="mx-auto text-green-400 mb-2" />
                <p className="text-xs font-black uppercase tracking-tight text-neutral-700">Sab ne pay kar diya! 🎉</p>
                <p className="text-[11px] font-medium text-neutral-500 mt-0.5">{formatMonth(forMonth)} ke liye koi rent pending nahi.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-50">
                {pending.slice(0, 6).map((t) => (
                  <div key={t.id} className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-violet-50/30 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-2xl bg-red-50 text-red-700 border border-red-100 flex items-center justify-center font-bold text-[11px] shrink-0">
                        {initials(t.name)}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/dashboard/manager/tenants/${t.id}`} className="font-bold text-[13px] text-neutral-900 hover:text-violet-700 truncate block">
                          {t.name}
                        </Link>
                        <div className="text-[10px] font-medium text-neutral-400 truncate">
                          {t.listing?.title}
                          {t.paid > 0 && <span className="text-amber-600 font-bold"> · partial {formatINR(t.paid)} paid</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <div className="font-black text-red-600 text-[13px]">{formatINR(t.due)}</div>
                        <div className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">pending</div>
                      </div>
                      <a
                        href={buildRentReminderLink({
                          phone: t.phone ?? "",
                          tenantName: t.name,
                          ownerName: managerName,
                          propertyName: t.listing?.title ?? "PG",
                          amount: t.due,
                          month: forMonth,
                        })}
                        target="_blank"
                        rel="noreferrer"
                        title="Send WhatsApp reminder"
                        className="p-1.5 rounded-xl bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 transition-colors"
                      >
                        <MessageCircle size={14} />
                      </a>
                      <Link
                        href={`/dashboard/manager/payments/new?tenantId=${t.id}`}
                        className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 hover:text-violet-900 bg-violet-50/50 px-2 py-1.5 rounded-xl border border-violet-100"
                      >
                        Record <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Items (open complaints) */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/40">
            <h2 className="font-extrabold text-neutral-900 text-[13px] uppercase tracking-wide flex items-center gap-2">
              <Wrench size={14} className="text-neutral-500" />
              Action Items
            </h2>
            <Link href="/dashboard/manager/complaints" className="text-[10px] uppercase tracking-wider font-extrabold text-violet-600 hover:text-violet-700">
              View All
            </Link>
          </div>

          <div className="p-4 flex-1">
            {openComplaints.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 size={20} className="mx-auto text-green-400 mb-2" />
                <p className="text-[11px] font-bold text-neutral-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openComplaints.map((c) => {
                  const isUrgent = c.priority === "URGENT" || c.priority === "HIGH";
                  return (
                    <div key={c.id} className="flex gap-2.5">
                      <div className="mt-0.5 relative">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isUrgent ? "bg-red-500" : "bg-orange-400"}`} />
                        <div className="absolute top-4 left-0.5 w-px h-full bg-neutral-200 -z-10" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight text-neutral-800 line-clamp-1">{c.title}</p>
                        <p className="text-[11px] font-medium text-neutral-500 mt-0.5">{c.listing?.title}</p>
                        <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">
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
