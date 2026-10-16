import Link from "next/link";
import {
  CheckCircle2,
  TrendingUp,
  Shield,
  Smartphone,
  Zap,
  ArrowRight,
  Building,
  Users,
  CreditCard,
  ChevronDown,
  Sparkles,
  MessageCircle,
  FileText,
  Clock,
  ShieldCheck,
  IndianRupee,
  Bed,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { constructMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { safeJsonLd } from "@/lib/json-ld";

const SOFTWARE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PGSathi PG Management Software & Cloud CRM",
  "operatingSystem": "Web, Mobile Browser, Android, iOS",
  "applicationCategory": "BusinessApplication",
  "description": "Smart PG Management Software to manage tenants, collect rent with WhatsApp reminders, digital KYC, bed occupancy, and track daily expenses effortlessly.",
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter Plan",
      "price": "0",
      "priceCurrency": "INR",
      "description": "Free lifetime PG listing on India's #1 PG list platform",
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
      "description": "Complete PG Manager CRM with 15-day free trial",
    },
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "320",
  },
};

const FAQ_ITEMS = [
  {
    q: "Is there a free trial for the PG management software?",
    a: "Yes! Every newly registered PG owner gets a 15-day full-access free trial of our Standard PG Manager CRM. You can test WhatsApp rent reminders, digital tenant KYC, and bed occupancy management without any credit card or upfront payment.",
  },
  {
    q: "Can I list my PG on PGSathi for free?",
    a: "Yes. Our Starter plan is 100% free forever for listing 1 PG property on the PGSathi public discovery portal. Verified tenants can contact you directly via phone and WhatsApp with zero brokerage.",
  },
  {
    q: "Do tenants have to download a heavy mobile app?",
    a: "No! Tenants access an instant mobile-friendly web link to check rent dues, submit payment receipts, and raise maintenance complaints. No app installation is required.",
  },
  {
    q: "How do 1-click WhatsApp rent reminders work?",
    a: "PGSathi generates a direct wa.me link containing the tenant's exact rent amount, month, and your UPI handle. One tap sends it directly to their WhatsApp, making rent collection fast and hassle-free.",
  },
  {
    q: "Is my tenant data and Aadhaar KYC secure?",
    a: "Yes. All tenant records, photos, and Aadhaar documents are encrypted and securely stored in cloud infrastructure adhering to strict Indian data compliance standards.",
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
      "name": "PG Management Software",
      "item": "https://pgsathi.in/pg-management-software",
    },
  ],
};

export const metadata = constructMetadata({
  title: "PG Management Software & Cloud CRM | PGSathi",
  description: "Automate your hostel business with India's best PG Management Software. Free trial, WhatsApp rent reminders, bed inventory, digital KYC & zero brokerage.",
  canonicalPath: "/pg-management-software",
  keywords: [
    "PG Management Software",
    "Hostel Management App",
    "Cloud CRM for PG",
    "PG Billing Software",
    "Tenant Management System India",
    "PG list platform",
  ],
});

