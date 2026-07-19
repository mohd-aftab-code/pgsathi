import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, Home } from "lucide-react";
import { PrintReceiptButton } from "@/components/manage/PrintReceiptButton";

export const metadata = { title: "Rent Receipt - PGSathi" };

export default async function ReceiptDetailPage({ params }: { params: Promise<{ billId: string }> }) {
  const { billId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = parseInt(session.user.id);

  const bill = await db.pgRentBill.findUnique({
    where: { id: parseInt(billId) },
    include: {
      payments: { orderBy: { paidOn: "asc" } },
      tenant: { include: { listing: { select: { title: true, address: true } } } },
    },
  });
  if (!bill) redirect("/dashboard/tenant/receipts");

  // Ownership — the bill's tenant must be linked to the logged-in user (no billId enumeration).
  const user = await db.user.findUnique({ where: { id: userId }, select: { phone: true, email: true } });
  const owns =
    bill.tenant.userId === userId ||
    (!!user?.phone && bill.tenant.phone === user.phone) ||
    (!!user?.email && !!bill.tenant.email && bill.tenant.email === user.email);
  if (!owns) redirect("/dashboard/tenant/receipts");

  const paid = bill.payments.filter((p) => !p.voided && p.status === "PAID");
  const totalPaid = paid.reduce((s, p) => s + p.amount, 0);
  const totalDue = bill.rentAmount + bill.electricity + bill.otherAmount + bill.lateFee;
  const balance = Math.max(0, totalDue - totalPaid);
  const status = totalPaid >= totalDue ? "PAID" : totalPaid > 0 ? "PARTIALLY PAID" : "PENDING";
  const statusCls =
    status === "PAID"
      ? "bg-green-100 text-green-700 border-green-300"
      : status === "PARTIALLY PAID"
      ? "bg-orange-100 text-orange-700 border-orange-300"
      : "bg-red-100 text-red-700 border-red-300";
  const formattedMonth = new Date(bill.forMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const rows = [
    { label: "Base Rent", val: bill.rentAmount },
    ...(bill.electricity > 0 ? [{ label: "Electricity", val: bill.electricity }] : []),
    ...(bill.otherAmount > 0 ? [{ label: "Other Charges", val: bill.otherAmount }] : []),
    ...(bill.lateFee > 0 ? [{ label: "Late Fee", val: bill.lateFee }] : []),
  ];

  return (
    <div>
      <style>{`@media print {
        header, aside, nav, .no-print { display: none !important; }
        body, .min-h-screen { background: #fff !important; }
        .receipt-card { box-shadow: none !important; border-color: #ddd !important; }
      }`}</style>

      <div className="no-print mb-5 flex items-center justify-between gap-3">
        <Link href="/dashboard/tenant/receipts" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-violet-700">
          <ArrowLeft size={16} /> All receipts
        </Link>
        <PrintReceiptButton />
      </div>

      <div className="receipt-card max-w-2xl mx-auto bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-7 py-6 border-b border-neutral-200 flex items-start justify-between gap-4 bg-neutral-50/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-lg bg-violet-600 text-white grid place-items-center font-extrabold">P</span>
              <span className="text-lg font-extrabold text-neutral-900 tracking-tight">PGSathi</span>
            </div>
            <p className="text-xs text-neutral-500">Rent Receipt {bill.billNo ? `· ${bill.billNo}` : `· #${bill.id}`}</p>
          </div>
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${statusCls}`}>{status}</span>
        </div>

        {/* Parties */}
        <div className="px-7 py-5 grid sm:grid-cols-2 gap-5 border-b border-neutral-100">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-400 mb-1 flex items-center gap-1"><Home size={12} /> Property</div>
            <div className="font-bold text-neutral-900">{bill.tenant.listing.title}</div>
            {bill.tenant.listing.address && <div className="text-sm text-neutral-500 mt-0.5">{bill.tenant.listing.address}</div>}
          </div>
          <div className="sm:text-right">
            <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-400 mb-1">Billed To</div>
            <div className="font-bold text-neutral-900">{bill.tenant.name}</div>
            <div className="text-sm text-neutral-500 mt-0.5">{bill.tenant.phone}</div>
          </div>
        </div>

        {/* Period */}
        <div className="px-7 py-3 flex items-center justify-between text-sm border-b border-neutral-100 bg-violet-50/40">
          <span className="text-neutral-500">Billing Month</span>
          <span className="font-bold text-neutral-900">{formattedMonth}</span>
        </div>

        {/* Line items */}
        <div className="px-7 py-5">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-neutral-100">
                  <td className="py-2.5 text-neutral-600">{r.label}</td>
                  <td className="py-2.5 text-right font-medium text-neutral-900 tabular-nums">{inr(r.val)}</td>
                </tr>
              ))}
              <tr className="border-b-2 border-neutral-200">
                <td className="py-3 font-bold text-neutral-900">Total Bill</td>
                <td className="py-3 text-right font-extrabold text-neutral-900 text-lg tabular-nums">{inr(totalDue)}</td>
              </tr>
              <tr>
                <td className="py-2.5 text-green-700 font-semibold">Amount Paid</td>
                <td className="py-2.5 text-right font-bold text-green-700 tabular-nums">{inr(totalPaid)}</td>
              </tr>
              {balance > 0 && (
                <tr>
                  <td className="py-2.5 text-red-600 font-semibold">Balance Due</td>
                  <td className="py-2.5 text-right font-bold text-red-600 tabular-nums">{inr(balance)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Payments */}
        {paid.length > 0 && (
          <div className="px-7 pb-5">
            <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-400 mb-2">Payments Received</div>
            <div className="rounded-xl border border-neutral-200 divide-y divide-neutral-100">
              {paid.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                    <span className="text-neutral-700">{format(new Date(p.paidOn), "dd MMM yyyy")}</span>
                    <span className="text-[10px] font-bold uppercase text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">{p.method}</span>
                    {p.receiptNo && <span className="text-xs text-neutral-400">#{p.receiptNo}</span>}
                  </div>
                  <span className="font-bold text-neutral-900 tabular-nums">{inr(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-7 py-4 border-t border-neutral-100 bg-neutral-50/60 text-center">
          <p className="text-[11px] text-neutral-400">
            Computer-generated receipt via PGSathi · Due {format(new Date(bill.dueDate), "dd MMM yyyy")}
          </p>
        </div>
      </div>
    </div>
  );
}
