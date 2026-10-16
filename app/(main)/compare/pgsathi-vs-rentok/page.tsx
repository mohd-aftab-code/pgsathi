import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  Zap,
  Building2,
  Users,
  IndianRupee,
  HelpCircle,
  ChevronRight,
  Smartphone,
  Sparkles,
  MessageCircle,
  Check,
  X,
  Lock,
  Unlock,
  TrendingUp,
} from "lucide-react";
import { constructMetadata } from "@/lib/seo";
import { safeJsonLd } from "@/lib/json-ld";
import Breadcrumbs from "@/components/common/Breadcrumbs";

export const metadata = constructMetadata({
  title: "PGSathi vs Rentok: Best PG Platform & Software | PGSathi",
  description: "Compare PGSathi vs Rentok. Discover why Indian PG owners choose PGSathi for free PG listing, 15-day CRM trial, WhatsApp rent reminders & zero brokerage.",
  canonicalPath: "/compare/pgsathi-vs-rentok",
  keywords: ["PGSathi vs Rentok", "Rentok alternative", "PG management software comparison", "Best PG CRM India", "PG list platform"],
});

const BREADCRUMB_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://pgsathi.in",
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Compare",
      "item": "https://pgsathi.in/compare",
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "PGSathi vs Rentok",
      "item": "https://pgsathi.in/compare/pgsathi-vs-rentok",
    },
  ],
};

const SOFTWARE_APPLICATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PGSathi PG Platform & CRM",
  "operatingSystem": "Web, Mobile Browser, Android, iOS",
  "applicationCategory": "BusinessApplication",
  "description": "Comprehensive PG list platform with free public listing and built-in PG management CRM for rent collection and tenant tracking.",
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter Plan",
      "price": "0",
      "priceCurrency": "INR",
      "description": "Free lifetime PG listing on PGSathi with 0% brokerage",
    },
    {
      "@type": "Offer",
      "name": "Standard Plan",
      "price": "1499",
      "priceCurrency": "INR",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "1499",
        "priceCurrency": "INR",
        "unitText": "MONTH",
      },
      "description": "Full PG Manager CRM with 1-click WhatsApp rent reminders",
    },
  ],
};

const COMPARISON_ROWS = [
  {
    feature: "Public Online Discovery Marketplace",
    category: "Lead Generation",
    pgsathi: "Yes — 100% Free Forever public listing on PGSathi portal with high search traffic",
    pgsathiBadge: "Free Listing Included",
    pgsathiCheck: true,
    rentok: "No — Rentok is backend accounting software only. No tenant search portal exists",
    rentokCheck: false,
  },
  {
    feature: "Direct Tenant Inquiries (WhatsApp & Calls)",
    category: "Lead Generation",
    pgsathi: "Yes — Direct WhatsApp and phone leads from verified students & professionals",
    pgsathiBadge: "0% Brokerage",
    pgsathiCheck: true,
    rentok: "No — You must find tenants yourself via local brokers or outside advertisements",
    rentokCheck: false,
  },
  {
    feature: "Free Trial Experience",
    category: "Pricing & Onboarding",
    pgsathi: "15-Day Full Access Trial (No credit card or upfront payment required)",
    pgsathiBadge: "15 Days Free",
    pgsathiCheck: true,
    rentok: "Restricted sales demo or limited feature preview",
    rentokCheck: false,
  },
  {
    feature: "1-Click WhatsApp Rent Reminders with UPI",
    category: "Rent Collection",
    pgsathi: "Built-in native wa.me links with tenant dues and owner UPI handle attached",
    pgsathiBadge: "1-Click UPI",
    pgsathiCheck: true,
    rentok: "Requires third-party SMS gateway integration with extra per-message cost",
    rentokCheck: false,
  },
  {
    feature: "Bed & Room Inventory Tracking",
    category: "Property Management",
    pgsathi: "Real-time vacancy tracking for Single, Double, Triple sharing rooms",
    pgsathiBadge: "Live Bed Inventory",
    pgsathiCheck: true,
    rentok: "Supported inside backend hostel portal",
    rentokCheck: true,
  },
  {
    feature: "Digital Tenant KYC & Document Verification",
    category: "Property Management",
    pgsathi: "Paperless mobile photo & Aadhaar upload stored securely in the cloud",
    pgsathiBadge: "Paperless KYC",
    pgsathiCheck: true,
    rentok: "Supported inside backend portal",
    rentokCheck: true,
  },
  {
    feature: "Tenant Experience (No App Install Required)",
    category: "Tenant Friendly",
    pgsathi: "Instant mobile web portal — tenants check dues and complaints without downloading apps",
    pgsathiBadge: "Zero App Hassle",
    pgsathiCheck: true,
    rentok: "Requires tenants to install a dedicated mobile application",
    rentokCheck: false,
  },
  {
    feature: "Pricing Model & Transparency",
    category: "Pricing & Value",
    pgsathi: "Clear flat pricing from ₹0 (Starter) to ₹1,499/mo (Standard). All prices include GST",
    pgsathiBadge: "GST Included",
    pgsathiCheck: true,
    rentok: "Per-bed or per-room recurring software charge that escalates as your PG grows",
    rentokCheck: false,
  },
];

