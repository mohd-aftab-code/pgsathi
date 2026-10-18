
import Link from "next/link";
import {
  CheckCircle2,
  TrendingUp,
  Users,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  ChevronDown,
  PhoneCall,
  IndianRupee,
  Search,
} from "lucide-react";
import { constructMetadata } from "@/lib/seo";
import { safeJsonLd } from "@/lib/json-ld";
import Breadcrumbs from "@/components/common/Breadcrumbs";

export const metadata = constructMetadata({
  title: "Free PG Listing Website | List Your PG Online Free | PGSathi",
  description:
    "List your PG online free on PGSathi, a trusted free PG listing website in India. Connect with verified tenants directly with zero brokerage, direct WhatsApp leads, and free listing tools.",
  canonicalPath: "/for-owners",
  keywords: [
    "Free PG listing website",
    "List your PG online free",
    "PG listing website in India",
    "Free PG listing",
    "List PG online",
    "PG owner registration",
    "Zero brokerage PG leads",
    "Hostel listing website India",
  ],
});

const FOR_OWNERS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PGSathi Free PG Listing Website & CRM for Owners",
  "operatingSystem": "Web, Mobile Browser, Android, iOS",
  "applicationCategory": "BusinessApplication",
  "description":
    "Free PG listing website in India. List your PG online free, receive direct WhatsApp inquiries from students and professionals, and manage rent collection with zero commission.",
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter Plan",
      "price": "0",
      "priceCurrency": "INR",
      "description": "1 Free PG Listing on PGSathi with 0% brokerage forever",
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
      "description": "Full PG Manager CRM, WhatsApp reminders, and 15-day free trial",
    },
  ],
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
      "name": "For Owners",
      "item": "https://pgsathi.in/for-owners",
    },
  ],
};

const OWNER_FAQS = [
  {
    q: "Is listing my PG on PGSathi really 100% free?",
    a: "Yes! Listing your first property on PGSathi is completely free forever. You can upload photos, room configurations (single, double, triple sharing), rent details, amenities, and contact info without paying any registration fee.",
  },
  {
    q: "Do you take any broker commission when a tenant books a room?",
    a: "Zero commission! We are strictly anti-brokerage. Tenants discover your PG and contact your phone or WhatsApp directly. You keep 100% of the rent and security deposit.",
  },
  {
    q: "How do tenant inquiries reach me?",
    a: "When a student or working professional likes your PG on PGSathi, they tap 'Call Owner' or 'Connect on WhatsApp'. The inquiry lands straight in your WhatsApp or phone dialer with property details already filled in.",
  },
  {
    q: "How long does it take for my PG listing to appear online?",
    a: "Your listing goes live instantly in draft/review mode and is published to public search within a few hours following our automated verification checks.",
  },
  {
    q: "Can I also manage rent collection and tenant KYC on PGSathi?",
    a: "Yes! Every registered owner gets a 15-day free trial of our PGSathi Cloud CRM. You can send 1-click WhatsApp rent payment links with your UPI, record Aadhaar KYC, and track bed vacancies in one easy dashboard.",
  },
  {
    q: "What if I have multiple PG properties or branches?",
    a: "PGSathi seamlessly supports multi-property owners. You can manage multiple buildings, separate wardens or managers, and consolidate overall monthly revenue reports in one place.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": OWNER_FAQS.map((item) => ({
    "@type": "Question",
    "name": item.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.a,
    },
  })),
};

