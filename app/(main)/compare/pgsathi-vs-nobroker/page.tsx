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
  BedDouble,
  Check,
  X,
  Lock,
  Unlock,
  MessageCircle,
} from "lucide-react";
import { constructMetadata } from "@/lib/seo";
import { safeJsonLd } from "@/lib/json-ld";
import Breadcrumbs from "@/components/common/Breadcrumbs";

export const metadata = constructMetadata({
  title: "PGSathi vs NoBroker: Best Zero Brokerage PG Platform",
  description: "Compare PGSathi vs NoBroker for PGs and hostels. See why PGSathi offers superior zero brokerage leads, verified PG listings, and free owner management CRM.",
  canonicalPath: "/compare/pgsathi-vs-nobroker",
  keywords: ["PGSathi vs NoBroker", "NoBroker PG alternative", "Zero brokerage PG platform", "Best PG listing website India", "PG list platform"],
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
      "name": "PGSathi vs NoBroker",
      "item": "https://pgsathi.in/compare/pgsathi-vs-nobroker",
    },
  ],
};

const SOFTWARE_APPLICATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PGSathi PG Platform & CRM",
  "operatingSystem": "Web, Mobile Browser, Android, iOS",
  "applicationCategory": "BusinessApplication",
  "description": "Zero-brokerage PG list platform and specialized hostel management software designed specifically for student and coliving operators in India.",
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter Plan",
      "price": "0",
      "priceCurrency": "INR",
      "description": "1 Free lifetime PG listing with 0% brokerage",
    },
    {
      "@type": "Offer",
      "name": "Standard Plan",
      "price": "1499",
      "priceCurrency": "INR",
      "description": "Full PG CRM with bed tracking and WhatsApp reminders",
    },
  ],
};

const COMPARISON_ROWS = [
  {
    feature: "Dedicated PG & Hostel Architecture",
    category: "Property Focus",
    pgsathi: "100% focused on PGs, Hostels & Co-living with sharing bed logic (Single, Double, Triple)",
    pgsathiBadge: "100% PG Focused",
    pgsathiCheck: true,
    nobroker: "Generic real estate portal optimized for 1BHK/2BHK/3BHK family flats and resale properties",
    nobrokerCheck: false,
  },
  {
    feature: "Direct Tenant Contacts (No Paid Locks)",
    category: "Tenant Experience",
    pgsathi: "100% direct owner contact — tenants connect via WhatsApp or phone with zero charges",
    pgsathiBadge: "Truly Free Leads",
    pgsathiCheck: true,
    nobroker: "Owner contact numbers are restricted behind paid tenant subscription packages & contact limits",
    nobrokerCheck: false,
  },
  {
    feature: "Built-in PG Billing & Rent CRM",
    category: "Operations",
    pgsathi: "Includes complete PG Manager CRM: rent dues, payment logging, and automated reminders",
    pgsathiBadge: "Built-in CRM",
    pgsathiCheck: true,
    nobroker: "Classifieds listing only — zero tools for rent collection, dues, or day-to-day PG management",
    nobrokerCheck: false,
  },
  {
    feature: "1-Click WhatsApp Rent Reminders with UPI",
    category: "Rent Collection",
    pgsathi: "Built-in automated WhatsApp messages with month, due balance, and owner's UPI handle",
    pgsathiBadge: "Instant WhatsApp UPI",
    pgsathiCheck: true,
    nobroker: "Not offered — owners must chase tenants manually or use third-party tools",
    nobrokerCheck: false,
  },
  {
    feature: "Room & Bed Vacancy Tracker",
    category: "Inventory",
    pgsathi: "Live floor & bed-level tracking (know exactly which bed is vacant in Room 102, 103, etc.)",
    pgsathiBadge: "Bed-Level Tracking",
    pgsathiCheck: true,
    nobroker: "Entire flat / unit level only — no concept of sharing bed vacancy management",
    nobrokerCheck: false,
  },
  {
    feature: "Food / Mess Menu Schedules",
    category: "Hostel Facilities",
    pgsathi: "Digital weekly meal scheduler for Breakfast, Lunch & Dinner visible to tenants",
    pgsathiBadge: "Mess Scheduler",
    pgsathiCheck: true,
    nobroker: "Not available",
    nobrokerCheck: false,
  },
  {
    feature: "Free PG Listing & Trial",
    category: "Pricing & Onboarding",
    pgsathi: "1 Free PG Listing forever on public search + 15-day complete free CRM trial",
    pgsathiBadge: "15 Days Free Trial",
    pgsathiCheck: true,
    nobroker: "Forces expensive owner promotion plans to gain visibility on the platform",
    nobrokerCheck: false,
  },
  {
    feature: "Tenant Digital KYC & Dispute Prevention",
    category: "Security",
    pgsathi: "Paperless Aadhaar & student ID verification stored securely with tenant complaint tracking",
    pgsathiBadge: "Digital KYC",
    pgsathiCheck: true,
    nobroker: "Basic listing enquiry only — no tenant lifecycle or complaint tracking",
    nobrokerCheck: false,
  },
];

