import { Check, X } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Owner Pricing Plans - PGSathi",
  description: "Grow your PG business with our affordable plans. Zero brokerage, 100% direct leads.",
};

export default async function PricingPage() {
  const session = await auth();

  const plans = [
    {
      id: "free",
      name: "Starter",
      price: "0",
      description: "Perfect for a single PG owner getting started.",
      features: [
        "1 PG Listing",
        "Up to 5 Photos",
        "Direct Phone Calls",
        "Basic Visibility",
        "30 Days Validity"
      ],
      notIncluded: [
        "WhatsApp Direct Leads",
        "Featured Badge",
        "Analytics Dashboard",
        "Priority Support"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      id: "basic",
      name: "Growth",
      price: "349",
      description: "Everything you need to run a successful PG business.",
      features: [
        "Up to 5 PG Listings",
        "Unlimited Photos",
        "Direct Phone Calls",
        "WhatsApp Direct Leads",
        "Basic Analytics Dashboard",
        "Email Support",
        "Valid for 1 Month"
      ],
      notIncluded: [
        "Featured Badge",
        "Top of Search Results"
      ],
      cta: "Choose Growth",
      popular: true
    },
    {
      id: "pro",
      name: "Pro Owner",
      price: "1799",
      description: "For serious owners managing multiple properties.",
      features: [
        "Unlimited PG Listings",
        "Unlimited Photos",
        "Direct Phone Calls",
        "WhatsApp Direct Leads",
        "Advanced Analytics",
        "Featured Badge (1 Property)",
        "Priority 24/7 Support",
        "Valid for 1 Month"
      ],
      notIncluded: [],
      cta: "Choose Pro",
      popular: false
    }
  ];

  return (
    <div className="bg-neutral-50 min-h-screen py-16">
      <div className="container-max section-padding">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-neutral-600 leading-relaxed">
            Stop paying 1 month rent as brokerage. Get direct leads on your phone and WhatsApp for a fraction of the cost.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-white rounded-3xl p-8 relative flex flex-col ${
                plan.popular 
                  ? "border-2 border-primary-500 shadow-xl scale-105 z-10" 
                  : "border border-neutral-200 shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold px-4 py-1 rounded-full text-sm">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6 border-b border-neutral-100 pb-6">
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                <p className="text-neutral-500 text-sm mb-4 h-10">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-neutral-900">₹{plan.price}</span>
                  {plan.price !== "0" && <span className="text-neutral-500 mb-1">/month</span>}
                </div>
              </div>

              <div className="flex-1">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-neutral-700">
                      <Check size={20} className="text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, i) => (
                    <li key={`not-${i}`} className="flex items-start gap-3 text-neutral-400">
                      <X size={20} className="shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link 
                href={session ? `/dashboard/owner/subscription/checkout?plan=${plan.id}` : `/login?callbackUrl=/pricing`}
                className={`w-full py-3.5 rounded-xl font-bold transition-colors text-center block ${
                  plan.popular 
                    ? "bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/20" 
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-primary-900 rounded-3xl p-8 md:p-12 text-center text-white max-w-4xl mx-auto shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Are you a large PG operator?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            If you have more than 10 properties or need API access, custom reports, and white-labeled solutions, we have an Enterprise plan for you.
          </p>
          <button className="bg-white text-primary-900 hover:bg-neutral-50 px-8 py-3 rounded-xl font-bold transition-colors cursor-pointer">
            Contact Sales Team
          </button>
        </div>

      </div>
    </div>
  );
}
