import Link from "next/link";
import { CheckCircle2, XCircle, Clock, AlertCircle, ShieldCheck, Sparkles } from "lucide-react";
import { db } from "@/lib/db";

export const metadata = { title: "Upgrade to Premium — PGSathi" };

/**
 * Owner upgrade page — now fully DB-driven (like the public /pricing page), so
 * everything shown here — price, tagline, features, coming-soon flags, the
 * "Recommended" highlight, the corner badge, limits — is controlled by the
 * super-admin from the Plans panel. Nothing on this page is hardcoded.
 */
export default async function UpgradePage() {
  const plans = await db.plan.findMany({
    where: { isActive: true, price: { gt: 0 } }, // paid plans only on the upgrade page
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-3">Trial Expired or No Active Plan</h1>
        <p className="text-neutral-500 max-w-xl mx-auto text-lg">
          Apne PGs manage karte rehne aur lead phone numbers unlock karne ke liye ek plan chunein.
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="text-center text-neutral-500 py-12">No plans available right now. Please contact support.</div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {plans.map((plan) => {
            const features = (plan.features as any[]) || [];
            const rec = plan.recommended;
            return (
              <div
                key={plan.id}
                className={
                  rec
                    ? "bg-neutral-900 rounded-3xl p-6 shadow-xl relative overflow-hidden ring-2 ring-primary-500 ring-offset-2"
                    : plan.badge
                    ? "bg-white rounded-3xl p-6 border-2 border-primary-300 shadow-md relative overflow-hidden"
                    : "bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm relative"
                }
              >
                {rec ? (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                    Recommended
                  </div>
                ) : plan.badge ? (
                  <div className="absolute top-0 right-0 bg-primary-100 text-primary-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                    {plan.badge}
                  </div>
                ) : null}

                <h3 className={`text-xl font-bold mb-2 flex items-center gap-2 ${rec ? "text-white" : "text-neutral-900"}`}>
                  {rec && <ShieldCheck className="text-primary-400" size={20} />}
                  {plan.name}
                </h3>
                {plan.tagline && (
                  <p className={`text-sm mb-6 ${rec ? "text-neutral-400" : "text-neutral-500"}`}>{plan.tagline}</p>
                )}

                <div className="mb-4">
                  <span className={`text-4xl font-extrabold ${rec ? "text-white" : "text-neutral-900"}`}>₹{plan.price}</span>
                  <span className="text-neutral-500 font-medium">/mo</span>
                  <span className="block text-xs text-neutral-400 font-semibold mt-0.5">GST included</span>
                </div>

                {/* Limits straight from the admin-controlled plan row */}
                <div className={`flex flex-wrap gap-2 mb-5 text-xs font-semibold ${rec ? "text-neutral-300" : "text-neutral-600"}`}>
                  <span className={`px-2 py-1 rounded-lg ${rec ? "bg-white/10" : "bg-neutral-100"}`}>
                    {plan.maxTenants === -1 ? "Unlimited" : plan.maxTenants} tenants
                  </span>
                  <span className={`px-2 py-1 rounded-lg ${rec ? "bg-white/10" : "bg-neutral-100"}`}>
                    {plan.maxListings === -1 ? "Unlimited" : plan.maxListings} PGs
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {features.map((feat: any, i: number) => (
                    <li key={i} className={`flex gap-3 text-sm ${rec ? "text-neutral-200" : "text-neutral-700"}`}>
                      {feat.comingSoon ? (
                        <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
                      ) : feat.included === false ? (
                        <XCircle size={18} className="text-neutral-300 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 size={18} className={`shrink-0 mt-0.5 ${rec ? "text-primary-400" : "text-green-500"}`} />
                      )}
                      <span className={feat.included === false && !feat.comingSoon ? "line-through text-neutral-400" : ""}>
                        {feat.name}
                        {feat.comingSoon && (
                          <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-500">(Coming Soon)</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/dashboard/owner/subscription/checkout?plan=${plan.slug}`}
                  className={
                    rec
                      ? "block w-full py-3 rounded-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 transition shadow-lg shadow-primary-500/25 text-center"
                      : "block w-full py-3 rounded-xl font-bold bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition text-center"
                  }
                >
                  Upgrade to {plan.name}
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center mt-10 flex items-center justify-center gap-2 text-sm text-neutral-500">
        <Sparkles size={14} className="text-primary-500" />
        All prices are GST-inclusive. Cancel anytime.
      </div>

      <div className="text-center mt-4">
        <p className="text-sm text-neutral-500">Need help or offline activation? <Link href="/contact" className="font-semibold text-primary-600">Contact Support</Link></p>
      </div>
    </div>
  );
}
