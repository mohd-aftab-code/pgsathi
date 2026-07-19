import { Metadata } from "next";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing Plans - PGSathi",
  description: "Simple, transparent pricing for PG Owners. Choose the perfect plan for your PG business.",
};

export default async function PricingPage() {
  const plans = await db.plan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#5c24d1] to-[#461aa3] text-white pt-24 pb-48 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block p-4 bg-white/10 rounded-3xl mb-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold mb-4">PGSathi</h1>
          <p className="text-xl text-primary-100 mb-8">India's Smartest PG Management Platform</p>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-4">Tenants laao. PG manage karo.<br/>Sab ek jagah.</h2>
          <p className="text-lg text-primary-200">Marketplace Leads + PG Management SaaS + Tenant App</p>
        </div>
      </div>

      {/* Pricing Cards Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10 pb-24">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-2">Plans & Pricing</h3>
          <p className="text-primary-100">Har size ke PG ke liye perfect plan. 15-din ka free trial, koi commitment nahi.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {plans.map((plan) => {
            const isPopular = plan.slug === 'pro';
            const features = (plan.features as any[]) || [];

            return (
              <div 
                key={plan.id} 
                className={`bg-white rounded-[2rem] shadow-xl overflow-hidden border-2 ${isPopular ? 'border-primary-500 transform lg:-translate-y-4 relative' : 'border-neutral-100 mt-4'}`}
              >
                {isPopular && (
                  <div className="bg-primary-500 text-white text-center text-xs font-bold uppercase py-1.5 tracking-wider">
                    Most Popular
                  </div>
                )}
                
                <div className="p-8 text-center border-b border-neutral-100 bg-neutral-50/50">
                  <h4 className="text-2xl font-bold text-neutral-900 mb-2">{plan.name}</h4>
                  
                  <div className="mb-6">
                    <div className="flex items-start justify-center gap-1">
                      <span className="text-2xl font-bold text-neutral-900 mt-2">₹</span>
                      <span className="text-6xl font-black text-neutral-900 tracking-tight">{plan.price}</span>
                    </div>
                    <div className="text-neutral-500 font-medium mt-1">per month</div>
                  </div>

                  <div className="flex justify-center gap-2 mb-2">
                    <div className="bg-primary-50 text-primary-700 py-2 px-3 rounded-xl font-bold text-sm border border-primary-100 flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      {plan.maxTenants === -1 ? 'Unlimited' : plan.maxTenants} Tenants
                    </div>
                    <div className="bg-orange-50 text-orange-700 py-2 px-3 rounded-xl font-bold text-sm border border-orange-100 flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      {plan.maxListings === -1 ? 'Unlimited' : plan.maxListings} PGs
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-white">
                  <ul className="space-y-4">
                    {features.map((feat: any, idx: number) => (
                      <li key={idx} className="flex items-center gap-3">
                        {feat.comingSoon ? (
                          <div className="bg-amber-100 p-1 rounded-full shrink-0">
                            <Clock className="text-amber-600" size={16} strokeWidth={2.5} />
                          </div>
                        ) : feat.included ? (
                          <div className="bg-green-100 p-1 rounded-full shrink-0">
                            <CheckCircle2 className="text-green-600" size={16} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="bg-neutral-100 p-1 rounded-full shrink-0">
                            <XCircle className="text-neutral-400" size={16} strokeWidth={2} />
                          </div>
                        )}
                        <span className={feat.comingSoon ? 'text-amber-700 font-semibold text-sm' : feat.included ? 'text-neutral-800 font-semibold text-sm' : 'text-neutral-400 line-through text-sm'}>
                          {feat.name}
                          {feat.comingSoon && <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">(Coming Soon)</span>}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.price === 0 ? "/dashboard/owner/listings/new" : `/dashboard/owner/subscription/checkout?plan=${plan.slug}`}
                    className={`block w-full py-4 px-6 text-center rounded-xl font-black mt-10 transition-all shadow-sm ${
                      isPopular
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-lg hover:-translate-y-0.5'
                        : 'bg-white border-2 border-neutral-200 text-neutral-800 hover:border-primary-500 hover:bg-neutral-50'
                    }`}
                  >
                    {plan.price === 0 ? "Start Free" : "Start 15-Day Trial"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="text-center pb-12 text-neutral-500 text-sm">
        <p>Sabhi paid plans mein 15-din ka free trial. Cancel anytime. Annual plans mein 30% tak ki savings.</p>
        <p className="mt-2 font-bold text-neutral-900">Secure payments via Razorpay / UPI | 30-day money-back guarantee</p>
      </div>
    </div>
  );
}
