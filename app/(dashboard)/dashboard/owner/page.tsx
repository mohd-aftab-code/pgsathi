/**
 * app/(dashboard)/dashboard/owner/page.tsx
 * Owner command centre — one screen that answers "how is my business doing?"
 * across every PG, or drilled into a single PG via the property filter.
 *
 * All per-listing aggregates are computed once into maps, then either summed
 * (All PGs) or read for the selected listing — so the filter costs no extra
 * queries and the per-PG comparison table stays consistent with the KPI row.
 */
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  Building2, PlusCircle, Eye, MessageSquare, ArrowRight, Clock, Phone,
  TrendingUp, Users, Wallet, BedDouble, Wrench, CheckCircle2, BarChart3,
  MessageCircle, AlertTriangle, IndianRupee,
} from "lucide-react";
import { formatDistanceToNow, subDays, format } from "date-fns";
import { LeadsChart } from "@/components/dashboard/LeadsChart";
import { RevenueTrendChart } from "@/components/manage/RevenueTrendChart";
import { PropertyFilterSelect } from "@/components/manage/PropertyFilterSelect";
import { LiveTime } from "@/components/manage/LiveTime";
import { currentMonth, formatMonth, formatINR, initials } from "@/lib/manage-utils";
import { buildRentReminderLink } from "@/lib/whatsapp-reminder";

export const metadata = { title: "Dashboard — PGSathi" };

/** Small helper: adds `n` into a Map bucket keyed by listing id. */
function bump(map: Map<number, number>, key: number, n: number) {
  map.set(key, (map.get(key) ?? 0) + n);
}

