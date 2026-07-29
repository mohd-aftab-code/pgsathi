import Link from "next/link";
import { Search, User, Building, Briefcase, CreditCard, Mail } from "lucide-react";

export const metadata = {
  title: "Help Center | PGSathi",
  description: "Get support for using PGSathi. Find FAQs for Tenants, PG Owners, and Partners.",
};

export default function HelpCenterPage() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* ── Header ── */}
      <section className="bg-primary-900 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>
        <div className="container-max section-padding relative z-10">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6">How can we help you?</h1>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={24} />
            <input 
              type="text" 
              placeholder="Search for answers (e.g., 'How to list a PG')" 
              className="w-full h-16 pl-14 pr-6 rounded-2xl text-lg focus:outline-none focus:ring-4 focus:ring-primary-500/30"
            />
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <div className="container-max section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <Link href="/faq" className="bg-white p-8 rounded-2xl border border-neutral-200 hover:border-primary-500 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
              <User size={28} className="text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">For Tenants</h3>
            <p className="text-neutral-500 text-sm">Searching, contacting owners, and moving in.</p>
          </Link>

          <Link href="/faq" className="bg-white p-8 rounded-2xl border border-neutral-200 hover:border-primary-500 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 rounded-xl bg-violet-50 flex items-center justify-center mb-6 group-hover:bg-violet-500 transition-colors">
              <Building size={28} className="text-violet-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">For Owners</h3>
            <p className="text-neutral-500 text-sm">Listing properties, Cloud CRM, and tenant management.</p>
          </Link>

          <Link href="/faq" className="bg-white p-8 rounded-2xl border border-neutral-200 hover:border-primary-500 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors">
              <Briefcase size={28} className="text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">For Partners</h3>
            <p className="text-neutral-500 text-sm">Referrals, earnings, payouts, and dashboard.</p>
          </Link>

          <Link href="/faq" className="bg-white p-8 rounded-2xl border border-neutral-200 hover:border-primary-500 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors">
              <CreditCard size={28} className="text-amber-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Billing & Payments</h3>
            <p className="text-neutral-500 text-sm">Invoices, refunds, and subscription plans.</p>
          </Link>

        </div>
      </div>

      {/* ── Contact Section ── */}
      <section className="bg-white border-t border-neutral-200 py-16 text-center">
        <div className="container-max section-padding">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Can't find what you're looking for?</h2>
          <p className="text-neutral-600 mb-8 max-w-xl mx-auto">
            Our support team is always here to help. Reach out to us via email or phone.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold transition-all">
            <Mail size={20} /> Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
}
