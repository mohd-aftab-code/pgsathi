import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Scale,
  Building2,
  Sparkles,
  Zap,
  Users,
  Smartphone,
  ChevronRight,
  IndianRupee,
  HelpCircle,
} from "lucide-react";
import { constructMetadata } from "@/lib/seo";
import { safeJsonLd } from "@/lib/json-ld";
import Breadcrumbs from "@/components/common/Breadcrumbs";

export const metadata = constructMetadata({
  title: "Compare PG Platforms & Software | PGSathi vs Others",
  description: "Compare PGSathi with Rentok, NoBroker and other portals. See how PGSathi provides zero brokerage tenant leads and free cloud PG management software.",
  canonicalPath: "/compare",
  keywords: [
    "PGSathi comparison",
    "PG software comparison",
    "Rentok alternative",
    "NoBroker alternative for PGs",
    "PG list platform",
    "Best PG management software",
  ],
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
      "name": "Compare Platforms",
      "item": "https://pgsathi.in/compare",
    },
  ],
};

const FAQ_ITEMS = [
  {
    q: "Why should I compare PGSathi with traditional portals?",
    a: "Traditional portals either charge high per-listing brokerage fees or hide tenant contact details behind costly subscriptions. PGSathi is India's dedicated PG list platform and cloud CRM — offering 100% free direct owner contact and comprehensive hostel management tools.",
  },
  {
    q: "Is PGSathi a software or a listing portal?",
    a: "PGSathi is both! You get an active public marketplace where students and working professionals discover your property for zero brokerage, plus a cloud-based CRM to track beds, collect rent via WhatsApp, verify KYC, and log expenses.",
  },
  {
    q: "Do I have to pay anything to start?",
    a: "No. You can list 1 PG completely free on our Starter plan forever. For our full-featured PG Manager CRM, every newly registered owner gets a 15-day complete free trial with no credit card required.",
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

export default function CompareHubPage() {
  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(BREADCRUMB_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(FAQ_SCHEMA) }} />

      {/* ── 1. Hero Section (Mobile-First) ── */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white pt-10 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6 flex justify-center">
            <Breadcrumbs items={[{ label: "Compare Platforms" }]} />
          </div>

          <div className="inline-flex items-center gap-2 p-1.5 pr-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold mb-6">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] uppercase tracking-wider">
              Objective Guide
            </span>
            <span className="text-primary-200">2026 PG Tech &amp; Portal Benchmark</span>
          </div>

          {/* Rule 5: One H1 per page containing primary keyword */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15] mb-5 text-white">
            Compare PGSathi with Other PG Platforms
          </h1>

          <p className="text-primary-100 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            See how PGSathi compares against standalone hostel software and generic rental portals in direct leads, zero-brokerage pricing, and daily automation.
          </p>

          {/* Key Value Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary-300 uppercase tracking-wider block">Brokerage</span>
                <p className="text-sm font-extrabold text-white">0% Free Forever</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Zap size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary-300 uppercase tracking-wider block">Full Trial</span>
                <p className="text-sm font-extrabold text-white">15 Days Free CRM</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Users size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary-300 uppercase tracking-wider block">Lead Delivery</span>
                <p className="text-sm font-extrabold text-white">Direct WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Comparison Cards Section ── */}
      <section className="container-max px-4 sm:px-6 -mt-8 relative z-20">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card 1: PGSathi vs Rentok */}
          <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xl shadow-primary-950/5 flex flex-col justify-between hover:border-primary-300 hover:shadow-2xl transition-all group">
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center ring-1 ring-primary-100 group-hover:scale-105 transition-transform">
                  <Scale size={28} />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
                  Software vs Platform
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Detailed Comparison</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-3 tracking-tight">
                PGSathi vs Rentok
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-6">
                Rentok is an offline hostel accounting tool. PGSathi gives you an active public marketplace for direct tenant inquiries plus complete PG management with WhatsApp rent reminders.
              </p>

              {/* Feature Points */}
              <div className="space-y-2.5 mb-8">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-neutral-800">
                    <strong className="text-neutral-900 block font-bold">Public Online Discovery Marketplace</strong>
                    Free public listing bringing tenants without local broker commission.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-neutral-800">
                    <strong className="text-neutral-900 block font-bold">1-Click WhatsApp Reminders with UPI</strong>
                    Tenants pay directly into your bank without SMS gateway fees.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-neutral-800">
                    <strong className="text-neutral-900 block font-bold">15-Day Complete Free Trial</strong>
                    Test all CRM features with zero risk and no upfront card required.
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/compare/pgsathi-vs-rentok"
              className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-primary-600/25 min-h-[48px]"
            >
              Read PGSathi vs Rentok <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 2: PGSathi vs NoBroker */}
          <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xl shadow-primary-950/5 flex flex-col justify-between hover:border-emerald-300 hover:shadow-2xl transition-all group">
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-100 group-hover:scale-105 transition-transform">
                  <Building2 size={28} />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Classifieds vs PG Tech
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Detailed Comparison</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-3 tracking-tight">
                PGSathi vs NoBroker
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-6">
                NoBroker is built for full flats with locked contact plans. PGSathi is 100% built for PGs with bed-sharing architecture, direct owner contacts, and integrated cloud CRM.
              </p>

              {/* Feature Points */}
              <div className="space-y-2.5 mb-8">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-neutral-800">
                    <strong className="text-neutral-900 block font-bold">Bed-Sharing Architecture</strong>
                    Single, Double, and Triple occupancy pricing tailored for students and workers.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-neutral-800">
                    <strong className="text-neutral-900 block font-bold">100% Free Direct Owner Contact</strong>
                    No tenant paywalls or contact lockouts like generic classifieds.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-neutral-800">
                    <strong className="text-neutral-900 block font-bold">Built-In Daily Operations CRM</strong>
                    Tenant Aadhaar KYC, meal tracking, rent logs, and maintenance tickets in one place.
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/compare/pgsathi-vs-nobroker"
              className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-sm transition-all shadow-lg min-h-[48px]"
            >
              Read PGSathi vs NoBroker <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. Why Specialized PG Platform Matters ── */}
      <section className="container-max px-4 sm:px-6 pt-16 pb-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
            Why It Matters
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-3 mb-2">
            Why Indian PG Owners Prefer PGSathi
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm">
            Managing a paying guest hostel has distinct challenges that general flat portals and generic accounting software simply cannot solve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Zap size={22} />
            </div>
            <h3 className="text-lg font-black text-neutral-900">Zero Commission Model</h3>
            <p className="text-neutral-600 text-xs leading-relaxed">
              Never sacrifice 15-30 days of rent to local brokers. Tenants contact you directly via call and WhatsApp for 100% verified zero brokerage deals.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smartphone size={22} />
            </div>
            <h3 className="text-lg font-black text-neutral-900">Mobile-First WhatsApp Flow</h3>
            <p className="text-neutral-600 text-xs leading-relaxed">
              Neither you nor your tenants need to install clunky software. Collect payments via 1-click WhatsApp reminders and UPI receipts right from your phone.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-lg font-black text-neutral-900">Bed-Level Inventory</h3>
            <p className="text-neutral-600 text-xs leading-relaxed">
              Track single, double, and triple-sharing beds independently. Instantly see vacant slots, active bookings, and upcoming checkouts in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Frequently Asked Questions ── */}
      <section className="container-max px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 max-w-4xl mx-auto shadow-sm">
          <div className="text-left mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              Clear Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-3 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm">
              Common questions about switching to PGSathi from other PG tools or real estate portals.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                <div className="flex items-center gap-2 text-sm font-black text-neutral-900">
                  <HelpCircle size={17} className="text-primary-600 shrink-0" />
                  <span>{item.q}</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 pl-6 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Mobile-Ready Final CTA ── */}
      <section className="container-max px-4 sm:px-6">
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-950 text-white rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 pointer-events-none"></div>
          <div className="relative z-10 space-y-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-black uppercase tracking-wider border border-white/15">
              15 Days Free Trial • 0% Brokerage
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Experience the PGSathi Difference Today
            </h2>
            <p className="text-primary-200 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
              List your PG for free, test our complete cloud PG Manager CRM for 15 days, and get verified tenant inquiries sent straight to your WhatsApp.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/owner/listings/new"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-primary-950 font-black text-sm hover:bg-neutral-100 transition-all shadow-xl min-h-[48px] flex items-center justify-center gap-2"
              >
                Start 15-Day Free Trial <ArrowRight size={16} />
              </Link>
              <Link
                href="/for-owners"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all min-h-[48px] flex items-center justify-center"
              >
                Explore Owner Benefits
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
