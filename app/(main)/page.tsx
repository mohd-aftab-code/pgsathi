import HeroSection from "@/components/landing/HeroSection";
import CityGrid from "@/components/landing/CityGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import TrustSection from "@/components/landing/TrustSection";
import FeaturedListings from "@/components/landing/FeaturedListings";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import PGCardSkeleton from "@/components/listings/PGCardSkeleton";
import { safeJsonLd } from "@/lib/json-ld";

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Is finding a PG on PGSathi really zero brokerage?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. We never charge any fees from tenants — from searching to getting the owner's number, everything is completely free." } },
    { "@type": "Question", "name": "How are the listings verified?", "acceptedAnswer": { "@type": "Answer", "text": "Our team reviews every new PG before the listing goes live — we check the address, photos, and owner details." } },
    { "@type": "Question", "name": "How do I contact the PG owner?", "acceptedAnswer": { "@type": "Answer", "text": "You will find a 'Contact Owner' or 'WhatsApp' button on every listing — you connect directly to the owner's phone number, with no middlemen." } },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(FAQ_SCHEMA) }}
      />
      <HeroSection />
      <CityGrid />
      <HowItWorks />
      <TrustSection />

      {/* Featured PGs Section */}
      <Suspense fallback={
        <section className="py-20 bg-white">
          <div className="container-max section-padding">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <div className="h-10 bg-neutral-200 rounded-md w-64 mb-4 animate-pulse"></div>
                <div className="h-6 bg-neutral-200 rounded-md w-96 animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <PGCardSkeleton />
              <PGCardSkeleton />
              <PGCardSkeleton />
            </div>
          </div>
        </section>
      }>
        <FeaturedListings />
      </Suspense>

      <Testimonials />
      <FAQ />

      {/* CTA Section for Owners */}
      <section className="py-20 md:py-24 bg-primary-950 text-white">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
            {/* Left: copy + benefits */}
            <div>
              <div className="inline-flex items-center gap-2.5 text-xs font-bold text-primary-300 uppercase tracking-widest mb-5">
                <span className="w-6 h-px bg-primary-400" />
                For PG Owners
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-[2.6rem] font-extrabold mb-5 text-white tracking-tight leading-[1.15]" style={{ textWrap: "balance" }}>
                Are you a PG Owner? List on PGSathi.
              </h2>
              <p className="text-primary-200/70 text-base md:text-lg mb-9 max-w-xl leading-relaxed">
                Join 10,000+ owners getting verified leads directly on WhatsApp — manage tenants and rent from one dashboard, zero commission.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  "100% Free Basic Listing",
                  "Direct WhatsApp Leads",
                  "No Brokerage / Commission",
                  "Easy Dashboard Management",
                ].map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2.5 font-medium text-primary-50 text-sm">
                    <CheckCircle2 className="text-primary-400 shrink-0" size={17} />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: action card */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl">
              <p className="text-xs font-bold text-primary-700 uppercase tracking-widest mb-2">Get started free</p>
              <h3 className="text-2xl font-extrabold text-neutral-900 mb-6">List your first PG in under 5 minutes</h3>
              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard/owner/listings/new"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2.5"
                >
                  List Your PG Now <ArrowRight size={18} />
                </Link>
                <Link
                  href="/for-owners"
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-6 py-4 rounded-xl font-bold transition-colors flex items-center justify-center"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
