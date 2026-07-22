import Link from "next/link";
import { CheckCircle2, Clock, AlertCircle, ShieldCheck, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/plans";

export const metadata = { title: "Upgrade to Premium — PGSathi" };

type FeatureRow = { text: string; comingSoon?: boolean };

const TIERS: {
  planId: "basic" | "pro" | "scale" | "enterprise";
  tagline: string;
  features: FeatureRow[];
  recommended?: boolean;
}[] = [
  {
    planId: "basic",
    tagline: "Sab basics — billing, reminders, complaints, reports.",
    features: [
      { text: "Billing engine & rent tracking" },
      { text: "WhatsApp rent reminders" },
      { text: "Complaints & expense tracking" },
      { text: "Reports & CSV export" },
      { text: "Up to 50 tenants, 2 PGs" },
      { text: "KYC & document upload", comingSoon: true },
      { text: "Rent agreement generator", comingSoon: true },
    ],
  },
  {
    planId: "pro",
    tagline: "Complete CRM — staff, team logins, audit trail.",
    recommended: true,
    features: [
      { text: "Everything in Growth" },
      { text: "Staff & payroll management" },
      { text: "Team logins (Manager/Warden)" },
      { text: "Advanced reports & audit log" },
      { text: "Up to 100 tenants, 3 PGs" },
      { text: "Attendance & advances", comingSoon: true },
      { text: "Bulk CSV import" },
    ],
  },
  {
    planId: "scale",
    tagline: "Multi-PG operators — bigger caps, priority support.",
    features: [
      { text: "Everything in Pro" },
      { text: "Up to 200 tenants, 5 PGs" },
      { text: "Multi-branch analytics" },
      { text: "Dedicated WhatsApp & phone support" },
      { text: "Ad-free dashboard" },
      { text: "60 photos per listing" },
      { text: "Priority complaint escalation" },
    ],
  },
  {
    planId: "enterprise",
    tagline: "No limits at all — for chains and hostel operators.",
    features: [
      { text: "Everything in Scale" },
      { text: "Unlimited tenants & unlimited PGs" },
      { text: "Dedicated account manager" },
      { text: "Free onboarding & data migration" },
      { text: "99.9% uptime SLA + priority bug fixes" },
      { text: "API access", comingSoon: true },
      { text: "Custom branding (white-label)", comingSoon: true },
    ],
  },
];

export default async function UpgradePage() {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-3">Trial Expired or No Active Plan</h1>
        <p className="text-neutral-500 max-w-xl mx-auto text-lg">
          Your 15-day free trial of the CRM has ended. Upgrade to a premium plan to continue managing your PGs and unlocking lead phone numbers.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {TIERS.map((tier) => {
          const plan = PLANS[tier.planId];
          return (
            <div
              key={tier.planId}
              className={
                tier.recommended
                  ? "bg-neutral-900 rounded-3xl p-6 shadow-xl relative overflow-hidden ring-2 ring-primary-500 ring-offset-2"
                  : tier.planId === "enterprise"
                  ? "bg-white rounded-3xl p-6 border-2 border-primary-300 shadow-md relative overflow-hidden"
                  : "bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm relative"
              }
            >
              {tier.recommended && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                  Recommended
                </div>
              )}
              {tier.planId === "enterprise" && (
                <div className="absolute top-0 right-0 bg-primary-100 text-primary-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                  Unlimited
                </div>
              )}

              <h3 className={`text-xl font-bold mb-2 flex items-center gap-2 ${tier.recommended ? "text-white" : "text-neutral-900"}`}>
                {tier.recommended && <ShieldCheck className="text-primary-400" size={20} />}
                {plan.name}
              </h3>
              <p className={`text-sm mb-6 ${tier.recommended ? "text-neutral-400" : "text-neutral-500"}`}>{tier.tagline}</p>

              <div className="mb-6">
                <span className={`text-4xl font-extrabold ${tier.recommended ? "text-white" : "text-neutral-900"}`}>₹{plan.price}</span>
                <span className="text-neutral-500 font-medium">/mo</span>
                <span className="block text-xs text-neutral-400 font-semibold mt-0.5">GST included</span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feat) => (
                  <li key={feat.text} className={`flex gap-3 text-sm ${tier.recommended ? "text-neutral-200" : "text-neutral-700"}`}>
                    {feat.comingSoon ? (
                      <Clock size={18} className="text-amber-500 shrink-0" />
                    ) : (
                      <CheckCircle2 size={18} className={`shrink-0 ${tier.recommended ? "text-primary-400" : "text-green-500"}`} />
                    )}
                    <span>
                      {feat.text}
                      {feat.comingSoon && (
                        <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-500">(Coming Soon)</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/dashboard/owner/subscription/checkout?plan=${tier.planId}`}
                className={
                  tier.recommended
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

      <div className="text-center mt-10 flex items-center justify-center gap-2 text-sm text-neutral-500">
        <Sparkles size={14} className="text-primary-500" />
        All paid plans include a 15-day free trial. Cancel anytime.
      </div>

      <div className="text-center mt-4">
        <p className="text-sm text-neutral-500">Need help or offline activation? <Link href="/contact" className="font-semibold text-primary-600">Contact Support</Link></p>
      </div>
    </div>
  );
}
