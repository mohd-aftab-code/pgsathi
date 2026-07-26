import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreditCard, CheckCircle2, ShieldCheck, Zap, AlertTriangle, CalendarDays, Phone, Mail, Receipt } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cycleLabel } from "@/lib/billing";

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const metadata = {
  title: "My Subscription - PGSathi",
};

export default async function OwnerSubscriptionPage() {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") {
    redirect("/dashboard");
  }

  const userId = parseInt(session.user.id);

  // Fetch the active subscription
  const activeSub = await db.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE"
    },
    include: {
      plan: true,
    },
    orderBy: {
      endDate: "desc"
    }
  });

  // Every payment this owner has made. Reading from invoices rather than
  // subscriptions means a renewal shows as its own line instead of overwriting
  // the previous one.
  const invoices = await db.invoice.findMany({
    where: { subscription: { userId } },
    orderBy: { invoiceDate: "desc" },
    take: 24,
    select: {
      id: true, amount: true, status: true, invoiceDate: true, paidAt: true,
      billingCycle: true, periodStart: true, periodEnd: true, razorpayPayId: true,
      subscription: { select: { plan: { select: { name: true } } } },
    },
  });

  // A payment that went through but left no active plan. This is the case an
  // owner has no way to diagnose on their own — they were charged and nothing
  // happened — so it gets called out explicitly with a way to reach support.
  const paidButNotActive =
    !activeSub && invoices.some((i) => i.status === "PAID" && i.amount > 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">My Subscription</h1>
        <p className="text-neutral-500 mt-1">Manage your billing, view plan details, and upgrade.</p>
      </div>

      {/* Charged but no live plan. The owner cannot fix this themselves and has
          no way to even tell what went wrong, so say it plainly and give them a
          direct line rather than leaving them to guess. */}
      {paidButNotActive && (
        <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div className="min-w-0">
              <h3 className="font-bold text-amber-900">Payment hua hai, par plan abhi active nahi dikh raha</h3>
              <p className="text-sm text-amber-800 mt-1">
                Aapka payment record mein hai lekin koi plan chalu nahi hai. Aksar ye bas thodi der ka
                matter hota hai — page refresh karke dekhiye. Phir bhi na chale to <b>paisa kaha nahi
                jaata</b>, hamari team turant theek kar degi.
              </p>
              <p className="text-xs text-amber-700 mt-2">
                Baat karte waqt niche wali payment history se date aur amount bata dijiyega — kaam jaldi ho jayega.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <a href="tel:+919696110243" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold">
                  <Phone size={14} /> +91 9696110243
                </a>
                <a href="mailto:pgsathi.support@gmail.com?subject=Payment%20hua%20par%20plan%20active%20nahi" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border-2 border-amber-300 text-amber-800 text-sm font-bold">
                  <Mail size={14} /> Email karein
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {!activeSub ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-neutral-200">
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">No Active Subscription</h2>
          <p className="text-neutral-500 max-w-md mx-auto mb-8">
            You are currently on the Free Basic Tier. Upgrade to a premium plan to list more PGs and get priority ranking.
          </p>
          <Link href="/dashboard/owner/subscription/upgrade" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-orange-500/30 transition-all inline-block">
            View Pricing Plans
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Plan Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200 shadow-sm relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-200/40 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    <CheckCircle2 size={14} /> ACTIVE PLAN
                  </div>
                  <h2 className="text-3xl font-black text-green-950">{activeSub.plan.name} Plan</h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-green-900">₹{activeSub.amount}</div>
                  <div className="text-sm font-medium text-green-700">/{activeSub.billingCycle.toLowerCase()}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                <div className="bg-white/60 p-4 rounded-2xl">
                  <div className="text-sm text-green-800 font-medium mb-1 flex items-center gap-2">
                    <CalendarDays size={16} /> Current Period Starts
                  </div>
                  <div className="font-bold text-green-950">{format(new Date(activeSub.startDate), 'dd MMM yyyy')}</div>
                </div>
                <div className="bg-white/60 p-4 rounded-2xl">
                  <div className="text-sm text-green-800 font-medium mb-1 flex items-center gap-2">
                    <CalendarDays size={16} /> Next Billing Date
                  </div>
                  <div className="font-bold text-green-950">{format(new Date(activeSub.endDate), 'dd MMM yyyy')}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Plan Features Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="font-medium text-neutral-700">Verified Badge</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Zap size={16} />
                  </div>
                  <span className="font-medium text-neutral-700">Up to {activeSub.plan.maxListings} Listings</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <CreditCard size={16} />
                  </div>
                  <span className="font-medium text-neutral-700">Zero Brokerage Fees</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <div className="bg-neutral-900 rounded-3xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
              <h3 className="font-bold text-lg mb-2 relative z-10">Need more features?</h3>
              <p className="text-sm text-neutral-400 mb-6 relative z-10">Upgrade to a higher tier to add more PGs and get WhatsApp Lead Alerts.</p>
              <Link href="/dashboard/owner/subscription/upgrade" className="block w-full bg-white text-neutral-900 text-center font-bold py-3 rounded-xl hover:bg-neutral-100 transition-colors relative z-10">
                Upgrade Plan
              </Link>
            </div>

            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-neutral-200 shadow-sm">
              <h3 className="font-bold text-neutral-900 mb-4">Payment Method</h3>
              <div className="flex items-center gap-3 p-3 border border-neutral-200 rounded-xl bg-neutral-50 mb-4">
                <CreditCard className="text-neutral-400" />
                <div>
                  <div className="text-sm font-bold text-neutral-900">Card ending in ••••</div>
                  <div className="text-xs text-neutral-500">Razorpay Secured</div>
                </div>
              </div>
              {/* Self-service cancellation removed — a subscription is not ended
                  from here. Anything to do with billing goes through the team so
                  it can be checked and handled properly. */}
              <div className="border-t border-neutral-100 pt-4">
                <p className="text-sm font-bold text-neutral-900 mb-1">Plan ya billing me koi problem?</p>
                <p className="text-xs text-neutral-500 mb-3">
                  Plan yahan se cancel nahi hota. Koi bhi sawaal ya dikkat ho to hamari team se
                  seedha baat karein — hum turant help karenge.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="tel:+919696110243"
                    className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold transition-colors"
                  >
                    <Phone size={15} /> Call karein
                  </a>
                  <a
                    href="mailto:pgsathi.support@gmail.com?subject=Subscription%20Support"
                    className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-sm font-bold transition-colors"
                  >
                    <Mail size={15} /> Email karein
                  </a>
                </div>
                <p className="text-[11px] text-neutral-400 mt-2.5">
                  Support: +91 9696110243 · pgsathi.support@gmail.com
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Payment history. One row per payment, so a renewal is its own line and
          the owner can always see exactly what they were charged and when. */}
      <div className="mt-8 bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-neutral-100">
          <h3 className="font-bold text-neutral-900">Payment History</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Aapke saare payments. Kisi bhi dikkat par team ko yahi detail bata dijiye.
          </p>
        </div>

        {invoices.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Receipt className="mx-auto text-neutral-300 mb-2" size={28} />
            <p className="text-sm font-bold text-neutral-700">Abhi koi payment nahi</p>
            <p className="text-xs text-neutral-500 mt-1">
              Plan lene par har payment yahan record ho jayega.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[620px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-400 bg-neutral-50">
                  <th className="px-5 sm:px-6 py-3 font-bold">Date</th>
                  <th className="px-3 py-3 font-bold">Plan</th>
                  <th className="px-3 py-3 font-bold">Period</th>
                  <th className="px-3 py-3 font-bold text-right">Amount</th>
                  <th className="px-5 sm:px-6 py-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {invoices.map((inv) => {
                  const failed = inv.status !== "PAID" && inv.status !== "FREE";
                  return (
                    <tr key={inv.id} className="hover:bg-neutral-50">
                      <td className="px-5 sm:px-6 py-3 text-neutral-700">
                        {fmtDate(inv.paidAt ?? inv.invoiceDate)}
                        {inv.razorpayPayId && (
                          <div className="text-[10px] text-neutral-400 truncate max-w-[150px]">{inv.razorpayPayId}</div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-neutral-700">
                        {inv.subscription.plan.name}
                        <div className="text-[11px] text-neutral-400">{cycleLabel(inv.billingCycle)}</div>
                      </td>
                      <td className="px-3 py-3 text-neutral-500 text-xs">
                        {inv.periodStart && inv.periodEnd
                          ? `${fmtDate(inv.periodStart)} – ${fmtDate(inv.periodEnd)}`
                          : "—"}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-neutral-900">
                        ₹{inv.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 sm:px-6 py-3 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                            failed
                              ? "bg-red-50 text-red-700"
                              : inv.amount === 0
                                ? "bg-neutral-100 text-neutral-500"
                                : "bg-green-50 text-green-700"
                          }`}
                        >
                          {failed ? "FAILED" : inv.amount === 0 ? "FREE" : "PAID"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {invoices.some((i) => i.status !== "PAID" && i.status !== "FREE") && (
          <div className="px-5 sm:px-6 py-3 border-t border-neutral-100 bg-red-50/50 text-xs text-red-700">
            Koi payment fail dikh raha hai? Agar aapke account se paisa kata hai to woh 5–7 working
            din mein apne aap wapas aa jaata hai. Jaldi chahiye to team ko call kar lijiye.
          </div>
        )}
      </div>
    </div>
  );
}
