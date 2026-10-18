import Link from "next/link";
import {
  CheckCircle2,
  TrendingUp,
  Smartphone,
  ArrowRight,
  CreditCard,
  ChevronDown,
  Sparkles,
  MessageCircle,
  FileText,
  ShieldCheck,
  Bed,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { constructMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata = constructMetadata({
  title: "PG Management Software & Cloud CRM for Owners | PGSathi",
  description: "Smart PG Management Software and Cloud CRM. Automate rent collection via WhatsApp, digital tenant KYC, real-time bed occupancy, and zero brokerage leads on PGSathi.",
  canonicalPath: "/pg-management-software",
  keywords: [
    "PG management software",
    "PG manager CRM",
    "Hostel management software India",
    "PG rent collection app",
    "Automate PG business",
    "Digital tenant KYC",
    "Bed occupancy software",
    "PGSathi business",
  ],
});

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
      "description": "Free lifetime PG listing on PGSathi discovery portal",
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

export default function PGManagementSoftwarePage() {
  return (
    <div className="bg-neutral-50 min-h-screen pb-20 selection:bg-primary-100 selection:text-primary-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(SOFTWARE_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(FAQ_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(BREADCRUMB_SCHEMA) }} />

      {/* ── 1. Hero Section (Harmonious with Home Page Design) ── */}
      <section className="relative bg-neutral-50 pt-8 pb-14 sm:pt-12 sm:pb-20 overflow-hidden border-b border-neutral-200/80">
        {/* Subtle grid pattern identical to Homepage */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#171717 1px, transparent 1px), linear-gradient(90deg, #171717 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="container-max section-padding relative z-10">
          <div className="mb-6">
            <Breadcrumbs items={[{ label: "PG Management Software" }]} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-primary-700 uppercase tracking-widest mb-4 bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
                <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                <span>15-Day Free Trial • No Credit Card Required</span>
              </div>

              {/* Primary H1 Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black text-neutral-900 leading-[1.12] mb-5 tracking-tight">
                Smart <span className="text-primary-700">PG Management Software</span> to Automate Your Business.
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl mb-8">
                Eliminate paper registers. Manage bed occupancy, collect rent with 1-click WhatsApp reminders, securely store digital tenant Aadhaar KYC, and get direct tenant inquiries with 0% brokerage.
              </p>

              {/* Action Buttons (Consistent with Homepage) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8">
                <Link
                  href="/dashboard/owner/listings/new"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-primary-500/20 transition-all inline-flex items-center justify-center gap-2 text-center min-h-[48px]"
                >
                  Start 15-Day Free Trial <ArrowRight size={18} />
                </Link>
                <Link
                  href="/for-owners"
                  className="bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 px-6 py-4 rounded-xl font-bold text-sm sm:text-base transition-all inline-flex items-center justify-center text-center min-h-[48px] shadow-sm"
                >
                  List Your PG Online Free
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-neutral-600 pt-5 border-t border-neutral-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span className="text-neutral-800 font-bold">100% Free Listing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span className="text-neutral-800 font-bold">0% Brokerage Leads</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span className="text-neutral-800 font-bold">Cloud Data Backup</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Mockup Dashboard (Clean White Aesthetic) */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* Subtle colorful glow matching Homepage */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-200/40 via-violet-100/40 to-emerald-100/30 rounded-3xl blur-2xl transform scale-105 pointer-events-none" />

                <div className="relative bg-white border border-neutral-200 rounded-3xl p-5 sm:p-6 shadow-[0_12px_40px_rgb(0,0,0,0.08)]">
                  {/* Mock Header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                        PG
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-neutral-900 leading-snug">Radha Krishna PG</h3>
                        <p className="text-[11px] text-neutral-500">Live Owner Dashboard</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 uppercase tracking-wide">
                      Live CRM
                    </span>
                  </div>

                  {/* Dashboard Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                        Bed Occupancy
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-neutral-900">42 / 48</span>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          87% Full
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                        Rent Collected
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-neutral-900">₹3,78,000</span>
                        <span className="text-[10px] font-bold text-neutral-500">
                          This Month
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Rent Action Preview */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                        <MessageCircle size={15} className="text-emerald-700" />
                        <span>1-Click WhatsApp Rent Due Reminder</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                        Auto-Generated
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-700 leading-snug mb-3 font-medium">
                      &quot;Hi Rohan, your rent of ₹8,500 for Room 204 is due. Pay via UPI: <strong>owner@upi</strong>&quot;
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 pt-2 border-t border-emerald-200/70">
                      <span className="text-neutral-600">No manual calculations</span>
                      <span className="text-emerald-700 flex items-center gap-1 font-extrabold">Send via WhatsApp <ArrowRight size={12} /></span>
                    </div>
                  </div>

                  {/* Feature Pills */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 text-xs font-bold text-neutral-800">
                      <span className="flex items-center gap-2.5">
                        <FileText size={15} className="text-primary-600" />
                        Digital Tenant KYC (Aadhaar &amp; Photo)
                      </span>
                      <span className="text-neutral-400 text-[11px] font-medium">Instant Cloud Save</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 text-xs font-bold text-neutral-800">
                      <span className="flex items-center gap-2.5">
                        <Bed size={15} className="text-indigo-600" />
                        Single, Double &amp; Triple Sharing Beds
                      </span>
                      <span className="text-neutral-400 text-[11px] font-medium">Live Vacancy Map</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Old Diary vs PGSathi Cloud CRM ── */}
      <section className="container-max section-padding py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-700 bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
            Compare The Difference
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mt-3 mb-3">
            Old Register Diary vs PGSathi Cloud CRM
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            See how digitizing your hostel saves you hours every week and stops unpaid rent leakages.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* The Old Way */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-red-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-neutral-900 font-extrabold text-sm sm:text-base border-b border-neutral-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle size={18} />
              </div>
              <span>The Old Way (Pen, Paper &amp; Chaos)</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-neutral-600">
              <li className="flex items-start gap-2.5">
                <X size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>Manual diary records get lost, torn, or misplaced easily.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>Tenants delay rent because nobody sends automated payment reminders.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>No live visibility on vacant beds, leading to empty room revenue loss.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>Paying 15 to 30 days brokerage fees for every single new tenant.</span>
              </li>
            </ul>
          </div>

          {/* The PGSathi Way */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-primary-500 shadow-lg ring-4 ring-primary-50 space-y-4">
            <div className="flex items-center gap-2.5 text-primary-950 font-extrabold text-sm sm:text-base border-b border-primary-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                <Sparkles size={18} />
              </div>
              <span>The PGSathi Way (Cloud CRM + Direct Leads)</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-neutral-800 font-medium">
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>100% cloud backup accessible from your phone 24/7 anywhere.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>1-click WhatsApp reminders with exact rent amount &amp; UPI ID.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Live bed map tracking Single, Double &amp; Triple occupancy instantly.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>100% free public listing on PGSathi with zero broker commission.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 3. Six Core Capabilities Grid ── */}
      <section className="container-max section-padding py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-700 bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
            Core Features
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mt-3 mb-3">
            Everything Built for Indian PG Landlords
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            Purpose-built modules designed to solve everyday headaches in student hostels and co-living residences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Smartphone className="text-primary-600" size={24} />,
              bg: "bg-primary-50 border-primary-100",
              title: "Digital Paperless Tenant KYC",
              desc: "Collect tenant photos, Aadhaar details, emergency contacts, and college/workplace info digitally. No physical paper files needed.",
              badge: "Paperless & Safe",
            },
            {
              icon: <CreditCard className="text-emerald-600" size={24} />,
              bg: "bg-emerald-50 border-emerald-100",
              title: "1-Click WhatsApp Rent Reminders",
              desc: "Send personalized WhatsApp rent reminders with pre-filled pending balances and your UPI ID. Log payments with zero fuss.",
              badge: "Fast Payments",
            },
            {
              icon: <Bed className="text-indigo-600" size={24} />,
              bg: "bg-indigo-50 border-indigo-100",
              title: "Real-Time Bed Occupancy Map",
              desc: "Track Single, Double, Triple, and Four-sharing beds. Instantly identify vacant beds and plan upcoming check-ins.",
              badge: "Bed-Level Precision",
            },
            {
              icon: <ShieldCheck className="text-amber-600" size={24} />,
              bg: "bg-amber-50 border-amber-100",
              title: "Direct Zero-Brokerage Inquiries",
              desc: "Your property is listed on PGSathi discovery portal. Students and workers call or WhatsApp you directly without brokers.",
              badge: "0% Commission",
            },
            {
              icon: <TrendingUp className="text-rose-600" size={24} />,
              bg: "bg-rose-50 border-rose-100",
              title: "Expense & Profit Tracking",
              desc: "Log electricity, water, cook salary, repair, and grocery bills to see your exact net monthly profit per property.",
              badge: "Financial Clarity",
            },
            {
              icon: <CheckCircle2 className="text-teal-600" size={24} />,
              bg: "bg-teal-50 border-teal-100",
              title: "Maintenance Ticket Resolution",
              desc: "Tenants report Wi-Fi, plumbing, or AC issues through their web link. Track resolution status without messy WhatsApp chats.",
              badge: "Tenant Satisfaction",
            },
          ].map((feat, idx) => (
            <div
              key={idx}
              className="bg-white p-7 rounded-3xl border border-neutral-200 shadow-sm hover:border-primary-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl ${feat.bg} border flex items-center justify-center p-2.5 group-hover:scale-105 transition-transform`}>
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
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
      <section className="container-max section-padding py-12">
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-sm max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-700 bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
              Honest &amp; Transparent
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mt-3 mb-2">
              Transparent Pricing Plans
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm">
              All plans include GST. Start with our 15-day free trial, no credit card required.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Starter Plan */}
            <div className="p-7 rounded-3xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1">
                  Discovery Only
                </span>
                <h3 className="text-xl font-black text-neutral-900">Starter Plan</h3>
                <div className="text-3xl font-black text-neutral-900 mt-2 mb-4">
                  ₹0 <span className="text-xs font-normal text-neutral-500">Free Lifetime</span>
                </div>
                <ul className="text-xs sm:text-sm space-y-2.5 text-neutral-700 font-medium">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> List 1 PG Property on Marketplace
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> 0% Brokerage Direct Tenant Calls
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> Photo &amp; Amenity Showcase
                  </li>
                </ul>
                <p className="text-xs text-neutral-500 mt-4 leading-relaxed">
                  Looking only to list your PG for tenant discovery? Check out our <Link href="/for-owners" className="text-primary-700 font-bold hover:underline">free PG listing website guide for owners</Link>.
                </p>
              </div>
              <Link
                href="/dashboard/owner/listings/new"
                className="mt-8 w-full py-3.5 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs sm:text-sm text-center transition-colors shadow-sm"
              >
                List PG for Free
              </Link>
            </div>

            {/* Standard Plan (Featured) */}
            <div className="p-7 rounded-3xl bg-white border-2 border-primary-600 flex flex-col justify-between relative shadow-xl ring-4 ring-primary-50">
              <span className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-primary-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                15 Days Free Trial
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-700 block mb-1">
                  Discovery + Cloud CRM
                </span>
                <h3 className="text-xl font-black text-neutral-900">Standard Plan</h3>
                <div className="text-3xl font-black text-primary-950 mt-2 mb-4">
                  ₹1,499 <span className="text-xs font-normal text-neutral-500">/ month (GST Incl.)</span>
                </div>
                <ul className="text-xs sm:text-sm space-y-2.5 text-neutral-800 font-medium">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> Up to 50 Beds CRM Management
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> 1-Click WhatsApp Rent Reminders with UPI
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> Digital Aadhaar KYC &amp; Expense Tracker
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/owner/listings/new"
                className="mt-8 w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm text-center transition-colors shadow-md shadow-primary-500/25"
              >
                Start 15-Day Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ Section ── */}
      <section className="container-max section-padding py-12">
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 max-w-4xl mx-auto shadow-sm">
          <div className="text-left mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-700 bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
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
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-200/60 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Harmonious Call-To-Action (Matching Home Page Tone) ── */}
      <section className="container-max section-padding">
        <div className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-14 text-center max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative z-10 space-y-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 text-primary-300 text-xs font-black uppercase tracking-wider border border-white/10">
              15 Days Free Trial • Instant Setup
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Ready to Modernize Your PG Business?
            </h2>
            <p className="text-neutral-400 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
              Join forward-thinking PG owners across India who collect rent on time and eliminate broker dependencies with PGSathi.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/owner/listings/new"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-all shadow-lg shadow-primary-500/25 min-h-[48px] flex items-center justify-center gap-2"
              >
                Start 15-Day Free Trial <ArrowRight size={16} />
              </Link>
              <Link
                href="/compare"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-sm border border-neutral-700 transition-all min-h-[48px] flex items-center justify-center"
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
