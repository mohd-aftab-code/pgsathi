/**
 * app/(main)/dashboard/owner/manage/page.tsx
 * PG Manager Overview — main dashboard with all key stats.
 */
import Link from "next/link";
import {
  Users, BedDouble, Wallet, BellRing, Wrench, TrendingUp,
  TrendingDown, ArrowRight, Plus, Building2,
} from "lucide-react";
import { db } from "@/lib/db";
import { requireManageAccess } from "@/lib/manage-auth";
import { StatCard } from "@/components/manage/StatCard";
import { StatusBadge } from "@/components/manage/StatusBadge";
import { formatINR, formatMonth, currentMonth, formatDate, initials } from "@/lib/manage-utils";
import { buildRentReminderLink } from "@/lib/whatsapp-reminder";

export const metadata = { title: "PG Manager Overview — PGSathi" };

export default async function ManageOverviewPage() {
  const { userId, name: ownerName } = await requireManageAccess();
  const month = currentMonth();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [
    listings,
    activeTenantsFull,
    openComplaints,
    rentCollected,
    monthIncome,
    monthExpense,
    recentPayments,
    recentComplaints,
  ] = await Promise.all([
    db.listing.findMany({ where: { ownerId: userId }, select: { id: true, title: true } }),
    db.pgTenant.findMany({
      where: { ownerId: userId, status: "ACTIVE", deletedAt: null },
      include: {
        listing: { select: { id: true, title: true } },
        payments: { where: { type: "RENT", forMonth: month, voided: false }, select: { amount: true } },
      },
    }),
    db.pgComplaint.count({ where: { ownerId: userId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    db.pgPayment.aggregate({ where: { ownerId: userId, type: "RENT", forMonth: month, voided: false }, _sum: { amount: true } }),
    db.pgPayment.aggregate({ where: { ownerId: userId, voided: false, paidOn: { gte: monthStart } }, _sum: { amount: true } }),
    db.pgExpense.aggregate({ where: { ownerId: userId, spentOn: { gte: monthStart } }, _sum: { amount: true } }),
    db.pgPayment.findMany({ where: { ownerId: userId, voided: false }, orderBy: { paidOn: "desc" }, take: 5, include: { tenant: { select: { id: true, name: true } } } }),
    db.pgComplaint.findMany({ where: { ownerId: userId, status: { in: ["OPEN", "IN_PROGRESS"] } }, orderBy: { createdAt: "desc" }, take: 5, include: { listing: { select: { title: true } } } }),
  ]);

  // Rooms & beds from owner's listings
  const listingIds = listings.map((l) => l.id);
  const [totalBeds, occupiedBeds] = await Promise.all([
    db.bed.count({ where: { room: { listingId: { in: listingIds } } } }),
    db.bed.count({ where: { room: { listingId: { in: listingIds } }, isOccupied: true } }),
  ]);

  const activeTenants   = activeTenantsFull.length;
  const expectedRent    = activeTenantsFull.reduce((s, t) => s + t.monthlyRent, 0);
  const collected       = rentCollected._sum.amount ?? 0;
  const income          = monthIncome._sum.amount ?? 0;
  const expense         = monthExpense._sum.amount ?? 0;
  const net             = income - expense;
  const occupancyPct    = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const pendingTenants = activeTenantsFull
    .map((t) => {
      const paid = t.payments.reduce((s, p) => s + p.amount, 0);
      return { ...t, paid, due: Math.max(0, t.monthlyRent - paid) };
    })
    .filter((t) => t.due > 0)
    .sort((a, b) => b.due - a.due);

  const totalDue = pendingTenants.reduce((s, t) => s + t.due, 0);
  const isEmpty  = listings.length === 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">
            Namaste, {ownerName.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Aapke PG business ka aaj ka overview — {formatMonth(month)}
          </p>
        </div>
        <Link href="/dashboard/owner/manage/tenants/new" className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Add Tenant
        </Link>
      </div>

      {isEmpty ? (
        /* ── Empty state ─────────────────────────────────────────── */
        <div className="card p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-50 text-primary-600">
            <Building2 className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-neutral-900">Chaliye shuru karte hain!</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Pehle PGSathi par apni listing add karein, phir tenants add karein aur rent manage karein.
          </p>
          <div className="mx-auto mt-6 grid max-w-md gap-3 sm:grid-cols-2">
            <Link href="/dashboard/owner/listings/new" className="card p-4 text-left hover:shadow-md transition">
              <Building2 className="h-6 w-6 text-primary-600" />
              <div className="mt-2 text-sm font-semibold">1. Add PG Listing</div>
            </Link>
            <Link href="/dashboard/owner/manage/tenants/new" className="card p-4 text-left hover:shadow-md transition">
              <Users className="h-6 w-6 text-primary-600" />
              <div className="mt-2 text-sm font-semibold">2. Add Tenants</div>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ── Stat Cards ──────────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Wallet}   label="Rent Collected"  value={formatINR(collected)} hint={`of ${formatINR(expectedRent)} expected`} tone="green" />
            <StatCard icon={BellRing} label="Rent Pending"    value={formatINR(totalDue)}  hint={`${pendingTenants.length} tenants`}          tone="red"   />
            <StatCard icon={BedDouble} label="Occupancy"      value={`${occupancyPct}%`}   hint={`${occupiedBeds}/${totalBeds} beds`}          tone="blue"  />
            <StatCard icon={Users}    label="Active Tenants"  value={activeTenants}        hint={`${listings.length} PG properties`}          tone="purple"/>
          </div>

          {/* ── Income / Expense / Net ───────────────────────────── */}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <StatCard icon={TrendingUp}   label="Income (this month)"   value={formatINR(income)}   tone="green" />
            <StatCard icon={TrendingDown} label="Expenses (this month)" value={formatINR(expense)}  tone="red"   />
            <StatCard icon={Wallet}       label="Net (this month)"      value={formatINR(net)}       hint={net >= 0 ? "Profit ✓" : "Loss"} tone={net >= 0 ? "green" : "red"} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* ── Rent Pending List ──────────────────────────────── */}
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-neutral-900">
                  <BellRing className="h-4 w-4 text-red-500" /> Rent Pending
                </h3>
                <Link href="/dashboard/owner/manage/reminders" className="flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline">
                  Send reminders <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {pendingTenants.length === 0 ? (
                <p className="py-6 text-center text-sm text-green-600">Sabne rent de diya! 🎉</p>
              ) : (
                <div className="divide-y divide-neutral-50">
                  {pendingTenants.slice(0, 6).map(({ id, name, phone, listing, due }) => (
                    <div key={id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                          {initials(name)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-neutral-900">{name}</div>
                          <div className="text-xs text-neutral-400">{listing.title}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-600">{formatINR(due)}</span>
                        <a
                          href={buildRentReminderLink({ phone, tenantName: name, ownerName, propertyName: listing.title, amount: due, month })}
                          target="_blank" rel="noreferrer"
                          className="rounded-lg bg-green-100 px-2 py-1 text-xs font-bold text-green-700 hover:bg-green-200 transition"
                        >WA</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Recent Payments ───────────────────────────────── */}
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-neutral-900">Recent Payments</h3>
                <Link href="/dashboard/owner/manage/payments" className="flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {recentPayments.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-400">Koi payment nahi abhi tak.</p>
              ) : (
                <div className="divide-y divide-neutral-50">
                  {recentPayments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <div className="text-sm font-semibold text-neutral-900">{p.tenant.name}</div>
                        <div className="text-xs text-neutral-400">{p.type} · {formatDate(p.paidOn)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-700">{formatINR(p.amount)}</span>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Open Complaints Banner ───────────────────────────── */}
          {openComplaints > 0 && (
            <Link
              href="/dashboard/owner/manage/complaints"
              className="mt-6 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4 hover:bg-amber-100 transition"
            >
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  {openComplaints} complaint{openComplaints > 1 ? "s" : ""} abhi resolve nahi hui
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-600" />
            </Link>
          )}
        </>
      )}
    </div>
  );
}