export default function PGManagementSoftwarePage() {
  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(SOFTWARE_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(FAQ_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(BREADCRUMB_SCHEMA) }} />

      {/* ── 1. Hero Section (Mobile-First) ── */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white pt-10 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 pointer-events-none"></div>
        <div className="container-max relative z-10">
          <div className="mb-6 flex justify-center sm:justify-start">
            <Breadcrumbs items={[{ label: "PG Management Software" }]} />
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 p-1.5 pr-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold mb-6">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] uppercase tracking-wider">
                  15-Day Free Trial
                </span>
                <span className="text-primary-200">No Credit Card Required</span>
              </div>

              {/* Rule 5: One H1 per page containing primary keyword */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-[1.15]">
                Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">PG Management Software</span> to Automate Your Business
              </h1>

              <p className="text-primary-100 text-sm sm:text-lg leading-relaxed max-w-2xl mb-8">
                Eliminate paper registers. Manage beds, collect rent with 1-click WhatsApp reminders, securely store tenant Aadhaar KYC, and get direct tenant inquiries without broker commission.
              </p>

              {/* Action Buttons (Mobile-first min 48px height) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8">
                <Link
                  href="/dashboard/owner/listings/new"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-600/30 transition-all text-center min-h-[48px]"
                >
                  Start 15-Day Free Trial <ArrowRight size={18} />
                </Link>
                <Link
                  href="/for-owners"
                  className="inline-flex items-center justify-center px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 transition-all text-center min-h-[48px]"
                >
                  Explore Owner Benefits
                </Link>
              </div>

              {/* Quick Trust Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-primary-200 pt-4 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>100% Free Listing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>0% Brokerage Leads</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Cloud Data Backup</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Mockup Dashboard (Indian PG Context) */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/40 text-neutral-900">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                      P
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-neutral-900">Radha Krishna PG</h3>
                      <p className="text-[11px] text-neutral-500">Live Owner Dashboard</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                    Live Demo
                  </span>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">
                      Bed Occupancy
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-neutral-900">42 / 48</span>
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                        87% Full
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">
                      Rent Collected
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-emerald-600">₹3,78,000</span>
                      <span className="text-[10px] font-extrabold text-neutral-500">
                        This Month
                      </span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Rent Action Preview */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                      <MessageCircle size={15} className="text-emerald-600" />
                      <span>WhatsApp Rent Due Reminder</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Ready to Send
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-snug mb-2 font-medium">
                    "Hi Rohan, your rent of ₹8,500 for Room 204 is due. Pay via UPI: <strong>owner@upi</strong>"
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 pt-2 border-t border-emerald-200/50">
                    <span>1-Tap WhatsApp Share</span>
                    <span className="text-emerald-600 flex items-center gap-1">Send Now <ArrowRight size={12} /></span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-xs font-bold text-neutral-800">
                    <span className="flex items-center gap-2">
                      <FileText size={14} className="text-primary-600" />
                      Digital Tenant KYC (Aadhaar &amp; Photo)
                    </span>
                    <span className="text-neutral-400 text-[11px]">Instant Upload</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-xs font-bold text-neutral-800">
                    <span className="flex items-center gap-2">
                      <Bed size={14} className="text-indigo-600" />
                      Single, Double &amp; Triple Sharing Beds
                    </span>
                    <span className="text-neutral-400 text-[11px]">Real-Time Vacancy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Offline Register vs PGSathi Comparison ── */}
      <section className="container-max px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xl shadow-primary-950/5">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[11px] font-black uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              Transform Your Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-3 mb-2">
              Old Register Notebook vs PGSathi Cloud CRM
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm">
              See how digitizing your hostel saves you hours every week and stops unpaid rent leakages.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* The Old Way */}
            <div className="p-5 sm:p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
              <div className="flex items-center gap-2 text-neutral-600 font-extrabold text-sm border-b border-neutral-200 pb-3">
                <AlertCircle size={18} className="text-neutral-400" />
                <span>The Old Way (Pen &amp; Paper / WhatsApp Groups)</span>
              </div>
              <ul className="space-y-2.5 text-xs text-neutral-600">
                <li className="flex items-start gap-2">
                  <X size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <span>Manual diary records get lost, torn, or damaged easily</span>
                </li>
                <li className="flex items-start gap-2">
                  <X size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <span>Tenants delay rent because nobody sends automated reminders</span>
                </li>
                <li className="flex items-start gap-2">
                  <X size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <span>No clear visibility on vacant beds leading to empty room losses</span>
                </li>
                <li className="flex items-start gap-2">
                  <X size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <span>Paying hefty broker fees of 15 to 30 days rent for every new tenant</span>
                </li>
              </ul>
            </div>

            {/* The PGSathi Way */}
            <div className="p-5 sm:p-6 rounded-2xl bg-primary-50/60 border border-primary-200/80 space-y-3">
              <div className="flex items-center gap-2 text-primary-950 font-extrabold text-sm border-b border-primary-200 pb-3">
                <Sparkles size={18} className="text-primary-600" />
                <span>The PGSathi Way (Cloud PG Software + Direct Leads)</span>
              </div>
              <ul className="space-y-2.5 text-xs text-neutral-800 font-medium">
                <li className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>100% cloud backup accessible from any smartphone 24/7</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>1-click WhatsApp reminders with pre-filled dues and UPI handle</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Live bed-sharing map showing Single, Double &amp; Triple vacancies</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>100% free public listing on PGSathi with 0% brokerage leads</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Six Core Capabilities Grid ── */}
      <section className="container-max px-4 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
            Feature Highlights
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight mt-3 mb-2">
            Everything Built for Indian PG Landlords
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm">
            Purpose-built modules designed to solve everyday headaches in student hostels and co-living residences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Smartphone className="text-blue-600" size={24} />,
              bg: "bg-blue-50 ring-blue-100",
              title: "Digital Paperless Tenant KYC",
              desc: "Collect tenant photos, Aadhaar details, emergency contacts, and college/workplace info digitally. No physical paper files needed.",
              badge: "Paperless & Safe",
            },
            {
              icon: <CreditCard className="text-emerald-600" size={24} />,
              bg: "bg-emerald-50 ring-emerald-100",
              title: "1-Click WhatsApp Rent Invoices",
              desc: "Send personalized WhatsApp rent reminders with pre-filled pending balances and your UPI ID. Log payments with zero fuss.",
              badge: "Zero SMS Gateway Cost",
            },
            {
              icon: <Bed className="text-violet-600" size={24} />,
              bg: "bg-violet-50 ring-violet-100",
              title: "Real-Time Bed Occupancy Map",
              desc: "Track Single, Double, Triple, and Four-sharing beds. Instantly identify vacant beds and plan upcoming check-ins.",
              badge: "Bed-Level Precision",
            },
            {
              icon: <ShieldCheck className="text-amber-600" size={24} />,
              bg: "bg-amber-50 ring-amber-100",
              title: "Direct Zero-Brokerage Inquiries",
              desc: "Your property is listed on PGSathi discovery portal. Students and workers call or WhatsApp you directly without brokers.",
              badge: "0% Commission",
            },
            {
              icon: <TrendingUp className="text-rose-600" size={24} />,
              bg: "bg-rose-50 ring-rose-100",
              title: "Expense & Profit Tracking",
              desc: "Log electricity, water, cook salary, repair, and grocery bills to see your exact net monthly profit per property.",
              badge: "Financial Clarity",
            },
            {
              icon: <CheckCircle2 className="text-teal-600" size={24} />,
              bg: "bg-teal-50 ring-teal-100",
              title: "Maintenance Ticket Resolution",
              desc: "Tenants report Wi-Fi, plumbing, or AC issues through their web link. Track resolution status without messy WhatsApp chats.",
              badge: "Tenant Satisfaction",
            },
          ].map((feat, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200/90 hover:border-primary-300 hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-13 h-13 rounded-2xl ${feat.bg} ring-1 flex items-center justify-center p-3 group-hover:scale-105 transition-transform`}>
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-lg font-black text-neutral-900 mb-2">{feat.title}</h3>
                <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Transparent Pricing Comparison Strip ── */}
      <section className="container-max px-4 sm:px-6 py-8">
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-sm max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Honest &amp; Transparent
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-3 mb-2">
              Transparent Pricing Plans
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm">
              All plans include GST. Start with our 15-day free trial, no credit card required.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">
                  Discovery Only
                </span>
                <h3 className="text-xl font-black text-neutral-900">Starter Plan</h3>
                <div className="text-3xl font-black text-neutral-900 mt-2 mb-3">
                  ₹0 <span className="text-xs font-normal text-neutral-500">Free Lifetime</span>
                </div>
                <ul className="text-xs space-y-2 text-neutral-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> List 1 PG Property on Marketplace
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> 0% Brokerage Direct Tenant Calls
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> Photo &amp; Amenity Showcase
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/owner/listings/new"
                className="mt-6 w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs text-center transition-colors"
              >
                List PG for Free
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-primary-50/50 border-2 border-primary-500 flex flex-col justify-between relative shadow-md">
              <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-primary-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                15 Days Free Trial
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-700 block mb-1">
                  Discovery + Cloud CRM
                </span>
                <h3 className="text-xl font-black text-neutral-900">Standard Plan</h3>
                <div className="text-3xl font-black text-primary-950 mt-2 mb-3">
                  ₹1,499 <span className="text-xs font-normal text-neutral-500">/ month (GST Incl.)</span>
                </div>
                <ul className="text-xs space-y-2 text-neutral-800 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> Up to 50 Beds CRM Management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> 1-Click WhatsApp Rent Reminders with UPI
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> Digital Aadhaar KYC &amp; Expense Tracker
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/owner/listings/new"
                className="mt-6 w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs text-center transition-colors shadow-md"
              >
                Start 15-Day Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ Section ── */}
      <section className="container-max px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 max-w-4xl mx-auto shadow-sm">
          <div className="text-left mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-3 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm">
              Everything you need to know about setting up PGSathi for your hostel or paying guest property.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-neutral-50 rounded-2xl border border-neutral-200/80 [&_summary::-webkit-details-marker]:hidden transition-all"
              >
                <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer text-sm sm:text-base font-extrabold text-neutral-900 select-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
                </summary>
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Mobile-Ready Final Call-To-Action ── */}
      <section className="container-max px-4 sm:px-6">
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-950 text-white rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 pointer-events-none"></div>
          <div className="relative z-10 space-y-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-black uppercase tracking-wider border border-white/15">
              15 Days Free Trial • Instant Setup
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Ready to Modernize Your PG Business?
            </h2>
            <p className="text-primary-200 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
              Join forward-thinking PG owners across India who collect rent on time and eliminate broker dependencies with PGSathi.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/owner/listings/new"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm transition-all shadow-xl shadow-emerald-500/25 min-h-[48px] flex items-center justify-center gap-2"
              >
                Start 15-Day Free Trial <ArrowRight size={16} />
              </Link>
              <Link
                href="/compare"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all min-h-[48px] flex items-center justify-center"
              >
                Compare with Other Software
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
