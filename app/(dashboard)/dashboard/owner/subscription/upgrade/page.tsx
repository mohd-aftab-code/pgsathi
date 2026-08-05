import Link from "next/link";
import { CheckCircle2, XCircle, Clock, AlertCircle, ShieldCheck, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import {
  BILLING_CYCLES, CYCLE_META, cycleSavingPercent, effectiveMonthly,
  isValidCycle, priceForCycle, type CycleId,
} from "@/lib/billing";

export const metadata = { title: "Upgrade to Premium — PGSathi" };

/**
 * Owner upgrade page — now fully DB-driven (like the public /pricing page), so
 * everything shown here — price, tagline, features, coming-soon flags, the
 * "Recommended" highlight, the corner badge, limits — is controlled by the
 * super-admin from the Plans panel. Nothing on this page is hardcoded.
 */
export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ cycle?: string }>;
}) {
  const plans = await db.plan.findMany({
    where: { isActive: true, price: { gt: 0 } }, // paid plans only on the upgrade page
    orderBy: { sortOrder: "asc" },
  });

  // Duration is a link, not client state — the page stays a server component and
  // the choice survives a refresh or a shared URL.
  const { cycle: cycleParam } = await searchParams;
  const cycle: CycleId = isValidCycle(cycleParam) ? cycleParam : "MONTHLY";
  // Only offer durations at least one plan actually prices.
  const offered = BILLING_CYCLES.filter((c) => plans.some((p) => priceForCycle(p, c) !== null));

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

      {/* Duration switcher — plain links, so this page stays a server component. */}
      {offered.length > 1 && (
        <div className="flex justify-center mb-10">
          <div className="inline-flex flex-wrap justify-center gap-1 p-1 rounded-2xl bg-neutral-100">
            {offered.map((c) => {
              const on = c === cycle;
              const best = Math.max(...plans.map((p) => cycleSavingPercent(p, c)));
              return (
                <Link
                  key={c}
                  href={`/dashboard/owner/subscription/upgrade?cycle=${c}`}
                  className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                    on ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {CYCLE_META[c].label}
                  {best > 0 && (
                    <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-100 text-green-700">
                      {best}% off
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

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
                    ? "bg-neutral-900 rounded-3xl p-6 shadow-xl relative overflow-hidden ring-2 ring-violet-500 ring-offset-2"
                    : plan.badge
                    ? "bg-white/60 backdrop-blur-md rounded-3xl p-6 border-2 border-violet-300 shadow-md relative overflow-hidden"
                    : "bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-neutral-200/60 shadow-sm relative"
                }
              >
                {rec ? (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-600 to-violet-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                    Recommended
                  </div>
                ) : plan.badge ? (
                  <div className="absolute top-0 right-0 bg-violet-100 text-violet-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg border-b border-l border-violet-200">
                    {plan.badge}
                  </div>
                ) : null}

                <h3 className={`text-xl font-bold mb-2 flex items-center gap-2 ${rec ? "text-white" : "text-neutral-900"}`}>
                  {rec && <ShieldCheck className="text-violet-400" size={20} />}
                  {plan.name}
                </h3>
                {plan.tagline && (
                  <p className={`text-sm mb-6 ${rec ? "text-neutral-400" : "text-neutral-500"}`}>{plan.tagline}</p>
                )}

                <div className="mb-4">
                  {(() => {
                    const price = priceForCycle(plan, cycle);
                    // A plan that doesn't offer this duration says so instead of
                    // silently showing the monthly price.
                    if (price === null) {
                      return (
                        <>
                          <span className={`text-2xl font-extrabold ${rec ? "text-white" : "text-neutral-400"}`}>—</span>
                          <span className="block text-xs text-neutral-400 font-semibold mt-0.5">
                            {CYCLE_META[cycle].label} par available nahi
                          </span>
                        </>
                      );
                    }
                    const saving = cycleSavingPercent(plan, cycle);
                    return (
                      <>
                        <span className={`text-4xl font-extrabold ${rec ? "text-white" : "text-neutral-900"}`}>₹{price.toLocaleString("en-IN")}</span>
                        <span className="text-neutral-500 font-medium">/{CYCLE_META[cycle].shortLabel.toLowerCase()}</span>
                        <span className="block text-xs text-neutral-400 font-semibold mt-0.5">
                          GST included
                          {CYCLE_META[cycle].months > 1 && ` · ₹${effectiveMonthly(price, cycle).toLocaleString("en-IN")}/month`}
                          {saving > 0 && ` · ${saving}% bachat`}
                        </span>
                      </>
                    );
                  })()}
                </div>

                {/* Limits straight from the admin-controlled plan row */}
                <div className={`flex flex-wrap gap-2 mb-5 text-[10px] font-bold uppercase tracking-wider ${rec ? "text-neutral-300" : "text-neutral-600"}`}>
                  <span className={`px-2 py-1 rounded-lg ${rec ? "bg-white/10" : "bg-neutral-100/80 border border-neutral-200/60"}`}>
                    {plan.maxTenants === -1 ? "Unlimited" : plan.maxTenants} tenants
                  </span>
                  <span className={`px-2 py-1 rounded-lg ${rec ? "bg-white/10" : "bg-neutral-100/80 border border-neutral-200/60"}`}>
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
                        <CheckCircle2 size={18} className={`shrink-0 mt-0.5 ${rec ? "text-violet-400" : "text-emerald-500"}`} />
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
                  href={`/dashboard/owner/subscription/checkout?plan=${plan.slug}&cycle=${cycle}`}
                  className={
                    rec
                      ? "block w-full py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-500 hover:to-violet-400 transition shadow-lg shadow-violet-500/25 text-center"
                      : "block w-full py-3 rounded-xl font-bold bg-neutral-100/80 text-neutral-900 hover:bg-neutral-200 border border-neutral-200/60 shadow-sm transition text-center"
                  }
                >
                  Upgrade to {plan.name}
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center mt-10 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
        <Sparkles size={14} className="text-violet-500" />
        All prices are GST-inclusive. Cancel anytime.
      </div>

      <div className="text-center mt-4">
        <p className="text-xs font-medium text-neutral-500">Need help or offline activation? <Link href="/contact" className="font-black text-violet-600 hover:text-violet-700 hover:underline">Contact Support</Link></p>
      </div>
    </div>
  );
}
