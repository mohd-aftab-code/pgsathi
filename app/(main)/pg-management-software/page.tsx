import Link from "next/link";
import { CheckCircle2, TrendingUp, Shield, Smartphone, Zap, ArrowRight, Building, Users, CreditCard, ChevronDown } from "lucide-react";
import { constructMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { safeJsonLd } from "@/lib/json-ld";

const SOFTWARE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PGSathi Business",
  "operatingSystem": "Web, Mobile",
  "applicationCategory": "BusinessApplication",
  "description": "Smart PG Management Software to manage tenants, collect rent, automate billing, and track expenses effortlessly.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "154"
  }
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Is the PG management software really free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, our basic PG management software and CRM is completely free to use. You can manage tenants, track expenses, and collect rent without paying any platform fees." } },
    { "@type": "Question", "name": "Do tenants need to download an app?", "acceptedAnswer": { "@type": "Answer", "text": "No! Your tenants can manage their complaints and check dues via a simple mobile-friendly web link, without downloading heavy apps." } },
    { "@type": "Question", "name": "How does automated rent collection work?", "acceptedAnswer": { "@type": "Answer", "text": "The system automatically sends WhatsApp and SMS reminders to tenants when rent is due. Once they pay, you can log it instantly, updating your dashboard in real-time." } },
  ]
};

export const metadata = constructMetadata({
  title: "PG Management Software & Cloud CRM - PGSathi",
  description: "Automate your PG business with the best PG Management Software in India. Features include tenant management, rent collection, digital KYC, and expense tracking.",
  canonicalPath: "/pg-management-software",
  keywords: ["PG Management Software", "Hostel Management App", "Cloud CRM for PG", "PG Billing Software", "Tenant Management System India"]
});

export default function PGManagementSoftwarePage() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(SOFTWARE_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(FAQ_SCHEMA) }} />

      {/* ── Hero Section ── */}
      <section className="bg-white border-b border-neutral-200 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="container-max section-padding relative z-10">
          <div className="mb-8">
            <Breadcrumbs items={[{ label: "PG Management Software" }]} />
          </div>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="max-w-2xl mx-auto lg:mx-0 text-left">
              <span className="inline-block py-1.5 px-4 rounded-full bg-primary-50 text-primary-700 font-bold text-sm mb-6 border border-primary-100 uppercase tracking-widest">
                India's #1 PG Cloud CRM
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-neutral-900 mb-6 tracking-tight leading-[1.1]" style={{ textWrap: "balance" }}>
                Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-violet-500">PG Management Software</span> to Grow Your Business
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10">
                Stop using pen and paper. Manage tenants, collect rent, automate billing, and track expenses effortlessly from your smartphone or laptop with zero technical knowledge.
              </p>
              <div className="flex flex-col sm:flex-row items-start lg:items-center justify-start gap-4">
                <Link href="/dashboard/owner/listings/new" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25">
                  Start Free Trial <ArrowRight size={18} />
                </Link>
                <Link href="/for-owners" className="bg-white border-2 border-neutral-200 text-neutral-800 hover:border-primary-500 hover:text-primary-700 px-8 py-4 rounded-xl font-bold transition-all w-full sm:w-auto text-center">
                  See Free Features
                </Link>
              </div>
            </div>

            {/* Right Graphic */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-100 to-violet-50 rounded-full blur-3xl opacity-50 transform scale-110"></div>
              <div className="relative bg-white border border-neutral-100 rounded-3xl shadow-2xl p-6 lg:p-8 max-w-md mx-auto">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-100">
                  <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                    <Building size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">Sunshine PG</h3>
                    <p className="text-sm text-neutral-500">Occupancy: 42/50 Beds</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900 text-sm">Rent Collected</div>
                        <div className="text-xs text-neutral-500">This Month</div>
                      </div>
                    </div>
                    <div className="font-black text-emerald-600">₹1,45,000</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Users size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900 text-sm">Pending Dues</div>
                        <div className="text-xs text-neutral-500">3 Tenants</div>
                      </div>
                    </div>
                    <div className="font-black text-orange-600">₹12,500</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="container-max section-padding py-16 md:py-24">
        <div className="text-left mb-16 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Everything you need to run your PG</h2>
          <p className="text-lg text-neutral-600">Our software is designed specifically for Indian PG owners, Hostels, and Co-living spaces.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Smartphone className="text-blue-500" size={32} />,
              bg: "bg-blue-50",
              title: "Digital Tenant Onboarding",
              desc: "Collect KYC documents securely and onboard tenants in seconds using our paperless system."
            },
            {
              icon: <CreditCard className="text-emerald-500" size={32} />,
              bg: "bg-emerald-50",
              title: "Automated Rent Collection",
              desc: "Send automated WhatsApp/SMS reminders for rent dues and record payments instantly."
            },
            {
              icon: <Shield className="text-violet-500" size={32} />,
              bg: "bg-violet-50",
              title: "Verified Leads (Zero Brokerage)",
              desc: "Get directly connected to verified tenants searching for PGs in your area without paying agents."
            },
            {
              icon: <TrendingUp className="text-orange-500" size={32} />,
              bg: "bg-orange-50",
              title: "Expense & Profit Tracking",
              desc: "Log daily expenses (electricity, groceries, staff salary) and see your real-time profitability."
            },
            {
              icon: <Zap className="text-yellow-500" size={32} />,
              bg: "bg-yellow-50",
              title: "Bed & Room Inventory",
              desc: "Know exactly which beds are vacant, occupied, or under maintenance at a single glance."
            },
            {
              icon: <CheckCircle2 className="text-primary-500" size={32} />,
              bg: "bg-primary-50",
              title: "Complaint Management",
              desc: "Allow tenants to raise issues digitally and track repairs until they are resolved."
            }
          ].map((feat, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all group">
              <div className={`w-16 h-16 rounded-2xl ${feat.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">{feat.title}</h3>
              <p className="text-neutral-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="bg-white py-16 md:py-24 border-t border-neutral-200">
        <div className="container-max section-padding">
          <div className="text-left mb-12 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-neutral-600">Everything you need to know about our PG Management Software.</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ_SCHEMA.mainEntity.map((faq, index) => (
              <details key={index} className="group bg-neutral-50 rounded-2xl border border-neutral-200 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer text-lg font-bold text-neutral-900">
                  {faq.name}
                  <ChevronDown className="w-5 h-5 text-neutral-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-neutral-600 leading-relaxed">
                  {faq.acceptedAnswer.text}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-neutral-900 py-20 relative overflow-hidden text-left md:text-center">
        <div className="container-max relative z-10 px-4">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to digitize your PG?</h2>
          <p className="text-xl text-neutral-400 max-w-2xl md:mx-auto mb-10">Join thousands of PG owners across India who are saving time and increasing profits with PGSathi.</p>
          <Link href="/dashboard/owner/listings/new" className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-primary-500/20 w-full sm:w-auto text-center">
            Create Your Free Account Now
          </Link>
        </div>
      </section>
    </div>
  );
}
