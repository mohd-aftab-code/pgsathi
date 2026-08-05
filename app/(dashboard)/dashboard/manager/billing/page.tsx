/**
 * app/(main)/dashboard/manager/billing/page.tsx
 * Rent billing generation and tracking page.
 */
import { db } from "@/lib/db";
import { requireManagerAccess } from "@/lib/manager-auth";
import { formatINR, formatMonth, currentMonth } from "@/lib/manage-utils";
import { FileText, Play } from "lucide-react";
import { EmptyState } from "@/components/manage/EmptyState";
import { MonthFilterInput } from "@/components/manage/MonthFilterInput";
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
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Rent Bills</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">
            Total Billed: <strong className="text-neutral-700">{formatINR(totalBilled)}</strong> · Due: <strong className="text-red-600">{formatINR(totalDue)}</strong>
          </p>
        </div>
        <GenerateBillsButton currentMonth={month} />
      </div>

      <form className="mb-5 flex gap-3">
        <MonthFilterInput defaultValue={month} />
      </form>

      {bills.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
          <EmptyState
            icon={FileText}
            title={`${formatMonth(month)} ke bills generate nahi hue`}
            description="Upar 'Generate Bills' pe click karein."
          />
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/40 border-b border-neutral-200/60">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-neutral-500">Bill No / Tenant</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider font-bold text-neutral-500">Rent + Other</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider font-bold text-neutral-500">Paid</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider font-bold text-neutral-500">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60">
                {bills.map((b) => {
                  const billTotal = b.rentAmount + b.electricity + b.otherAmount + b.lateFee;
                  const paid = b.payments.reduce((s, p) => s + p.amount, 0);
                  const bal  = Math.max(0, billTotal - paid);
                  return (
                    <tr key={b.id} className="hover:bg-white/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-xs font-black text-neutral-900">{b.tenant.name}</div>
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">{b.billNo} · {b.tenant.listing.title}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-neutral-600">
                        {formatINR(billTotal)}
                        {(b.electricity > 0 || b.otherAmount > 0) && <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">incl. extras</div>}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-black text-emerald-700">{formatINR(paid)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className={`text-xs font-black ${bal > 0 ? "text-red-600" : "text-emerald-600"}`}>
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