const FAQ_ITEMS = [
  {
    q: "Why is PGSathi better than NoBroker for PGs and Hostels?",
    a: "NoBroker is built primarily for residential flat and apartment rentals, treating PGs as an afterthought without bed-level inventory. PGSathi is 100% dedicated to PGs, coliving, and hostels, supporting single/double/triple sharing beds, food mess menus, and tenant KYC.",
  },
  {
    q: "Do tenants pay to contact owners on PGSathi?",
    a: "Never. On PGSathi, tenants get direct WhatsApp and phone contact with verified PG owners with zero charges. NoBroker frequently locks owner contact numbers behind paid tenant plans and credit packs.",
  },
  {
    q: "Does NoBroker provide PG management software or CRM?",
    a: "No. NoBroker only provides property listings. They do not offer room and bed inventory trackers, tenant complaint logs, 1-click WhatsApp rent collection, or expense tracking for PG owners. PGSathi gives owners an integrated cloud CRM.",
  },
  {
    q: "What is the listing cost for PG owners?",
    a: "PGSathi allows PG owners to list 1 PG completely free forever, with a complimentary 15-day free trial of the full PG Manager CRM. NoBroker often charges heavy upfront owner listing fees for visibility.",
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

export default function ComparePgsathiVsNoBroker() {
  return (
    <div className="bg-neutral-50 min-h-screen pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(BREADCRUMB_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(SOFTWARE_APPLICATION_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(FAQ_SCHEMA) }} />

      {/* ── 1. Hero Header (Mobile-First) ── */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white pt-10 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6 flex justify-center">
            <Breadcrumbs
              items={[
                { label: "Compare", href: "/compare" },
                { label: "PGSathi vs NoBroker" },
              ]}
            />
          </div>

          {/* Versus Header Badge */}
          <div className="inline-flex items-center gap-2 p-1.5 pr-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold mb-6">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] uppercase tracking-wider">
              Specialized vs Generic
            </span>
            <span className="text-primary-200">Zero Brokerage Platform Comparison</span>
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
              <span>NoBroker</span>
            </div>
          </div>

          {/* Rule 5: One H1 per page containing primary keyword */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15] mb-5 text-white">
            PGSathi vs NoBroker: Zero Brokerage PG Platform Comparison
          </h1>

          <p className="text-primary-100 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Why PG and hostel operators achieve faster occupancy, zero contact fees, and full management software with India's dedicated PG list platform.
          </p>

          {/* Key Value Metrics Pill */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
              <span className="text-[10px] font-bold text-primary-300 uppercase tracking-wider block mb-0.5">Focus</span>
              <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" /> 100% PGs &amp; Hostels
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
              <span className="text-[10px] font-bold text-primary-300 uppercase tracking-wider block mb-0.5">Tenant Inquiries</span>
              <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" /> Unrestricted Direct WhatsApp
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
              <span className="text-[10px] font-bold text-primary-300 uppercase tracking-wider block mb-0.5">Cloud PG CRM</span>
              <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" /> Included for Free
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
                <ShieldCheck size={14} className="text-emerald-600" /> Key Differentiator
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mb-2">
                NoBroker is for apartments; PGSathi is built for PG &amp; hostel realities.
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Renting a PG is completely different from renting a 2BHK flat. You need single/double/triple bed allocation, mess menus, tenant digital KYC, and easy rent collection. PGSathi delivers all of this with zero locked contacts.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 shrink-0">
              <Link
                href="/dashboard/owner/listings/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600 text-white font-extrabold text-sm shadow-lg shadow-primary-600/25 hover:opacity-95 transition-all text-center min-h-[48px]"
              >
                List Your PG for Free <ArrowRight size={16} />
              </Link>
              <Link
                href="/for-owners"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-extrabold text-sm transition-colors text-center border border-neutral-200 min-h-[48px]"
              >
                Explore Free Tier
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Side-by-Side Comparison (Mobile-First Cards + Desktop Table) ── */}
      <section className="container-max px-4 sm:px-6 pt-16 pb-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
            Head-to-Head Comparison
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight mt-3 mb-3">
            Compare Features: PGSathi vs NoBroker
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm">
            See how specialized features empower PG owners to fill beds faster and eliminate middleman friction.
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

              {/* NoBroker Row */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                  <span>NoBroker</span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${row.nobrokerCheck ? "text-neutral-700" : "text-neutral-400"}`}>
                    {row.nobrokerCheck ? <Check size={14} className="text-neutral-600" /> : <X size={14} className="text-neutral-400" />}
                    {row.nobrokerCheck ? "Supported" : "Limited / Restricted"}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">{row.nobroker}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── DESKTOP VIEW: Clean Comparison Table ── */}
        <div className="hidden lg:block bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6 w-2/5">Feature / Capability</th>
                <th className="py-4 px-6 w-3/10 bg-primary-50/60 text-primary-950 font-black text-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-primary-600" /> PGSathi (PG Dedicated)
                  </div>
                </th>
                <th className="py-4 px-6 w-3/10 text-neutral-700 font-bold text-sm">NoBroker (General Classifieds)</th>
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
                        row.nobrokerCheck ? "bg-neutral-100 text-neutral-700" : "bg-neutral-100 text-neutral-400"
                      }`}>
                        {row.nobrokerCheck ? <Check size={13} strokeWidth={2.5} /> : <X size={13} strokeWidth={2.5} />}
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">{row.nobroker}</p>
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
            Why PG Owners Choose PGSathi
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm mt-1">
            Built specifically around the operational realities of Indian student &amp; co-living hostels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 text-white flex items-center justify-center mb-5 shadow-sm shadow-primary-500/20">
              <BedDouble size={22} />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-2">1. Bed-Level Architecture</h3>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
              PGs do not operate like residential flats. You rent individual beds. PGSathi gives you instant room &amp; bed vacancy reports, occupancy rates, and single/double/triple sharing management.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mb-5 shadow-sm shadow-emerald-500/20">
              <Users size={22} />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-2">2. Unrestricted Direct Inquiries</h3>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
              NoBroker frequently pushes tenants into purchasing paid contact plans before revealing phone numbers. PGSathi believes in true zero brokerage: direct WhatsApp messages and direct phone calls.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center mb-5 shadow-sm shadow-orange-500/20">
              <Building2 size={22} />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-2">3. All-in-One Cloud CRM</h3>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
              Manage tenant Aadhaar KYC, issue rent receipts, resolve complaints, record electricity &amp; grocery expenses, and track P&amp;L without touching pen and paper.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Frequently Asked Questions (FAQPage Schema Matching) ── */}
      <section className="container-max px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Frequently Asked Questions: PGSathi vs NoBroker
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm mt-1">
              Common questions answered before listing your PG property.
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
              100% Free PG Listing
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-4 mb-3">
              Fill your vacant beds faster with PGSathi
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-8">
              Join thousands of smart PG owners across India. List your PG for free, get direct tenant leads on WhatsApp, and digitize your operations with zero middleman commission.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/owner/listings/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-extrabold text-sm transition-all shadow-lg min-h-[48px]"
              >
                List Your PG for Free <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-sm border border-white/20 transition-colors min-h-[48px]"
              >
                Talk to Sales Team
              </Link>
            </div>
            <p className="text-[11px] text-neutral-500 mt-4">
              Zero brokerage · 100% direct tenant leads · 15-day free CRM trial
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
