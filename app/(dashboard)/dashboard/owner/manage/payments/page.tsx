/**
 * app/(main)/dashboard/owner/manage/payments/page.tsx
 * Payments list with filters.
 */
import Link from "next/link";
import { Plus, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { requireManageAccess } from "@/lib/manage-auth";
import { StatusBadge } from "@/components/manage/StatusBadge";
import { EmptyState } from "@/components/manage/EmptyState";
import { formatINR, formatDate, currentMonth } from "@/lib/manage-utils";

export const metadata = { title: "Payments — PG Manager" };

export default async function PaymentsPage({
  searchParams,
}: { searchParams: Promise<{ month?: string; type?: string; page?: string }> }) {
  const sp      = await searchParams;
  const { userId } = await requireManageAccess();
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
          <h1 className="text-2xl font-extrabold text-neutral-900">Payments</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {total} payments · Total: <strong>{formatINR(summary._sum.amount ?? 0)}</strong>
          </p>
        </div>
        <Link href="/dashboard/owner/manage/payments/new" className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Record Payment
        </Link>
      </div>

      <form className="mb-5 flex flex-wrap gap-3">
        <input name="month" type="month" defaultValue={month} className="input-base max-w-[170px]" />
        <select name="type" defaultValue={type} className="input-base max-w-[160px]">
          <option value="">All Types</option>
          <option value="RENT">Rent</option>
          <option value="DEPOSIT">Deposit</option>
          <option value="ELECTRICITY">Electricity</option>
          <option value="LATE_FEE">Late Fee</option>
          <option value="OTHER">Other</option>
        </select>
        <button type="submit" className="btn-primary text-sm px-5">Filter</button>
      </form>

      {payments.length === 0 ? (
        <div className="card">
          <EmptyState icon={Wallet} title="Koi payment nahi" description="Is mahine koi payment record nahi hui abhi tak." actionLabel="Record Payment" actionHref="/dashboard/owner/manage/payments/new" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Tenant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase hidden sm:table-cell">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase hidden md:table-cell">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase hidden md:table-cell">Receipt</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/owner/manage/tenants/${p.tenantId}`} className="font-semibold text-primary-700 hover:underline">
                        {p.tenant.name}
                      </Link>
                      <div className="text-xs text-neutral-400">{p.tenant.phone}</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <StatusBadge status={p.status} />
                      <div className="text-xs text-neutral-400 mt-0.5">{p.type}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-neutral-600">{p.method}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-neutral-400">{p.receiptNo ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-600">{formatDate(p.paidOn)}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-700">{formatINR(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
