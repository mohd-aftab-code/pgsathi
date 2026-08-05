/**
 * app/(main)/dashboard/manager/payments/page.tsx
 * Payments list with filters.
 */
import Link from "next/link";
import { Plus, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { requireManagerAccess } from "@/lib/manager-auth";
import { StatusBadge } from "@/components/manage/StatusBadge";
import { EmptyState } from "@/components/manage/EmptyState";
import { WhatsAppReminderBtn } from "@/components/manage/WhatsAppReminderBtn";
import { VoidPaymentBtn } from "@/components/manage/VoidPaymentBtn";
import { formatINR, formatDate, currentMonth } from "@/lib/manage-utils";

export const metadata = { title: "Payments — PG Manager" };

export default async function PaymentsPage({
  searchParams,
}: { searchParams: Promise<{ month?: string; type?: string; page?: string }> }) {
  const sp      = await searchParams;
  const { userId } = await requireManagerAccess();
  const month   = sp.month ?? currentMonth();
  const type    = sp.type ?? "";
  const page    = parseInt(sp.page ?? "1");
  const limit   = 25;

  const where: any = { ownerId: userId, voided: false };
  if (month) where.forMonth = month;
  if (type)  where.type = type;

  const [payments, total, summary] = await Promise.all([
    db.pgPayment.findMany({
      where, orderBy: { paidOn: "desc" }, skip: (page-1)*limit, take: limit,
      include: { tenant: { select: { id: true, name: true, phone: true } } },
    }),
    db.pgPayment.count({ where }),
    db.pgPayment.aggregate({ where, _sum: { amount: true } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Payments</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">
            {total} payments · Total: <strong className="text-emerald-700">{formatINR(summary._sum.amount ?? 0)}</strong>
          </p>
        </div>
        <Link href="/dashboard/manager/payments/new" className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Record Payment
        </Link>
      </div>

      <form className="mb-6 flex flex-wrap gap-3">
        <input name="month" type="month" defaultValue={month} className="input-base max-w-[170px] bg-white shadow-sm rounded-xl" />
        <select name="type" defaultValue={type} className="input-base max-w-[160px] bg-white shadow-sm rounded-xl">
          <option value="">All Types</option>
          <option value="RENT">Rent</option>
          <option value="DEPOSIT">Deposit</option>
          <option value="ELECTRICITY">Electricity</option>
          <option value="LATE_FEE">Late Fee</option>
          <option value="OTHER">Other</option>
        </select>
        <button type="submit" className="btn-primary text-sm px-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">Filter</button>
      </form>

      {payments.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-md p-12 sm:p-16 rounded-2xl shadow-sm border border-neutral-200/60 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-50/30 pointer-events-none"></div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-violet-100/80 rounded-full flex items-center justify-center mx-auto mb-5 text-violet-600 relative z-10 shadow-sm border border-violet-200/60">
            <Wallet size={32} />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mb-2 relative z-10 tracking-tight">No payments found</h3>
          <p className="text-neutral-500 max-w-md mx-auto text-xs sm:text-sm font-medium relative z-10 mb-8">No payments recorded for this month yet.</p>
          <Link href="/dashboard/manager/payments/new" className="btn-primary px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all relative z-10 inline-flex">
            Record Payment
          </Link>
        </div>
      ) : (
        <div className="mt-4 bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto pb-8 md:px-1 md:-mx-1">
            <table className="w-full text-sm text-left border-separate border-spacing-y-2 hidden md:table">
              <thead className="bg-white/40 border-b border-neutral-200/60">
                <tr className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">
                  <th className="px-6 py-3">Tenant</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Receipt</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Remind</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/80 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/manager/tenants/${p.tenantId}`} className="text-xs font-black text-violet-700 hover:underline block mb-0.5">
                        {p.tenant.name}
                      </Link>
                      <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{p.tenant.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status} />
                      <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-1">{p.type}</div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{p.method}</td>
                    <td className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{p.receiptNo ?? "—"}</td>
                    <td className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{formatDate(p.paidOn)}</td>
                    <td className="px-6 py-4 text-right text-xs font-black text-emerald-700">{formatINR(p.amount)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <WhatsAppReminderBtn
                          phone={p.tenant.phone || ""}
                          tenantName={p.tenant.name}
                          amount={p.amount}
                          month={p.forMonth || month}
                          type={p.type}
                        />
                        {!p.voided && <VoidPaymentBtn paymentId={p.id} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="md:hidden flex flex-col space-y-4 p-4">
              {payments.map((p) => (
                <div key={p.id} className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-neutral-200/60 shadow-sm flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/dashboard/manager/tenants/${p.tenantId}`} className="font-black text-neutral-900 hover:underline block text-sm">
                        {p.tenant.name}
                      </Link>
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{p.tenant.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-700">{formatINR(p.amount)}</div>
                      <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">{formatDate(p.paidOn)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-white/40 p-3 rounded-xl border border-neutral-200/60">
                    <div>
                      <span className="font-bold text-neutral-400 block mb-1 uppercase tracking-wider">Type & Method</span>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <StatusBadge status={p.status} />
                      </div>
                      <span className="font-bold text-neutral-600 uppercase tracking-wider block">{p.type} via {p.method}</span>
                    </div>
                    <div className="flex flex-col items-end justify-center">
                      <div className="flex gap-2">
                        <WhatsAppReminderBtn
                          phone={p.tenant.phone || ""}
                          tenantName={p.tenant.name}
                          amount={p.amount}
                          month={p.forMonth || month}
                          type={p.type}
                        />
                        {!p.voided && <VoidPaymentBtn paymentId={p.id} />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
