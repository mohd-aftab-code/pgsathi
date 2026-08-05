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
        <Link href="/dashboard/manager/tenants" className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-200/60 bg-white/60 backdrop-blur-md hover:bg-white/80 transition-colors shadow-sm">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">{tenant.name}</h1>
        <StatusBadge status={tenant.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Profile */}
        <div className="space-y-4">
          {/* Avatar + Contact */}
          <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl shadow-sm p-5 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-100/80 border border-violet-200/60 shadow-sm text-2xl font-black text-violet-700">
              {initials(tenant.name)}
            </div>
            <div className="mt-3 text-lg font-black tracking-tight text-neutral-900 uppercase">{tenant.name}</div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">{tenant.gender}</div>
            <div className="mt-3 space-y-2">
              <a href={`tel:${tenant.phone}`} className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:text-violet-600 transition-colors">
                <Phone className="h-4 w-4 text-violet-500" /> {tenant.phone}
              </a>
              {tenant.email && (
                <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  <Mail className="h-4 w-4 text-violet-500" /> {tenant.email}
                </div>
              )}
            </div>
          </div>

          {/* Stay Details */}
          <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl shadow-sm p-5">
            <h3 className="mb-3 text-[10px] font-black uppercase tracking-wider text-neutral-900">Stay Details</h3>
            <div className="space-y-2">
              <Row label="PG" value={tenant.listing.title} />
              {tenant.room && <Row label="Room" value={`Room ${tenant.room.name.replace(/^Room\s+/i, "")}`} />}
              {tenant.bed  && <Row label="Bed"  value={`Bed ${tenant.bed.name.replace(/^Bed\s+/i, "")}`}   />}
              <Row label="Check-in"    value={formatDate(tenant.checkInDate)} />
              {tenant.checkOutDate && <Row label="Check-out" value={formatDate(tenant.checkOutDate)} />}
              <Row label="Rent Due Day" value={`${tenant.rentDueDay}th every month`} />
            </div>
          </div>

          {/* Money */}
          <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl shadow-sm p-5">
            <h3 className="mb-3 text-[10px] font-black uppercase tracking-wider text-neutral-900">Financials</h3>
            <div className="space-y-2">
              <Row label="Monthly Rent"     value={formatINR(tenant.monthlyRent)} />
              <Row label="Security Deposit" value={formatINR(tenant.securityDeposit)} />
              <Row label="Total Collected"  value={formatINR(totalPaid)} />
            </div>
            {due > 0 && (
              <div className="mt-4 rounded-xl bg-red-50/80 border border-red-200/60 p-3 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-red-600 font-bold uppercase tracking-wider">Pending (this month)</div>
                  <div className="text-lg font-black text-red-700 tracking-tight">{formatINR(due)}</div>
                </div>
                <a
                  href={buildRentReminderLink({ phone: tenant.phone, tenantName: tenant.name, ownerName, propertyName: tenant.listing.title, amount: due, month })}
                  target="_blank" rel="noreferrer"
                  className="btn-whatsapp text-[10px] uppercase tracking-wider px-3 py-2 font-black"
                >
                  WA Reminder
                </a>
              </div>
            )}
          </div>

          {/* Work / Education Verification */}
          <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl shadow-sm p-5">
            <h3 className="mb-3 text-[10px] font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              🎓 Work &amp; Education Verification
            </h3>
            <div className="space-y-2">
              <Row label="Occupation" value={tenant.occupation ? tenant.occupation.replace("_", " ") : "STUDENT"} />
              {tenant.workplace && <Row label="Company / Institute" value={tenant.workplace} />}
              {tenant.workplaceId && <Row label="ID / Roll No" value={tenant.workplaceId} />}
              {tenant.workplaceAddress && <Row label="Office/College Address" value={tenant.workplaceAddress} />}
            </div>
          </div>

          {/* KYC & Police Verification */}
          <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-900">KYC &amp; Police Verification</h3>
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm ${
                tenant.policeVerificationStatus === "VERIFIED" ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/60" :
                tenant.policeVerificationStatus === "PENDING" ? "bg-amber-50/80 text-amber-700 border-amber-200/60" :
                tenant.policeVerificationStatus === "REJECTED" ? "bg-red-50/80 text-red-700 border-red-200/60" :
                "bg-neutral-100/80 text-neutral-600 border-neutral-200/60"
              }`}>
                POLICE: {tenant.policeVerificationStatus ? tenant.policeVerificationStatus.replace("_", " ") : "NOT SUBMITTED"}
              </span>
            </div>
            <div className="space-y-2">
              {tenant.idType && <Row label={tenant.idType} value={tenant.idNumber ?? "—"} />}
              {tenant.policeVerificationRef && <Row label="Police Token/Ack Ref" value={tenant.policeVerificationRef} />}
              {tenant.bloodGroup && <Row label="Blood Group" value={tenant.bloodGroup} />}
            </div>
          </div>

          {/* Guardian & Emergency Details */}
          <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl shadow-sm p-5">
            <h3 className="mb-3 text-[10px] font-black uppercase tracking-wider text-neutral-900">Guardian &amp; Emergency Contact</h3>
            <div className="space-y-2">
              {tenant.guardianName && <Row label="Guardian" value={`${tenant.guardianName} ${tenant.guardianRelation ? `(${tenant.guardianRelation})` : ""}`} />}
              {tenant.guardianPhone && (
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider shrink-0">Guardian Phone</span>
                  <a href={`tel:${tenant.guardianPhone}`} className="text-xs font-black text-violet-700 hover:underline flex items-center gap-1 uppercase">
                    <Phone className="h-3 w-3" /> {tenant.guardianPhone}
                  </a>
                </div>
              )}
              {tenant.permanentAddress && <Row label="Permanent Address" value={tenant.permanentAddress} />}
              {tenant.vehicleType && tenant.vehicleType !== "NONE" && (
                <Row label="Vehicle" value={`${tenant.vehicleType.replace("_", " ")} ${tenant.vehicleNumber ? `(${tenant.vehicleNumber})` : ""}`} />
              )}
            </div>
          </div>

          {/* Actions */}
          <TenantActions tenantId={tenant.id} listingId={tenant.listingId} forMonth={month} monthlyRent={tenant.monthlyRent} />
        </div>

        {/* Right: History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rent Bills */}
          {tenant.rentBills.length > 0 && (
            <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl shadow-sm p-5">
              <h3 className="mb-4 text-[10px] font-black uppercase tracking-wider text-neutral-900">Rent Bills</h3>
              <div className="space-y-3">
                {tenant.rentBills.map((b) => {
                  const paid = b.payments.reduce((s, p) => s + p.amount, 0);
                  const balance = b.rentAmount + b.electricity + b.otherAmount + b.lateFee - paid;
                  return (
                    <div key={b.id} className="flex items-center justify-between rounded-xl bg-white/40 border border-neutral-200/60 shadow-sm px-4 py-3">
                      <div>
                        <div className="font-black text-xs text-neutral-900 tracking-tight uppercase">{formatMonth(b.forMonth)}</div>
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                          Rent {formatINR(b.rentAmount)}{b.electricity > 0 ? ` + Electricity ${formatINR(b.electricity)}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-black uppercase tracking-wider ${balance > 0 ? "text-red-600" : "text-emerald-700"}`}>
                          {balance > 0 ? `${formatINR(balance)} due` : "Paid ✓"}
                        </div>
                        <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">Due: {formatDate(b.dueDate)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment History */}
          <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl shadow-sm p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-900">Payment History</h3>
              <Link
                href={`/dashboard/manager/payments/new?tenantId=${tenant.id}`}
                className="text-[10px] font-black text-violet-700 hover:underline uppercase tracking-wider"
              >
                + Record Payment
              </Link>
            </div>
            {tenant.payments.length === 0 ? (
              <p className="py-4 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Koi payment nahi mila abhi tak.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-neutral-200/60 text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="pb-2 text-left">Date</th>
                      <th className="pb-2 text-left">Type</th>
                      <th className="pb-2 text-left">Method</th>
                      <th className="pb-2 text-left">Receipt</th>
                      <th className="pb-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/60">
                    {tenant.payments.map((p) => (
                      <tr key={p.id} className={p.voided ? "opacity-40" : "hover:bg-white/80 transition-colors"}>
                        <td className="py-2.5 text-[10px] font-bold text-neutral-600 uppercase tracking-wider">{formatDate(p.paidOn)}</td>
                        <td className="py-2.5 text-xs font-black uppercase tracking-tight text-neutral-900">{p.type}</td>
                        <td className="py-2.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{p.method}</td>
                        <td className="py-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{p.receiptNo ?? "—"}</td>
                        <td className="py-2.5 text-right font-black text-emerald-700">{formatINR(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Open Complaints */}
          {tenant.complaints.length > 0 && (
            <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl shadow-sm p-5">
              <h3 className="mb-3 text-[10px] font-black uppercase tracking-wider text-neutral-900">Open Complaints</h3>
              <div className="space-y-2">
                {tenant.complaints.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 rounded-xl bg-amber-50/80 border border-amber-200/60 shadow-sm p-3">
                    <StatusBadge status={c.priority} className="mt-0.5" />
                    <div>
                      <div className="text-xs font-black text-neutral-900 uppercase tracking-tight">{c.title}</div>
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">{c.category} · {formatDate(c.createdAt)}</div>
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
      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider shrink-0">{label}</span>
      <span className="text-xs font-black uppercase tracking-tight text-neutral-900 text-right">{value}</span>
    </div>
  );
}