const FAQ_ITEMS = [
  {
    q: "How is PGSathi different from Rentok?",
    a: "Rentok is primarily a standalone backend software for hostel accounting, whereas PGSathi is an all-in-one ecosystem: a high-traffic public PG listing platform that brings you zero-brokerage tenant inquiries combined with a cloud-based PG Manager CRM.",
  },
  {
    q: "Does Rentok provide new tenant leads?",
    a: "No. Rentok focuses purely on internal property administration. It does not operate an active public tenant search portal. In contrast, PGSathi lists your property to thousands of students and working professionals, sending verified leads directly to your WhatsApp.",
  },
  {
    q: "Do I get a free trial on PGSathi?",
    a: "Yes. Every newly registered PG owner receives a 15-day complete free trial with full CRM capabilities and unlocked tenant lead contact numbers, without requiring any upfront credit card details.",
  },
  {
    q: "How does automated rent collection compare?",
    a: "PGSathi features 1-click WhatsApp rent reminders with pre-filled month, pending dues, and your UPI ID directly via the native WhatsApp protocol, avoiding hefty SMS gateway markups.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    "name": item.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.a,
    },
  })),
};

export default function ComparePgsathiVsRentok() {
  return (
    <div className="bg-neutral-50 min-h-screen pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(BREADCRUMB_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(SOFTWARE_APPLICATION_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(FAQ_SCHEMA) }} />

      {/* ── 1. Hero Section (Mobile-First) ── */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white pt-10 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6 flex justify-center">
            <Breadcrumbs
              items={[
                { label: "Compare", href: "/compare" },
                { label: "PGSathi vs Rentok" },
              ]}
            />
          </div>

          {/* Versus Header Badge */}
          <div className="inline-flex items-center gap-2 p-1.5 pr-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold mb-6">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] uppercase tracking-wider">
              2026 Analysis
            </span>
            <span className="text-primary-200">PG Software &amp; Platform Comparison</span>
          </div>

          {/* Dual Brand Pills */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
            <div className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-2xl bg-white text-primary-950 font-black text-sm sm:text-base shadow-lg flex items-center gap-2">
              <Sparkles size={16} className="text-primary-600 shrink-0" />
              <span>PGSathi</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 text-white font-black text-xs flex items-center justify-center shrink-0 border border-white/30">
              VS
            </div>
            <div className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-white font-bold text-sm sm:text-base border border-white/20">
              <span>Rentok</span>
            </div>
          </div>

          {/* Rule 5: One H1 per page containing primary keyword */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15] mb-5 text-white">
            PGSathi vs Rentok: Which PG Platform &amp; Software is Better?
          </h1>

          <p className="text-primary-100 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Why pay high recurring software charges when you can get an active <strong>zero-brokerage tenant discovery marketplace</strong> and a complete <strong>PG Manager CRM</strong> together on PGSathi?
          </p>

          {/* Key Value Metrics Pill */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
              <span className="text-[10px] font-bold text-primary-300 uppercase tracking-wider block mb-0.5">Tenant Inquiries</span>
              <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" /> 100% Direct Leads
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
              <span className="text-[10px] font-bold text-primary-300 uppercase tracking-wider block mb-0.5">Public Listing</span>
              <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" /> ₹0 Free Starter Tier
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
              <span className="text-[10px] font-bold text-primary-300 uppercase tracking-wider block mb-0.5">Free Full CRM Trial</span>
              <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" /> 15 Days Free
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Quick Summary Verdict Card ── */}
      <div className="container-max px-4 sm:px-6 -mt-6 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xl shadow-primary-950/5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-3 border border-emerald-200/60">
                <ShieldCheck size={14} className="text-emerald-600" /> Executive Verdict
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mb-2">
                Rentok helps manage occupied rooms; PGSathi also fills your vacant beds.
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Software alone cannot bring tenants to your door. If your biggest headache is <strong>vacant beds and heavy broker fees</strong>, PGSathi gives you verified inquiries on WhatsApp while handling all your rent, billing, KYC, and complaints in one app.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 shrink-0">
              <Link
                href="/dashboard/owner/listings/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600 text-white font-extrabold text-sm shadow-lg shadow-primary-600/25 hover:opacity-95 transition-all text-center min-h-[48px]"
              >
                Start 15-Day Free Trial <ArrowRight size={16} />
              </Link>
              <Link
                href="/for-owners"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-extrabold text-sm transition-colors text-center border border-neutral-200 min-h-[48px]"
              >
                See Free Listing Features
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Feature Breakdown (Mobile-First View + Desktop Table) ── */}
      <section className="container-max px-4 sm:px-6 pt-16 pb-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
            Side-by-Side Breakdown
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight mt-3 mb-3">
            Compare Features: PGSathi vs Rentok
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm">
            Everything an Indian PG or hostel owner needs to automate business and eliminate broker commission.
          </p>
        </div>

        {/* ── MOBILE VIEW: Card-Based Comparison (No horizontal table scroll!) ── */}
        <div className="block lg:hidden space-y-4">
          {COMPARISON_ROWS.map((row, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md">
                  {row.category}
                </span>
                {row.pgsathiBadge && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {row.pgsathiBadge}
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-neutral-900 text-sm">{row.feature}</h3>

              {/* PGSathi Row */}
              <div className="p-3 rounded-xl bg-primary-50/50 border border-primary-100 space-y-1">
                <div className="flex items-center justify-between text-xs font-black text-primary-950">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-primary-600" /> PGSathi
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold text-[11px]">
                    <CheckCircle2 size={14} className="text-emerald-600" /> Supported
                  </span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed font-medium">{row.pgsathi}</p>
              </div>

              {/* Rentok Row */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                  <span>Rentok</span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${row.rentokCheck ? "text-neutral-700" : "text-neutral-400"}`}>
                    {row.rentokCheck ? <Check size={14} className="text-neutral-600" /> : <X size={14} className="text-neutral-400" />}
                    {row.rentokCheck ? "Supported" : "Not Offered"}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">{row.rentok}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── DESKTOP VIEW: Clean Comparison Table ── */}
        <div className="hidden lg:block bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6 w-2/5">Capability / Requirement</th>
                <th className="py-4 px-6 w-3/10 bg-primary-50/60 text-primary-950 font-black text-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-primary-600" /> PGSathi (Platform + CRM)
                  </div>
                </th>
                <th className="py-4 px-6 w-3/10 text-neutral-700 font-bold text-sm">Rentok (Backend Only)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block mb-0.5">
                      {row.category}
                    </span>
                    <strong className="text-neutral-900 font-bold">{row.feature}</strong>
                  </td>
                  <td className="py-4 px-6 bg-primary-50/20">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-900 leading-relaxed">{row.pgsathi}</p>
                        {row.pgsathiBadge && (
                          <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {row.pgsathiBadge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        row.rentokCheck ? "bg-neutral-100 text-neutral-700" : "bg-neutral-100 text-neutral-400"
                      }`}>
                        {row.rentokCheck ? <Check size={13} strokeWidth={2.5} /> : <X size={13} strokeWidth={2.5} />}
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">{row.rentok}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 4. Strategic Advantages (The 3 Pillars) ── */}
      <section className="container-max px-4 sm:px-6 py-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            The PGSathi Advantage
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm mt-1">
            Built from scratch for Indian landlords, co-living founders, and hostel owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 text-white flex items-center justify-center mb-5 shadow-sm shadow-primary-500/20">
              <Users size={22} />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-2">1. Solves the Vacancy Problem</h3>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
              Rentok cannot fill your empty rooms. PGSathi puts your PG in front of thousands of students and corporate workers searching in your area, sending direct WhatsApp inquiries straight to your phone.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mb-5 shadow-sm shadow-emerald-500/20">
              <Zap size={22} />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-2">2. Frictionless Rent Reminders</h3>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
              No manual follow-up calls or awkward conversations. One tap opens WhatsApp with a personalized message showing the tenant's due amount, month, and your UPI ID for instant clearing.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center mb-5 shadow-sm shadow-orange-500/20">
              <IndianRupee size={22} />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-2">3. Zero Hidden Costs</h3>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
              Unlike software vendors charging per-bed recurring commissions, PGSathi offers a generous <strong>Free Forever Starter tier</strong>, a <strong>15-day complete CRM trial</strong>, and flat GST-inclusive subscriptions.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Frequently Asked Questions (FAQPage Schema Matching) ── */}
      <section className="container-max px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm mt-1">
              Common questions PG owners ask before switching to PGSathi.
            </p>
          </div>

          <div className="space-y-3.5">
            {FAQ_ITEMS.map((faq, index) => (
              <details
                key={index}
                className="group bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden transition-all"
              >
                <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer font-bold text-sm sm:text-base text-neutral-900 hover:text-primary-700 transition-colors list-none">
                  <span className="flex items-center gap-3">
                    <HelpCircle size={18} className="text-primary-600 shrink-0" />
                    {faq.q}
                  </span>
                  <span className="ml-2 w-6 h-6 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center shrink-0 group-open:rotate-180 transition-transform">
                    ↓
                  </span>
                </summary>
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Bottom Sticky / Touch-Friendly CTA ── */}
      <section className="container-max px-4 sm:px-6">
        <div className="bg-neutral-900 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/20 blur-3xl rounded-full pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary-300 bg-white/10 px-3 py-1 rounded-full border border-white/15">
              15-Day Free Trial
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-4 mb-3">
              Ready to automate your PG business?
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-8">
              Join thousands of smart PG owners across India. List your PG for free, get direct tenant leads on WhatsApp, and digitize your operations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/owner/listings/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-extrabold text-sm transition-all shadow-lg min-h-[48px]"
              >
                Create Your Free Account <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-sm border border-white/20 transition-colors min-h-[48px]"
              >
                Talk to Sales Team
              </Link>
            </div>
            <p className="text-[11px] text-neutral-500 mt-4">
              Zero investment · No credit card required · Instant setup in 2 minutes
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