export default async function OwnerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ listingId?: string }>;
}) {
  const session = await auth();
  const ownerId = parseInt(session?.user?.id || "0");
  const ownerName = session?.user?.name ?? "Owner";

  const sp = await searchParams;
  const rawId = sp?.listingId ? parseInt(sp.listingId) : NaN;
  const listingId = Number.isNaN(rawId) ? undefined : rawId;

  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const forMonth = currentMonth();

  // Every PG the owner has — also the source for the filter dropdown
  const listings = await db.listing.findMany({
    where: { ownerId },
    select: {
      id: true, title: true, slug: true, totalViews: true,
      city: { select: { name: true } },
    },
    orderBy: { title: "asc" },
  });
  const listingIds = listings.map((l) => l.id);
  // A filter for a PG that isn't theirs must not silently widen to "all"
  const scopeIds = listingId && listingIds.includes(listingId) ? [listingId] : listingIds;
  const isAll = scopeIds.length === listingIds.length && !listingId;
  const scopedFilter = listingId ? { listingId } : {};

  const [
    rooms, allTenants, leadGroups, recentLeadGroups,
    complaintGroups, recentLeads, openComplaints,
    payments6mo, expenses6mo, leads7d,
  ] = await Promise.all([
    // beds per listing (bed → room → listing)
    db.room.findMany({
      where: { listing: { ownerId } },
      select: { listingId: true, beds: { select: { isOccupied: true } } },
    }),
    // One pass over active tenants + their rent paid this month. Deriving the
    // KPI row, the per-PG table AND the pending list from this single source is
    // what keeps them consistent — summing payments separately let a vacated
    // tenant's payment push "collected" past "expected" (110% of expected).
    db.pgTenant.findMany({
      where: { ownerId, status: "ACTIVE", deletedAt: null },
      select: {
        id: true, listingId: true, name: true, phone: true, monthlyRent: true,
        listing: { select: { title: true } },
        payments: { where: { type: "RENT", forMonth, voided: false }, select: { amount: true } },
      },
    }),
    db.lead.groupBy({ by: ["listingId"], where: { listing: { ownerId } }, _count: { _all: true } }),
    db.lead.groupBy({
      by: ["listingId"],
      where: { listing: { ownerId }, createdAt: { gte: sevenDaysAgo } },
      _count: { _all: true },
    }),
    db.pgComplaint.groupBy({
      by: ["listingId"],
      where: { ownerId, status: { in: ["OPEN", "IN_PROGRESS"] } },
      _count: { _all: true },
    }),

    // ── scoped detail lists ──
    db.lead.findMany({
      where: { listing: { ownerId }, ...scopedFilter },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { listing: { select: { title: true, slug: true } } },
    }),
    db.pgComplaint.findMany({
      where: { ownerId, status: { in: ["OPEN", "IN_PROGRESS"] }, ...scopedFilter },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { listing: { select: { title: true } } },
    }),
    db.pgPayment.findMany({
      where: {
        ownerId, voided: false, paidOn: { gte: sixMonthsStart },
        ...(listingId ? { tenant: { listingId } } : {}),
      },
      select: { amount: true, paidOn: true },
    }),
    db.pgExpense.findMany({
      where: { ownerId, spentOn: { gte: sixMonthsStart }, ...scopedFilter },
      select: { amount: true, spentOn: true },
    }),
    db.lead.findMany({
      where: { listing: { ownerId }, createdAt: { gte: sevenDaysAgo }, ...scopedFilter },
      select: { createdAt: true },
    }),
  ]);

  // ── Fold everything into per-listing maps ────────────────────────────
  const bedsMap = new Map<number, number>();
  const occMap = new Map<number, number>();
  for (const r of rooms) {
    bump(bedsMap, r.listingId, r.beds.length);
    bump(occMap, r.listingId, r.beds.filter((b) => b.isOccupied).length);
  }

  const tenantMap = new Map<number, number>();
  const expectedMap = new Map<number, number>();
  const collectedMap = new Map<number, number>();
  // Per-tenant dues, computed once and reused for the pending list below.
  const dues = allTenants.map((t) => {
    const paid = t.payments.reduce((s, p) => s + p.amount, 0);
    // Cap at the month's rent: an advance payment isn't "this month collected",
    // and without the cap collection% could exceed 100%.
    const counted = Math.min(paid, t.monthlyRent);
    bump(tenantMap, t.listingId, 1);
    bump(expectedMap, t.listingId, t.monthlyRent);
    bump(collectedMap, t.listingId, counted);
    return { ...t, paid, due: Math.max(0, t.monthlyRent - paid) };
  });

  const leadMap = new Map<number, number>();
  for (const g of leadGroups) leadMap.set(g.listingId, g._count._all);
  const newLeadMap = new Map<number, number>();
  for (const g of recentLeadGroups) newLeadMap.set(g.listingId, g._count._all);
  const issueMap = new Map<number, number>();
  for (const g of complaintGroups) issueMap.set(g.listingId, g._count._all);

  // ── Per-PG rows (the comparison table) ───────────────────────────────
  const rows = listings.map((l) => {
    const beds = bedsMap.get(l.id) ?? 0;
    const occupied = occMap.get(l.id) ?? 0;
    const expected = expectedMap.get(l.id) ?? 0;
    const collected = collectedMap.get(l.id) ?? 0;
    return {
      ...l,
      beds,
      occupied,
      occupancy: beds > 0 ? Math.round((occupied / beds) * 100) : null,
      tenants: tenantMap.get(l.id) ?? 0,
      expected,
      collected,
      pending: Math.max(0, expected - collected),
      leads: leadMap.get(l.id) ?? 0,
      newLeads: newLeadMap.get(l.id) ?? 0,
      issues: issueMap.get(l.id) ?? 0,
      views: l.totalViews ?? 0,
    };
  });

  // ── Scoped totals — sum of the rows currently in scope ───────────────
  const scoped = rows.filter((r) => scopeIds.includes(r.id));
  const sum = (pick: (r: (typeof rows)[number]) => number) => scoped.reduce((s, r) => s + pick(r), 0);

  const totalBeds = sum((r) => r.beds);
  const occupiedBeds = sum((r) => r.occupied);
  const occupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : null;
  const activeTenants = sum((r) => r.tenants);
  const expectedRent = sum((r) => r.expected);
  const collectedRent = sum((r) => r.collected);
  const pendingRent = Math.max(0, expectedRent - collectedRent);
  const collectionPct = expectedRent > 0 ? Math.round((collectedRent / expectedRent) * 100) : 0;
  const totalLeads = sum((r) => r.leads);
  const newLeads = sum((r) => r.newLeads);
  const totalViews = sum((r) => r.views);
  const openIssues = sum((r) => r.issues);

  // ── 6-month income vs expense trend ──────────────────────────────────
  const months: { key: string; label: string; income: number; expense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: format(d, "MMM"), income: 0, expense: 0 });
  }
  const bucket = new Map(months.map((m, i) => [m.key, i]));
  for (const p of payments6mo) {
    const d = new Date(p.paidOn);
    const i = bucket.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) months[i].income += p.amount;
  }
  for (const e of expenses6mo) {
    const d = new Date(e.spentOn);
    const i = bucket.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) months[i].expense += e.amount;
  }
  const trendData = months.map((m) => ({ month: m.label, income: m.income, expense: m.expense }));
  const monthIncome = months[5].income;
  const monthExpense = months[5].expense;
  const netProfit = monthIncome - monthExpense;

  // ── 7-day leads chart ────────────────────────────────────────────────
  const dayMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) dayMap.set(format(subDays(now, i), "MMM dd"), 0);
  for (const l of leads7d) {
    const k = format(new Date(l.createdAt), "MMM dd");
    if (dayMap.has(k)) dayMap.set(k, dayMap.get(k)! + 1);
  }
  const chartData = Array.from(dayMap.entries()).map(([date, leads]) => ({ date, leads }));

  // ── Rent pending, per tenant (same source as the KPI totals) ─────────
  const pending = dues
    .filter((t) => t.due > 0 && scopeIds.includes(t.listingId))
    .sort((a, b) => b.due - a.due);

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const scopeLabel = listingId ? listings.find((l) => l.id === listingId)?.title ?? "PG" : "All PGs";
  const sanitizePhone = (p: string) => p.replace(/\D/g, "").replace(/^(91)/, "");
  const hasCrmData = totalBeds > 0 || activeTenants > 0;

  const tone: Record<string, { bg: string; text: string; bar: string }> = {
    violet: { bg: "bg-violet-50", text: "text-violet-600", bar: "bg-violet-500" },
    blue:   { bg: "bg-blue-50",   text: "text-blue-600",   bar: "bg-blue-500" },
    green:  { bg: "bg-green-50",  text: "text-green-600",  bar: "bg-green-500" },
    red:    { bg: "bg-red-50",    text: "text-red-600",    bar: "bg-red-500" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", bar: "bg-orange-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", bar: "bg-purple-500" },
  };

  const kpis = [
    { label: "Occupancy", value: occupancyPct !== null ? `${occupancyPct}%` : "—",
      sub: totalBeds > 0 ? `${occupiedBeds}/${totalBeds} beds filled` : "Set up rooms & beds",
      icon: BedDouble, color: "blue", href: "/dashboard/owner/inventory", bar: occupancyPct },
    { label: "Rent Collected", value: formatINR(collectedRent),
      sub: `${collectionPct}% of ${formatINR(expectedRent)}`,
      icon: IndianRupee, color: "green", href: "/dashboard/manager/payments", bar: collectionPct },
    { label: "Rent Pending", value: formatINR(pendingRent),
      sub: `${pending.length} tenant${pending.length === 1 ? "" : "s"} pending`,
      icon: Wallet, color: "red", href: "/dashboard/manager/reminders", bar: null },
    { label: "Active Tenants", value: String(activeTenants),
      sub: `across ${scoped.length} ${scoped.length === 1 ? "PG" : "PGs"}`,
      icon: Users, color: "violet", href: "/dashboard/manager/tenants", bar: null },
    { label: "Total Leads", value: String(totalLeads),
      sub: newLeads > 0 ? `${newLeads} new this week` : "No new leads this week",
      icon: MessageSquare, color: "purple", href: "/dashboard/owner/leads", bar: null },
    { label: "Open Issues", value: String(openIssues),
      sub: openIssues > 0 ? "Needs attention" : "All resolved 🎉",
      icon: Wrench, color: "orange", href: "/dashboard/manager/complaints", bar: null },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
            {greeting}, {ownerName} 👋
          </h1>
          <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1.5 flex-wrap">
            {format(now, "EEEE, d MMM yyyy")} <LiveTime />
            <span className="text-neutral-300">·</span>
            <span className="font-semibold text-violet-700">{scopeLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <PropertyFilterSelect
            listings={listings}
            value={listingId}
            className="input-base text-sm w-48 cursor-pointer bg-white"
          />
          <Link href="/dashboard/manager/reports" className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 py-2.5 px-4 text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5">
            <BarChart3 size={16} /> Reports
          </Link>
          <Link href="/dashboard/owner/listings/new" className="bg-neutral-900 hover:bg-black text-white py-2.5 px-4 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
            <PlusCircle size={16} /> Add New PG
          </Link>
        </div>
      </div>

      {/* ── KPI row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {kpis.map((k) => {
          const t = tone[k.color];
          return (
            <Link
              key={k.label}
              href={k.href}
              className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-violet-200 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-3 gap-2">
                <span className="text-xs md:text-sm font-medium text-neutral-500 group-hover:text-neutral-700 transition-colors leading-tight">{k.label}</span>
                <div className={`p-1.5 rounded-lg shrink-0 ${t.bg}`}>
                  <k.icon size={15} className={t.text} />
                </div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-neutral-900 truncate">{k.value}</div>
                {k.bar !== null && (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                    <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${Math.min(100, k.bar)}%` }} />
                  </div>
                )}
                <div className="text-[11px] text-neutral-400 mt-1.5 line-clamp-1">{k.sub}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Per-PG comparison — the multi-property overview ──────── */}
      {listings.length > 1 && !listingId && (
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <Building2 size={16} className="text-violet-600" /> PG-wise Overview
              <span className="text-xs text-neutral-400 font-medium">· {formatMonth(forMonth)}</span>
            </h2>
            <span className="text-xs text-neutral-400">Kisi bhi PG par click karke uska poora data dekhein</span>
          </div>

          {/* The table scrolls on its own so the page never scrolls sideways */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-400 bg-neutral-50/70">
                  <th className="px-5 py-2.5 font-bold">Property</th>
                  <th className="px-3 py-2.5 font-bold">Occupancy</th>
                  <th className="px-3 py-2.5 font-bold text-right">Tenants</th>
                  <th className="px-3 py-2.5 font-bold text-right">Collected</th>
                  <th className="px-3 py-2.5 font-bold text-right">Pending</th>
                  <th className="px-3 py-2.5 font-bold text-right">Leads</th>
                  <th className="px-3 py-2.5 font-bold text-right">Views</th>
                  <th className="px-5 py-2.5 font-bold text-right">Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-violet-50/40 transition-colors group">
                    <td className="px-5 py-3 max-w-[240px]">
                      <Link href={`/dashboard/owner?listingId=${r.id}`} className="font-semibold text-neutral-900 group-hover:text-violet-700 truncate block">
                        {r.title}
                      </Link>
                      <span className="text-[11px] text-neutral-400">{r.city?.name ?? "—"}</span>
                    </td>
                    <td className="px-3 py-3 w-[140px]">
                      {r.occupancy === null ? (
                        <span className="text-xs text-neutral-400">no beds set</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-neutral-100 overflow-hidden shrink-0">
                            <div
                              className={`h-full rounded-full ${r.occupancy >= 85 ? "bg-green-500" : r.occupancy >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min(100, r.occupancy)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-neutral-700 tabular-nums">{r.occupancy}%</span>
                          <span className="text-[11px] text-neutral-400 tabular-nums">{r.occupied}/{r.beds}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-neutral-700 tabular-nums">{r.tenants}</td>
                    <td className="px-3 py-3 text-right font-semibold text-green-600 tabular-nums">{formatINR(r.collected)}</td>
                    <td className="px-3 py-3 text-right font-bold tabular-nums">
                      <span className={r.pending > 0 ? "text-red-600" : "text-neutral-300"}>{formatINR(r.pending)}</span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span className="font-semibold text-neutral-700">{r.leads}</span>
                      {r.newLeads > 0 && <span className="ml-1 text-[10px] font-bold text-green-600">+{r.newLeads}</span>}
                    </td>
                    <td className="px-3 py-3 text-right text-neutral-500 tabular-nums">{r.views}</td>
                    <td className="px-5 py-3 text-right">
                      {r.issues > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md">
                          <AlertTriangle size={11} /> {r.issues}
                        </span>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-50 font-bold text-neutral-900 border-t-2 border-neutral-200">
                  <td className="px-5 py-3">Total · {rows.length} PGs</td>
                  <td className="px-3 py-3 text-xs tabular-nums">{occupancyPct ?? 0}% ({occupiedBeds}/{totalBeds})</td>
                  <td className="px-3 py-3 text-right tabular-nums">{activeTenants}</td>
                  <td className="px-3 py-3 text-right text-green-700 tabular-nums">{formatINR(collectedRent)}</td>
                  <td className="px-3 py-3 text-right text-red-700 tabular-nums">{formatINR(pendingRent)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{totalLeads}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{totalViews}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{openIssues}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── Money this month ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <TrendingUp size={16} className="text-violet-600" /> Revenue &amp; Expenses
              <span className="text-xs text-neutral-400 font-medium">· last 6 months</span>
            </h2>
            <div className="flex items-center gap-3 text-xs font-medium text-neutral-500">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" /> Received</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500" /> Expenses</span>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3 mb-5">
              {/* "Total Received" ≠ the Rent Collected KPI: this counts every payment
                  type (deposits, electricity, dues from other months) received this
                  month, while the KPI is strictly this month's rent. */}
              <div className="p-3 rounded-xl bg-green-50">
                <div className="text-[11px] font-semibold text-neutral-500 mb-0.5">Total Received</div>
                <div className="text-base sm:text-xl font-extrabold text-green-600 truncate">{formatINR(monthIncome)}</div>
              </div>
              <div className="p-3 rounded-xl bg-orange-50">
                <div className="text-[11px] font-semibold text-neutral-500 mb-0.5">Expenses</div>
                <div className="text-base sm:text-xl font-extrabold text-orange-600 truncate">{formatINR(monthExpense)}</div>
              </div>
              <div className={`p-3 rounded-xl ${netProfit >= 0 ? "bg-violet-50" : "bg-red-50"}`}>
                <div className="text-[11px] font-semibold text-neutral-500 mb-0.5">Net</div>
                <div className={`text-base sm:text-xl font-extrabold truncate ${netProfit >= 0 ? "text-violet-700" : "text-red-600"}`}>
                  {formatINR(netProfit)}
                </div>
              </div>
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-neutral-600">{formatMonth(forMonth)} rent collection</span>
                <span className="font-bold text-neutral-900">{collectionPct}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${Math.min(100, collectionPct)}%` }} />
              </div>
              <div className="text-xs text-neutral-400 mt-1.5">
                {formatINR(collectedRent)} collected of {formatINR(expectedRent)} expected
              </div>
            </div>

            <RevenueTrendChart data={trendData} />
          </div>
        </div>

        {/* Leads activity */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-600" /> Leads Activity
            </h2>
            <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">7 Days</span>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center">
            <LeadsChart data={chartData} />
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-3 rounded-xl bg-blue-50">
                <div className="text-[11px] font-semibold text-neutral-500">Total Views</div>
                <div className="text-lg font-extrabold text-blue-700 flex items-center gap-1.5">
                  <Eye size={15} /> {totalViews}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-purple-50">
                <div className="text-[11px] font-semibold text-neutral-500">New Leads</div>
                <div className="text-lg font-extrabold text-purple-700">{newLeads}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Rent pending + Recent leads + Issues ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Rent pending */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <h2 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <Wallet size={16} className="text-red-500" /> Rent Pending — {formatMonth(forMonth)}
            </h2>
            <Link href="/dashboard/manager/reminders" className="text-xs font-semibold text-violet-600 hover:text-violet-700">View All</Link>
          </div>
          <div className="flex-1">
            {!hasCrmData ? (
              <div className="text-center py-12 px-6">
                <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <BedDouble size={22} className="text-violet-500" />
                </div>
                <p className="text-sm font-semibold text-neutral-700">PG Manager abhi set up nahi hua</p>
                <p className="text-xs text-neutral-500 mt-1 mb-4">Rooms, beds aur tenants add karein — phir rent, occupancy aur dues sab yahin dikhega.</p>
                <Link href="/dashboard/manager" className="btn-primary py-2 px-4 text-sm rounded-lg inline-block">Set up PG Manager</Link>
              </div>
            ) : pending.length === 0 ? (
              <div className="text-center py-12 px-4">
                <CheckCircle2 size={28} className="mx-auto text-green-400 mb-2" />
                <p className="text-sm font-semibold text-neutral-700">Sab ne pay kar diya! 🎉</p>
                <p className="text-xs text-neutral-500 mt-0.5">{formatMonth(forMonth)} ke liye koi rent pending nahi.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {pending.slice(0, 6).map((t) => (
                  <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-neutral-50/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {initials(t.name)}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/dashboard/manager/tenants/${t.id}`} className="font-semibold text-neutral-900 hover:underline truncate block">
                          {t.name}
                        </Link>
                        <div className="text-xs text-neutral-400 truncate">
                          {t.listing?.title}
                          {t.paid > 0 && <span className="text-amber-600"> · partial {formatINR(t.paid)} paid</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-extrabold text-red-600 text-sm">{formatINR(t.due)}</div>
                        <div className="text-[10px] text-neutral-400">pending</div>
                      </div>
                      <a
                        href={buildRentReminderLink({
                          phone: t.phone ?? "",
                          tenantName: t.name,
                          ownerName,
                          propertyName: t.listing?.title ?? "PG",
                          amount: t.due,
                          month: forMonth,
                        })}
                        target="_blank"
                        rel="noreferrer"
                        title="Send WhatsApp reminder"
                        className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                      >
                        <MessageCircle size={15} />
                      </a>
                    </div>
                  </div>
                ))}
                {pending.length > 6 && (
                  <Link href="/dashboard/manager/reminders" className="block px-5 py-2.5 text-xs font-semibold text-violet-600 hover:bg-violet-50/50 text-center">
                    +{pending.length - 6} more pending
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Open issues */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <h2 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <Wrench size={16} className="text-orange-500" /> Action Items
            </h2>
            <Link href="/dashboard/manager/complaints" className="text-xs font-semibold text-violet-600 hover:text-violet-700">View All</Link>
          </div>
          <div className="p-5 flex-1">
            {openComplaints.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 size={24} className="mx-auto text-green-400 mb-2" />
                <p className="text-xs text-neutral-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {openComplaints.map((c) => {
                  const urgent = c.priority === "URGENT" || c.priority === "HIGH";
                  return (
                    <div key={c.id} className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${urgent ? "bg-red-500" : "bg-orange-400"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-800 line-clamp-1">{c.title}</p>
                        <p className="text-xs text-neutral-500 mt-0.5 truncate">{c.listing?.title}</p>
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

      {/* ── Recent leads ────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <h2 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-500" /> Recent Enquiries
          </h2>
          <Link href="/dashboard/owner/leads" className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 group">
            View All <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-14 h-14 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={22} className="text-neutral-300" />
            </div>
            <p className="text-sm text-neutral-500 font-medium">Abhi koi enquiry nahi aayi.</p>
            <p className="text-xs text-neutral-400 mt-1">Achhi photos aur complete profile se 3x zyada leads aate hain.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {initials(lead.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-neutral-900 text-sm truncate">{lead.name}</h3>
                      {!lead.isRead && (
                        <span className="bg-primary-100 text-primary-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">New</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1"><Phone size={11} className="text-primary-500" /> {lead.phone}</span>
                      <span className="truncate max-w-[180px]">{lead.listing.title}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 pl-12 sm:pl-0">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-md whitespace-nowrap">
                    <Clock size={11} /> {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                  </span>
                  <a
                    href={`https://wa.me/91${sanitizePhone(lead.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
