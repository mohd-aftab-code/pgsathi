/**
 * app/(main)/dashboard/manager/tenants/[id]/page.tsx
 * Tenant detail page — profile, payment history, bills, documents.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, Home, CreditCard } from "lucide-react";
import { db } from "@/lib/db";
import { requireManagerAccess } from "@/lib/manager-auth";
import { StatusBadge } from "@/components/manage/StatusBadge";
import { formatINR, formatDate, formatMonth, currentMonth, initials } from "@/lib/manage-utils";
import { buildRentReminderLink } from "@/lib/whatsapp-reminder";
import { TenantActions } from "./TenantActions";

interface PageProps { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const t = await db.pgTenant.findUnique({ where: { id: parseInt(id) }, select: { name: true } });
  return { title: `${t?.name ?? "Tenant"} — PG Manager` };
}

export default async function TenantDetailPage({ params }: PageProps) {
  const { id }   = await params;
  const { userId, name: ownerName } = await requireManagerAccess();
  const month    = currentMonth();

  const tenant = await db.pgTenant.findFirst({
    where: { id: parseInt(id), ownerId: userId, deletedAt: null },
    include: {
      listing:   { select: { id: true, title: true } },
      room:      { select: { name: true } },
      bed:       { select: { name: true } },
      payments:  { orderBy: { paidOn: "desc" }, take: 12 },
      rentBills: { orderBy: { createdAt: "desc" }, take: 6, include: { payments: { select: { amount: true } } } },
      documents: { orderBy: { uploadedAt: "desc" } },
      complaints:{ orderBy: { createdAt: "desc" }, take: 5, where: { status: { in: ["OPEN","IN_PROGRESS"] } } },
    },
  });

  if (!tenant) notFound();

  const totalPaid   = tenant.payments.filter(p => !p.voided).reduce((s, p) => s + p.amount, 0);
  const thisMonthPaid = tenant.payments.filter(p => p.forMonth === month && p.type === "RENT" && !p.voided).reduce((s, p) => s + p.amount, 0);
  const due           = Math.max(0, tenant.monthlyRent - thisMonthPaid);

  return (
    <div>
      {/* Back */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/manager/tenants" className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-extrabold text-neutral-900">{tenant.name}</h1>
        <StatusBadge status={tenant.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Profile */}
        <div className="space-y-4">
          {/* Avatar + Contact */}
          <div className="card p-5 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-100 text-2xl font-extrabold text-primary-700">
              {initials(tenant.name)}
            </div>
            <div className="mt-3 text-lg font-bold text-neutral-900">{tenant.name}</div>
            <div className="text-sm text-neutral-400 capitalize">{tenant.gender.toLowerCase()}</div>
            <div className="mt-3 space-y-2">
              <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 text-sm text-neutral-700">
                <Phone className="h-4 w-4 text-neutral-400" /> {tenant.phone}
              </a>
              {tenant.email && (
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Mail className="h-4 w-4 text-neutral-400" /> {tenant.email}
                </div>
              )}
            </div>
          </div>

          {/* Stay Details */}
          <div className="card p-5">
            <h3 className="mb-3 font-bold text-neutral-900">Stay Details</h3>
            <div className="space-y-2 text-sm">
              <Row label="PG" value={tenant.listing.title} />
              {tenant.room && <Row label="Room" value={`Room ${tenant.room.name}`} />}
              {tenant.bed  && <Row label="Bed"  value={`Bed ${tenant.bed.name}`}   />}
              <Row label="Check-in"    value={formatDate(tenant.checkInDate)} />
              {tenant.checkOutDate && <Row label="Check-out" value={formatDate(tenant.checkOutDate)} />}
              <Row label="Rent Due Day" value={`${tenant.rentDueDay}th every month`} />
            </div>
          </div>

          {/* Money */}
          <div className="card p-5">
            <h3 className="mb-3 font-bold text-neutral-900">Financials</h3>
            <div className="space-y-2 text-sm">
              <Row label="Monthly Rent"     value={formatINR(tenant.monthlyRent)} />
              <Row label="Security Deposit" value={formatINR(tenant.securityDeposit)} />
              <Row label="Total Collected"  value={formatINR(totalPaid)} />
            </div>
            {due > 0 && (
              <div className="mt-3 rounded-xl bg-red-50 border border-red-100 p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-red-600 font-semibold">Pending (this month)</div>
                  <div className="text-lg font-extrabold text-red-700">{formatINR(due)}</div>
                </div>
                <a
                  href={buildRentReminderLink({ phone: tenant.phone, tenantName: tenant.name, ownerName, propertyName: tenant.listing.title, amount: due, month })}
                  target="_blank" rel="noreferrer"
                  className="btn-whatsapp text-xs px-3 py-2"
                >
                  WA Reminder
                </a>
              </div>
            )}
          </div>

          {/* KYC */}
          {(tenant.idType || tenant.guardianName) && (
            <div className="card p-5">
              <h3 className="mb-3 font-bold text-neutral-900">KYC</h3>
              <div className="space-y-2 text-sm">
                {tenant.idType && <Row label={tenant.idType} value={tenant.idNumber ?? "—"} />}
                {tenant.guardianName && <Row label="Guardian" value={`${tenant.guardianName} (${tenant.guardianPhone ?? "—"})`} />}
              </div>
            </div>
          )}

          {/* Actions */}
          <TenantActions tenantId={tenant.id} listingId={tenant.listingId} forMonth={month} monthlyRent={tenant.monthlyRent} />
        </div>

        {/* Right: History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rent Bills */}
          {tenant.rentBills.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-4 font-bold text-neutral-900">Rent Bills</h3>
              <div className="space-y-3">
                {tenant.rentBills.map((b) => {
                  const paid = b.payments.reduce((s, p) => s + p.amount, 0);
                  const balance = b.rentAmount + b.electricity + b.otherAmount + b.lateFee - paid;
                  return (
                    <div key={b.id} className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
                      <div>
                        <div className="font-semibold text-sm text-neutral-900">{formatMonth(b.forMonth)}</div>
                        <div className="text-xs text-neutral-400">
                          Rent {formatINR(b.rentAmount)}{b.electricity > 0 ? ` + Electricity ${formatINR(b.electricity)}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${balance > 0 ? "text-red-600" : "text-green-700"}`}>
                          {balance > 0 ? `${formatINR(balance)} due` : "Paid ✓"}
                        </div>
                        <div className="text-xs text-neutral-400">Due: {formatDate(b.dueDate)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment History */}
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-neutral-900">Payment History</h3>
              <Link
                href={`/dashboard/manager/payments/new?tenantId=${tenant.id}`}
                className="text-sm font-semibold text-primary-700 hover:underline"
              >
                + Record Payment
              </Link>
            </div>
            {tenant.payments.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-400">Koi payment nahi mila abhi tak.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-neutral-100 text-xs text-neutral-500">
                    <tr>
                      <th className="pb-2 text-left">Date</th>
                      <th className="pb-2 text-left">Type</th>
                      <th className="pb-2 text-left">Method</th>
                      <th className="pb-2 text-left">Receipt</th>
                      <th className="pb-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {tenant.payments.map((p) => (
                      <tr key={p.id} className={p.voided ? "opacity-40" : ""}>
                        <td className="py-2.5 text-neutral-600">{formatDate(p.paidOn)}</td>
                        <td className="py-2.5">{p.type}</td>
                        <td className="py-2.5 text-neutral-500">{p.method}</td>
                        <td className="py-2.5 text-xs text-neutral-400">{p.receiptNo ?? "—"}</td>
                        <td className="py-2.5 text-right font-bold text-green-700">{formatINR(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Open Complaints */}
          {tenant.complaints.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-3 font-bold text-neutral-900">Open Complaints</h3>
              <div className="space-y-2">
                {tenant.complaints.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 rounded-xl bg-amber-50 p-3">
                    <StatusBadge status={c.priority} className="mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">{c.title}</div>
                      <div className="text-xs text-neutral-400">{c.category} · {formatDate(c.createdAt)}</div>
                    </div>
                    <StatusBadge status={c.status} className="ml-auto shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-neutral-400 shrink-0">{label}</span>
      <span className="font-medium text-neutral-900 text-right">{value}</span>
    </div>
  );
}
