import Link from "next/link";
import { Search, MessageCircle, MapPin, CheckCircle2, Building } from "lucide-react";

export const metadata = {
  title: "How It Works | PGSathi",
  description: "Find your perfect PG with PGSathi in 3 simple steps without paying any brokerage. Search, Contact, and Move-in.",
};

export default function HowItWorksPage() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* ── Hero Section ── */}
      <section className="bg-white border-b border-neutral-200 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3"></div>
        <div className="container-max section-padding relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block py-1.5 px-4 rounded-full bg-primary-50 text-primary-700 font-bold text-sm mb-6 border border-primary-100 uppercase tracking-widest">
              For Tenants
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
              Finding a PG is now <span className="text-primary-600">100% Free</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 leading-relaxed mb-10">
              No brokers. No hidden fees. No middleman. Just you and the PG Owner.
            </p>
            <Link href="/search" className="btn-primary px-8 py-4 rounded-xl text-lg font-bold">
              Start Searching
            </Link>
          </div>
        </div>
      </section>

      {/* ── Steps Section ── */}
      <div className="container-max section-padding py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          
          <div className="relative pl-10 md:pl-0">
            {/* Desktop timeline line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-neutral-200 -translate-x-1/2"></div>
            {/* Mobile timeline line */}
            <div className="md:hidden absolute left-4 top-0 bottom-0 w-px bg-neutral-200"></div>

            {/* Step 1 */}
            <div className="relative flex flex-col md:flex-row items-center justify-between mb-16 md:mb-24">
              <div className="md:w-[45%] order-2 md:order-1 pt-6 md:pt-0 text-left md:text-right pr-0 md:pr-12">
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">1. Search & Filter</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Browse thousands of verified PGs across top cities. Use our smart filters to narrow down by budget, sharing type, gender, and amenities.
                </p>
              </div>
              <div className="absolute left-[-42px] md:static md:left-auto md:order-2 w-12 h-12 rounded-full bg-primary-100 border-4 border-white flex items-center justify-center shadow-sm z-10 mx-auto">
                <Search size={20} className="text-primary-600" />
              </div>
              <div className="md:w-[45%] order-1 md:order-3">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 aspect-video flex items-center justify-center">
                  <div className="w-full space-y-4">
                    <div className="h-4 bg-neutral-100 rounded w-1/3"></div>
                    <div className="h-10 bg-neutral-50 rounded-xl border border-neutral-200 w-full"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-neutral-100 rounded-lg w-1/4"></div>
                      <div className="h-8 bg-neutral-100 rounded-lg w-1/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col md:flex-row items-center justify-between mb-16 md:mb-24">
              <div className="md:w-[45%] order-1 md:order-1">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 aspect-video flex items-center justify-center">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 border border-green-100 w-full">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center"><MessageCircle size={24} className="text-white" /></div>
                    <div>
                      <div className="h-4 bg-green-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-green-100 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute left-[-42px] md:static md:left-auto md:order-2 w-12 h-12 rounded-full bg-green-100 border-4 border-white flex items-center justify-center shadow-sm z-10 mx-auto">
                <MessageCircle size={20} className="text-green-600" />
              </div>
              <div className="md:w-[45%] order-2 md:order-3 pt-6 md:pt-0 pl-0 md:pl-12">
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">2. Contact Owner Directly</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Liked a PG? Click the "WhatsApp" or "Call" button to connect directly with the PG owner. We don't hide their numbers.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-[45%] order-2 md:order-1 pt-6 md:pt-0 text-left md:text-right pr-0 md:pr-12">
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">3. Visit & Move in</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Visit the property, check the rooms, pay the rent directly to the owner, and move in! All without paying a single rupee to PGSathi.
                </p>
              </div>
              <div className="absolute left-[-42px] md:static md:left-auto md:order-2 w-12 h-12 rounded-full bg-violet-100 border-4 border-white flex items-center justify-center shadow-sm z-10 mx-auto">
                <Building size={20} className="text-violet-600" />
              </div>
              <div className="md:w-[45%] order-1 md:order-3">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 aspect-video flex items-center justify-center relative overflow-hidden">
                   <MapPin size={48} className="text-violet-200 absolute right-4 bottom-4" />
                   <div className="flex items-center gap-2">
                     <CheckCircle2 size={32} className="text-violet-600" />
                     <span className="text-xl font-bold text-neutral-900">All Set!</span>
                   </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* ── Final CTA ── */}
      <section className="bg-primary-950 text-white py-16 text-center">
        <div className="container-max section-padding">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to find your new home?</h2>
          <Link href="/search" className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-bold transition-all">
            Explore PGs Near You
          </Link>
        </div>
      </section>
    </div>
  );
}
