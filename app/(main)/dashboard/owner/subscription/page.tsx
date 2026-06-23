import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreditCard, CheckCircle2, ShieldCheck, Zap, AlertTriangle, CalendarDays } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">My Subscription</h1>
        <p className="text-neutral-500 mt-1">Manage your billing, view plan details, and upgrade.</p>
      </div>

      {!activeSub ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-neutral-200">
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">No Active Subscription</h2>
          <p className="text-neutral-500 max-w-md mx-auto mb-8">
            You are currently on the Free Basic Tier. Upgrade to a premium plan to list more PGs and get priority ranking.
          </p>
          <Link href="/pricing" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-orange-500/30 transition-all inline-block">
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
            <div className="bg-neutral-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
              <h3 className="font-bold text-lg mb-2 relative z-10">Need more features?</h3>
              <p className="text-sm text-neutral-400 mb-6 relative z-10">Upgrade to a higher tier to add more PGs and get WhatsApp Lead Alerts.</p>
              <Link href="/pricing" className="block w-full bg-white text-neutral-900 text-center font-bold py-3 rounded-xl hover:bg-neutral-100 transition-colors relative z-10">
                Upgrade Plan
              </Link>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm">
              <h3 className="font-bold text-neutral-900 mb-4">Payment Method</h3>
              <div className="flex items-center gap-3 p-3 border border-neutral-200 rounded-xl bg-neutral-50 mb-4">
                <CreditCard className="text-neutral-400" />
                <div>
                  <div className="text-sm font-bold text-neutral-900">Card ending in ••••</div>
                  <div className="text-xs text-neutral-500">Razorpay Secured</div>
                </div>
              </div>
              <button className="text-sm font-bold text-red-600 hover:text-red-700 w-full text-left py-2 border-t border-neutral-100 mt-2">
                Cancel Subscription
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
