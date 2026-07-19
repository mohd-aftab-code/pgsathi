import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Receipt, Calendar, Download, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const metadata = { title: "Rent Receipts - Tenant Dashboard" };

export default async function TenantReceiptsPage({
  searchParams
}: {
  searchParams: Promise<{ tenantId?: string }>
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = parseInt(session.user.id);

  const resolvedParams = await searchParams;

  // Reliable identity link first (PgTenant.userId), then legacy phone/email match —
  // fixes the old inconsistency where the dashboard used userId but receipts used phone/email.
  const user = await db.user.findUnique({ where: { id: userId }, select: { phone: true, email: true } });
  const orClauses: any[] = [{ userId }];
  if (user?.phone) orClauses.push({ phone: user.phone });
  if (user?.email) orClauses.push({ email: user.email });

  const tenants = await db.pgTenant.findMany({ where: { OR: orClauses }, select: { id: true } });

  let bills: any[] = [];
  if (tenants.length > 0) {
    let tenantIds = tenants.map((t) => t.id);

    if (resolvedParams.tenantId) {
      const tId = parseInt(resolvedParams.tenantId);
      if (tenantIds.includes(tId)) tenantIds = [tId];
    }

    bills = await db.pgRentBill.findMany({
      where: { tenantId: { in: tenantIds } },
      include: {
        payments: true,
        tenant: { include: { listing: { select: { title: true } } } },
      },
      orderBy: [{ forMonth: "desc" }, { dueDate: "desc" }],
    });
  }

  const getBillStatus = (bill: any) => {
    const totalPaid = bill.payments.reduce((sum: number, p: any) => p.status === "PAID" ? sum + p.amount : sum, 0);
    const totalDue = bill.rentAmount + bill.electricity + bill.otherAmount + bill.lateFee;
    
    if (totalPaid >= totalDue) return "PAID";
    if (totalPaid > 0) return "PARTIAL";
    return "PENDING";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
      case 'PARTIAL': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'PENDING': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <div>
      <div className="mb-6 lg:mb-8 border-b border-neutral-200 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <Receipt className="text-violet-600" /> Rent Receipts
          </h1>
          <p className="text-sm text-neutral-500 mt-1">View your monthly rent bills and payment history.</p>
        </div>
        {resolvedParams.tenantId && (
          <Link href="/dashboard/tenant/receipts" className="text-sm font-medium text-violet-600 hover:text-violet-700 underline underline-offset-2">
            View All Bookings
          </Link>
        )}
      </div>

      {bills.length === 0 ? (
        <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-sm border border-neutral-200 text-center">
          <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt size={32} className="text-violet-300" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">No Rent Bills Found</h2>
          <p className="text-neutral-500 max-w-md mx-auto">
            Your PG owner or manager hasn't generated any rent bills for you yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {bills.map((bill) => {
            const status = getBillStatus(bill);
            const totalDue = bill.rentAmount + bill.electricity + bill.otherAmount + bill.lateFee;
            const totalPaid = bill.payments.reduce((sum: number, p: any) => p.status === "PAID" ? sum + p.amount : sum, 0);
            const formattedMonth = new Date(bill.forMonth + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            return (
              <div key={bill.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col group">
                <div className="p-5 border-b border-neutral-100 flex items-start justify-between bg-neutral-50/50">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg mb-1">{formattedMonth}</h3>
                    <p className="text-sm text-neutral-500 line-clamp-1">{bill.tenant.listing.title}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${getStatusColor(status)}`}>
                    {status}
                  </span>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between mb-2">
                    <span className="text-neutral-500 text-sm">Base Rent</span>
                    <span className="font-medium text-neutral-900">₹{bill.rentAmount.toLocaleString()}</span>
                  </div>
                  {bill.electricity > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-neutral-500 text-sm">Electricity</span>
                      <span className="font-medium text-neutral-900">₹{bill.electricity.toLocaleString()}</span>
                    </div>
                  )}
                  {(bill.otherAmount > 0 || bill.lateFee > 0) && (
                    <div className="flex justify-between mb-2">
                      <span className="text-neutral-500 text-sm">Other/Late Fee</span>
                      <span className="font-medium text-neutral-900">₹{(bill.otherAmount + bill.lateFee).toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-neutral-100 my-3 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-neutral-900">Total Bill</span>
                    <span className="font-bold text-lg text-neutral-900">₹{totalDue.toLocaleString()}</span>
                  </div>
                  
                  {status !== 'PENDING' && (
                    <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-lg mt-1 mb-2">
                      <span className="text-green-700 text-sm font-medium flex items-center gap-1.5">
                        <CheckCircle2 size={16} /> Paid Amount
                      </span>
                      <span className="font-bold text-green-700">₹{totalPaid.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="mt-auto pt-4 flex items-center justify-between text-sm">
                    <span className="text-neutral-500 flex items-center gap-1.5">
                      <Calendar size={14} /> Due: {format(new Date(bill.dueDate), 'dd MMM yyyy')}
                    </span>
                    
                    <Link
                      href={`/dashboard/tenant/receipts/${bill.id}`}
                      className="text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1"
                    >
                      <Download size={14} /> View / Print
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
