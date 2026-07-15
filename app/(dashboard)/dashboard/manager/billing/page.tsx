/**
 * app/(main)/dashboard/manager/billing/page.tsx
 * Rent billing generation and tracking page.
 */
import { db } from "@/lib/db";
import { requireManagerAccess } from "@/lib/manager-auth";
import { formatINR, formatMonth, currentMonth } from "@/lib/manage-utils";
import { FileText, Play } from "lucide-react";
import { EmptyState } from "@/components/manage/EmptyState";
import { GenerateBillsButton } from "./GenerateBillsButton";
import Link from "next/link";

export const metadata = { title: "Billing — PG Manager" };

export default async function BillingPage({
  searchParams,
}: { searchParams: Promise<{ month?: string }> }) {
  const sp = await searchParams;
  const { userId } = await requireManagerAccess();
  const month = sp.month ?? currentMonth();

  const bills = await db.pgRentBill.findMany({
    where: { ownerId: userId, forMonth: month },
    include: {
      tenant: { select: { name: true, phone: true, listing: { select: { title: true } } } },
      payments: { where: { type: "RENT", voided: false }, select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalBilled = bills.reduce((s, b) => s + b.rentAmount + b.electricity + b.otherAmount + b.lateFee, 0);
  const totalPaid   = bills.reduce((s, b) => s + b.payments.reduce((ps, p) => ps + p.amount, 0), 0);
  const totalDue    = Math.max(0, totalBilled - totalPaid);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Rent Bills</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Total Billed: <strong>{formatINR(totalBilled)}</strong> · Due: <strong className="text-red-600">{formatINR(totalDue)}</strong>
          </p>
        </div>
        <GenerateBillsButton currentMonth={month} />
      </div>

      <form className="mb-5 flex gap-3">
        <input type="month" name="month" defaultValue={month} className="input-base max-w-[170px]" onChange={(e) => e.currentTarget.form?.requestSubmit()} />
      </form>

      {bills.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title={`${formatMonth(month)} ke bills generate nahi hue`}
            description="Upar 'Generate Bills' pe click karein."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">Bill No / Tenant</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Rent + Other</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Paid</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {bills.map((b) => {
                  const billTotal = b.rentAmount + b.electricity + b.otherAmount + b.lateFee;
                  const paid = b.payments.reduce((s, p) => s + p.amount, 0);
                  const bal  = Math.max(0, billTotal - paid);
                  return (
                    <tr key={b.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-neutral-900">{b.tenant.name}</div>
                        <div className="text-xs text-neutral-400">{b.billNo} · {b.tenant.listing.title}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-600">
                        {formatINR(billTotal)}
                        {(b.electricity > 0 || b.otherAmount > 0) && <div className="text-xs text-neutral-400">incl. extras</div>}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-green-700">{formatINR(paid)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className={`font-bold ${bal > 0 ? "text-red-600" : "text-green-600"}`}>
                          {bal > 0 ? formatINR(bal) : "Paid"}
                        </div>
                        {bal > 0 && (
                          <Link
                            href={`/dashboard/manager/payments/new?tenantId=${b.tenantId}`}
                            className="text-[10px] font-bold text-violet-600 hover:underline inline-block mt-1"
                          >
                            + Record Payment
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
