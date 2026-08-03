import { Check, Info, IndianRupee } from "lucide-react";
import { requirePartner } from "@/lib/partner-auth";
import { db } from "@/lib/db";

export const metadata = { title: "Plans & Commissions — Partner | PGSathi" };

export default async function PartnerPlansPage() {
  await requirePartner();

  const plans = await db.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Plans & Commissions</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Owner ko dikhne wale sabhi plans aur unpar aapka commission.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.map((plan) => {
          let commissionText = "No direct commission";
          if (plan.partnerCommissionType === "PERCENT") {
            commissionText = `${plan.partnerCommissionValue}% commission`;
          } else if (plan.partnerCommissionType === "FIXED") {
            commissionText = `₹${plan.partnerCommissionValue.toLocaleString("en-IN")} commission`;
          }

          let durationText = plan.partnerCommissionMonths > 0
            ? ` for first ${plan.partnerCommissionMonths} months`
            : " (lifetime)";

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl border-2 bg-white dark:bg-neutral-900 flex flex-col overflow-hidden ${
                plan.recommended
                  ? "border-primary-500 shadow-xl shadow-primary-500/10"
                  : "border-neutral-200 dark:border-neutral-800 shadow-sm"
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wide uppercase">
                  {plan.badge}
                </div>
              )}
              <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-lg font-black text-neutral-900 dark:text-white">{plan.name}</h3>
                {plan.tagline && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{plan.tagline}</p>}
                
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-neutral-900 dark:text-white">
                    ₹{plan.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm font-semibold text-neutral-500">/mo</span>
                </div>
                
                <div className="mt-5 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 p-3">
                  <div className="flex items-start gap-2">
                    <IndianRupee className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" size={16} />
                    <div>
                      <p className="text-sm font-bold text-green-900 dark:text-green-400">Your Earning</p>
                      <p className="text-xs font-semibold text-green-700 dark:text-green-500 mt-0.5">
                        {commissionText} <span className="opacity-80 font-normal">{durationText}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex-1 bg-neutral-50 dark:bg-neutral-900/50">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">Plan Features</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <Check size={16} className="text-primary-500 shrink-0 mt-0.5" />
                    <span><strong>{plan.maxListings === -1 ? "Unlimited" : plan.maxListings}</strong> PG Listings</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <Check size={16} className="text-primary-500 shrink-0 mt-0.5" />
                    <span><strong>{plan.maxPhotos === -1 ? "Unlimited" : plan.maxPhotos}</strong> Photos per PG</span>
                  </li>
                  {plan.maxTenants !== 0 && (
                    <li className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <Check size={16} className="text-primary-500 shrink-0 mt-0.5" />
                      <span><strong>{plan.maxTenants === -1 ? "Unlimited" : plan.maxTenants}</strong> Tenants Management</span>
                    </li>
                  )}
                  {plan.referralBonusDays > 0 && (
                    <li className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <Check size={16} className="text-primary-500 shrink-0 mt-0.5" />
                      <span><strong>{plan.referralBonusDays} Days</strong> free trial for owner</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-5 mt-6 flex items-start gap-3">
        <Info className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" size={20} />
        <div className="text-sm text-blue-900 dark:text-blue-300">
          <p className="font-bold mb-1">Commission kaise milta hai?</p>
          <p className="opacity-90 leading-relaxed">
            Jab bhi aapke invite kiye hue owner koi paid plan lete hain ya renew karte hain, to plan ki keemat par aapko apka commission automatically aapke earnings mein add ho jata hai. Agar lifetime hai, to har renewal par commission aayega.
          </p>
        </div>
      </div>
    </div>
  );
}