export default function ForOwnersPage() {
  return (
    <div className="bg-neutral-50 min-h-screen pb-20 selection:bg-primary-100 selection:text-primary-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(FOR_OWNERS_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(BREADCRUMB_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(FAQ_SCHEMA) }} />

      {/* ── 1. Hero Section (Unified with Homepage Left-Right Layout) ── */}
      <section className="relative bg-neutral-50 pt-6 pb-12 sm:pt-10 sm:pb-16 md:pt-14 md:pb-20 overflow-hidden border-b border-neutral-200/80">
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#171717 1px, transparent 1px), linear-gradient(90deg, #171717 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="container-max section-padding relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] xl:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-8 items-center">
            {/* ── Left Column: Value Copy + Highlights + Actions ── */}
            <div>
              <div className="mb-4">
                <Breadcrumbs items={[{ label: "For PG Owners" }]} />
              </div>

              <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs md:text-sm font-bold text-primary-700 uppercase tracking-widest mb-4 sm:mb-5 bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
                <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                <span>Zero Brokerage • 100% Direct Tenant Leads</span>
              </div>

              <h1
                className="text-[2.1rem] sm:text-4xl md:text-5xl lg:text-[3.2rem] font-extrabold text-neutral-900 leading-[1.15] mb-5 tracking-tight"
                style={{ textWrap: "balance" }}
              >
                Free PG Listing Website in India — <br className="hidden lg:block" />
                <span className="text-primary-700">List Your PG Online Free.</span>
              </h1>

              <p className="text-sm md:text-lg text-neutral-600 mb-7 max-w-xl leading-relaxed">
                Connect directly with verified students and working professionals. Use our free PG listing website to publish your property, get direct WhatsApp inquiries with zero brokerage, and fill vacant beds fast.
              </p>

              {/* 3 Benefit Feature Rows (Matching Homepage Aesthetic) */}
              <div className="flex flex-col gap-3 text-sm md:text-base text-neutral-600 mb-8 max-w-xl">
                <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-[0_2px_8px_rgb(0,0,0,0.03)] hover:border-emerald-200 transition-colors">
                  <div className="bg-emerald-50 text-emerald-700 p-2 rounded-xl shrink-0 mt-0.5">
                    <TrendingUp size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <strong className="text-neutral-900 block font-bold text-sm">100% Free Listing &amp; Zero Brokerage:</strong>
                    <span className="text-neutral-500 text-xs sm:text-sm">Keep 100% of your rent &amp; deposit. No commission cuts or middleman charges forever.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-[0_2px_8px_rgb(0,0,0,0.03)] hover:border-primary-200 transition-colors">
                  <div className="bg-primary-50 text-primary-700 p-2 rounded-xl shrink-0 mt-0.5">
                    <MessageCircle size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <strong className="text-neutral-900 block font-bold text-sm">Direct Phone &amp; WhatsApp Inquiries:</strong>
                    <span className="text-neutral-500 text-xs sm:text-sm">Tenants discover your PG and contact your phone or WhatsApp directly with pre-filled room details.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-[0_2px_8px_rgb(0,0,0,0.03)] hover:border-violet-200 transition-colors">
                  <div className="bg-violet-50 text-violet-700 p-2 rounded-xl shrink-0 mt-0.5">
                    <Smartphone size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <strong className="text-neutral-900 block font-bold text-sm">Smart PG Cloud CRM &amp; 15-Day Free Trial:</strong>
                    <span className="text-neutral-500 text-xs sm:text-sm">Send 1-click WhatsApp rent reminders with UPI, record Aadhaar KYC &amp; track bed vacancies.</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8">
                <Link
                  href="/dashboard/owner/listings/new"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 min-h-[48px]"
                >
                  List Your PG for Free <ArrowRight size={18} />
                </Link>
                <Link
                  href="/pg-management-software"
                  className="bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all text-center min-h-[48px] shadow-sm flex items-center justify-center"
                >
                  Explore PG CRM Software
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-x-6 sm:gap-y-3 text-sm">
                <div className="bg-white sm:bg-transparent py-2.5 px-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-neutral-200 shadow-sm sm:shadow-none flex flex-col sm:flex-row items-center sm:items-baseline">
                  <span className="font-extrabold text-neutral-900 text-lg sm:text-sm sm:mr-1">10,000+</span>
                  <span className="font-medium text-neutral-500 text-xs sm:text-sm">Active Owners</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:block" />
                <div className="bg-white sm:bg-transparent py-2.5 px-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-neutral-200 shadow-sm sm:shadow-none flex flex-col sm:flex-row items-center sm:items-baseline">
                  <span className="font-extrabold text-emerald-600 text-lg sm:text-sm sm:mr-1">0%</span>
                  <span className="font-medium text-neutral-500 text-xs sm:text-sm">Broker Commission</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:block" />
                <div className="bg-white sm:bg-transparent py-2.5 px-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-neutral-200 shadow-sm sm:shadow-none flex flex-col sm:flex-row items-center sm:items-baseline">
                  <span className="font-extrabold text-neutral-900 text-lg sm:text-sm sm:mr-1">2 Mins</span>
                  <span className="font-medium text-neutral-500 text-xs sm:text-sm">Instant Setup</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:block" />
                <div className="bg-white sm:bg-transparent py-2.5 px-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-neutral-200 shadow-sm sm:shadow-none flex flex-col sm:flex-row items-center sm:items-baseline">
                  <span className="font-extrabold text-primary-700 text-lg sm:text-sm sm:mr-1">₹0</span>
                  <span className="font-medium text-neutral-500 text-xs sm:text-sm">Forever Free</span>
                </div>
              </div>
            </div>

            {/* ── Right Column: Interactive PG Owner Experience Showcase ── */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/60 via-primary-100/40 to-violet-100/40 rounded-3xl blur-2xl transform scale-105 pointer-events-none" />

              <div className="relative space-y-4">
                {/* Main WhatsApp Lead Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-neutral-200/90 p-5 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                        <MessageCircle size={22} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-neutral-900">Direct WhatsApp Inquiry</h4>
                        <p className="text-[11px] text-neutral-500">Delivered via PGSathi • Just now</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                      100% Direct
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
                      <span>Rohan Sharma (Working in Noida Sec 62)</span>
                      <span className="text-emerald-600 font-extrabold bg-emerald-100/60 px-2 py-0.5 rounded">0% Brokerage</span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      &quot;Namaste! I saw your PG listing on PGSathi. I need a Single AC room with food from 1st of next month. Is a room currently vacant for visit today?&quot;
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span className="font-medium">Caller: Verified Mobile</span>
                      <span className="font-bold text-neutral-700">+91 98721 •••••</span>
                    </div>
                    <div className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-default">
                      <PhoneCall size={14} /> Direct Call / WhatsApp Connected
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-primary-600" />
                      Zero Middlemen
                    </span>
                    <span className="text-primary-700 font-bold">Instant Tenant Connection</span>
                  </div>
                </div>

                {/* Overlapping Floating Feature Badge */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200 p-4 shadow-lg flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-neutral-900">Bed Occupancy Boost</div>
                      <div className="text-[11px] text-neutral-500">Fill vacant beds 3x faster with local students</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-black text-xs rounded-lg border border-emerald-100 shrink-0">
                    +40% Faster
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. Trust Stats Bar ── */}
      <section className="container-max section-padding -mt-8 relative z-20">
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-primary-700">10,000+</div>
            <div className="text-xs sm:text-sm font-bold text-neutral-700">Active PG Owners</div>
            <p className="text-[11px] text-neutral-500">Across major educational hubs</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">0%</div>
            <div className="text-xs sm:text-sm font-bold text-neutral-700">Broker Commission</div>
            <p className="text-[11px] text-neutral-500">Keep 100% of your earnings</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-neutral-900">2 Mins</div>
            <div className="text-xs sm:text-sm font-bold text-neutral-700">Instant Setup</div>
            <p className="text-[11px] text-neutral-500">From mobile or desktop</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-primary-950">₹0</div>
            <div className="text-xs sm:text-sm font-bold text-neutral-700">Registration Fee</div>
            <p className="text-[11px] text-neutral-500">Free starter discovery plan</p>
          </div>
        </div>
      </section>

      {/* ── 3. How It Works (3 Simple Steps to Fill Beds) ── */}
      <section className="py-16 sm:py-20 bg-neutral-50">
        <div className="container-max section-padding">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-700 bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
              Fast &amp; Transparent
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight mt-3 mb-3">
              How to List Your PG Online Free in 3 Simple Steps
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Listing your property on our free PG listing website in India takes just a few minutes. Connect directly with genuine tenants with zero brokerage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Step 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center font-black text-lg mb-5 border border-primary-100">
                01
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-2">Create Your Free Owner Account</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Sign up in under 2 minutes with your mobile number. No credit card or registration fee required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-lg mb-5 border border-emerald-100">
                02
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-2">Add Photos, Sharing &amp; Rent</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Upload PG photos, set monthly rent for single, double, or triple sharing rooms, select amenities (Wi-Fi, AC, Food), and specify rules.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center font-black text-lg mb-5 border border-violet-100">
                03
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-2">Publish Live &amp; Receive Inquiries</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Your property goes live on our free PG listing website. Interested tenants call or WhatsApp you directly without any broker commissions.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/dashboard/owner/listings/new"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-primary-500/20"
            >
              Create Your First Free Listing Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. Benefits Grid (Why Owners Choose PGSathi) ── */}
      <section className="py-16 sm:py-20 bg-white border-y border-neutral-200/80">
        <div className="container-max section-padding">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-700 bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
              Why Owners Choose Us
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mt-3 mb-3">
              Built to Solve PG Landlord Headaches
            </h2>
            <p className="text-neutral-500 text-sm sm:text-base">
              Everything you need to fill vacant beds and run your property like a modern business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-neutral-50 p-7 sm:p-8 rounded-3xl border border-neutral-200 hover:border-primary-300 hover:bg-white hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-2">Direct WhatsApp Inquiries</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                No middlemen or delayed callbacks. Verified tenants call or message your WhatsApp directly right from your listing page.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-neutral-50 p-7 sm:p-8 rounded-3xl border border-neutral-200 hover:border-primary-300 hover:bg-white hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 border border-primary-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-2">Zero Brokerage Forever</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Stop losing 15 to 30 days of rent to local brokers. Save ₹10,000 to ₹50,000 every single admission cycle.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-neutral-50 p-7 sm:p-8 rounded-3xl border border-neutral-200 hover:border-primary-300 hover:bg-white hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-violet-50 text-violet-600 border border-violet-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Smartphone size={24} />
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-2">Smart PG Manager CRM</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-3">
                Send 1-click WhatsApp rent reminders, track real-time bed occupancy, store Aadhaar KYC, and log expenses in one dashboard.
              </p>
              <Link
                href="/pg-management-software"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-800"
              >
                Explore PG management software <ArrowRight size={14} />
              </Link>
            </div>

            {/* Card 4 */}
            <div className="bg-neutral-50 p-7 sm:p-8 rounded-3xl border border-neutral-200 hover:border-primary-300 hover:bg-white hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-2">Locality Search Engine Boost</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Rank on Google and PGSathi search for student hotspots like Noida Sector 62, South Campus, Cyber City, and Knowledge Park.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-neutral-50 p-7 sm:p-8 rounded-3xl border border-neutral-200 hover:border-primary-300 hover:bg-white hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-2">Verified Owner Trust Badge</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Parents and outstation students trust verified listings 3x more. Stand out with official green verification credentials.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-neutral-50 p-7 sm:p-8 rounded-3xl border border-neutral-200 hover:border-primary-300 hover:bg-white hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <IndianRupee size={24} />
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-2">Automated Rent &amp; KYC</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                No awkward phone calls on the 1st of every month. Send automated UPI payment links and collect Aadhaar KYC digitally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Old Way vs PGSathi Way Comparison ── */}
      <section className="py-16 sm:py-20 bg-neutral-50">
        <div className="container-max section-padding">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-700 bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
              The Smarter Way
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mt-3 mb-3">
              Traditional Method vs. PGSathi
            </h2>
            <p className="text-neutral-500 text-sm sm:text-base">
              See why modern PG owners are leaving offline registers and brokers behind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* The Old Way */}
            <div className="bg-white rounded-3xl p-7 sm:p-8 border border-neutral-200 shadow-sm relative">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <h3 className="text-lg font-black text-neutral-900">The Traditional Nightmare</h3>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-neutral-600">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    ✕
                  </div>
                  <span>Pay 15 to 30 days rent commission to local brokers for every tenant.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    ✕
                  </div>
                  <span>Chasing tenants for rent payments across multiple WhatsApp chats and phone calls.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    ✕
                  </div>
                  <span>Losing paper Aadhaar photocopies and risking police verification compliance.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    ✕
                  </div>
                  <span>Confusion over which beds are vacant when students leave unexpectedly.</span>
                </li>
              </ul>
            </div>

            {/* The PGSathi Way */}
            <div className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-primary-600 shadow-xl relative ring-4 ring-primary-50">
              <span className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-primary-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                Modern &amp; Automated
              </span>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h3 className="text-lg font-black text-neutral-900">The PGSathi System</h3>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-neutral-800 font-medium">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>100% Free Listing &amp; 0% Commission. Keep all your rental earnings.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>1-Click WhatsApp payment reminders with UPI link for 3x faster rent collection.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Encrypted digital tenant Aadhaar KYC saved securely in your cloud portal.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Real-time bed inventory tracking shows vacant, occupied, and booked beds instantly.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Transparent Pricing Plans ── */}
      <section className="py-16 sm:py-20 bg-white border-y border-neutral-200/80">
        <div className="container-max section-padding">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-700 bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
              Simple Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mt-3 mb-3">
              Pick the Right Plan for Your PG
            </h2>
            <p className="text-neutral-500 text-sm sm:text-base">
              Start free today and upgrade only when you want automated CRM management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* Starter Plan */}
            <div className="p-7 sm:p-8 rounded-3xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between hover:border-neutral-300 transition-all">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1">
                  Discovery Portal
                </span>
                <h3 className="text-xl font-black text-neutral-900">Starter Listing Plan</h3>
                <div className="text-3xl font-black text-neutral-900 mt-2 mb-4">
                  ₹0 <span className="text-xs font-normal text-neutral-500">/ Free Forever</span>
                </div>
                <p className="text-xs text-neutral-600 mb-6 leading-relaxed">
                  Ideal for standalone PG owners looking to list their property and receive verified tenant leads without brokers.
                </p>
                <ul className="text-xs sm:text-sm space-y-3 text-neutral-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> 1 Free Public PG Listing
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> Direct Phone &amp; WhatsApp Calls
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> 0% Brokerage on all bookings
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> Photos, amenities &amp; room pricing
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/owner/listings/new"
                className="mt-8 w-full py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm text-center transition-colors shadow-sm"
              >
                List PG for Free
              </Link>
            </div>

            {/* Standard Plan (Featured) */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white border-2 border-primary-600 flex flex-col justify-between relative shadow-xl ring-4 ring-primary-50">
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
                <p className="text-xs text-neutral-600 mb-6 leading-relaxed">
                  Full software suite for PG owners who want to automate rent collection, maintain digital KYC, and track bed vacancies.
                </p>
                <ul className="text-xs sm:text-sm space-y-3 text-neutral-800 font-medium">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> Everything in Starter Plan
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> Up to 50 Beds CRM Management
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> 1-Click WhatsApp Rent Reminders with UPI
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> Digital Aadhaar KYC &amp; Expense Tracker
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> Priority Ranking in Locality Search
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/owner/listings/new"
                className="mt-8 w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm text-center transition-colors shadow-md shadow-primary-500/25"
              >
                Start 15-Day Free Trial
              </Link>
              <p className="text-xs text-neutral-500 mt-3 text-center">
                Need more CRM details? <Link href="/pg-management-software" className="text-primary-600 font-bold hover:underline">Explore PG Management Software</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Owner FAQs with Accordion ── */}
      <section className="container-max section-padding py-16">
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 max-w-4xl mx-auto shadow-sm">
          <div className="text-left mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-700 bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-3 mb-2">
              Frequently Asked Questions for PG Owners
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm">
              Everything you need to know about listing your property and our CRM tools.
            </p>
          </div>

          <div className="space-y-3">
            {OWNER_FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-neutral-200/80 bg-neutral-50/50 open:bg-white open:border-primary-200 open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between p-4 sm:p-5 font-bold text-sm sm:text-base text-neutral-900 cursor-pointer list-none select-none">
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

      {/* ── 8. Bottom Call To Action Banner ── */}
      <section className="container-max section-padding">
        <div className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-14 text-center max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
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
              Free Registration • 2-Minute Setup
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Ready to Fill Your Vacant Beds with Zero Brokerage?
            </h2>
            <p className="text-neutral-400 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
              Join thousands of verified PG owners across Delhi-NCR, Noida, Gurgaon, and Kota. Start generating direct tenant inquiries today.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/owner/listings/new"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-all shadow-lg shadow-primary-500/25 min-h-[48px] flex items-center justify-center gap-2"
              >
                List Your PG for Free <ArrowRight size={16} />
              </Link>
              <Link
                href="/pg-management-software"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-sm border border-neutral-700 transition-all min-h-[48px] flex items-center justify-center"
              >
                Explore PG CRM Software
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

