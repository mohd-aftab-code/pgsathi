import HeroSection from "@/components/landing/HeroSection";
import CityGrid from "@/components/landing/CityGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import TrustSection from "@/components/landing/TrustSection";
import FeaturedListings from "@/components/landing/FeaturedListings";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import SoftwareShowcase from "@/components/landing/SoftwareShowcase";
import PartnerBanner from "@/components/landing/PartnerBanner";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import PGCardSkeleton from "@/components/listings/PGCardSkeleton";
import { safeJsonLd } from "@/lib/json-ld";

import { constructMetadata } from "@/lib/seo";

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is finding a PG on PGSathi really zero brokerage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. We never charge any fees from tenants — from searching to getting the owner's number, everything is completely free. PG owners subscribe for listings and leads, which keeps the platform running. You do not pay brokerage at any stage."
      }
    },
    {
      "@type": "Question",
      "name": "How are the listings verified?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our team reviews every new PG before the listing goes live — we check the address, photos, and owner details. Verified listings have a \"VERIFIED\" badge, so you can proceed with confidence."
      }
    },
    {
      "@type": "Question",
      "name": "How do I contact the PG owner?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You will find a \"Contact Owner\" or WhatsApp button on every listing — you connect directly to the owner's phone number, with no middlemen. You can also call or book a visit."
      }
    },
    {
      "@type": "Question",
      "name": "I am a PG owner — how do I list my property?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Click on \"List Your PG\", enter your property details and photos — basic listing is free. For more leads and a complete PG-management dashboard, paid plans are available, which include a 15-day free trial."
      }
    }
  ],
};

const SOFTWARE_APPLICATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PGSathi PG List Platform & CRM",
  "operatingSystem": "Web, Mobile Browser, Android, iOS",
  "applicationCategory": "BusinessApplication",
  "description": "India's #1 PG list platform and Cloud CRM for PG owners and tenants. Automated rent collection, bed inventory, digital KYC, and zero brokerage leads.",
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter Plan",
      "price": "0",
      "priceCurrency": "INR",
      "description": "1 Free PG Listing on PGSathi with 0% brokerage"
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
        "unitText": "MONTH"
      },
      "description": "PG Manager CRM, 50 tenants, 1-click WhatsApp reminders, and direct leads"
    },
    {
      "@type": "Offer",
      "name": "Pro Plan",
      "price": "2199",
      "priceCurrency": "INR",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "2199",
        "priceCurrency": "INR",
        "unitText": "MONTH"
      },
      "description": "Up to 3 PGs, 150 tenants, staff logins, and priority ranking"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "320"
  }
};

export const metadata = constructMetadata({
  title: "PGSathi: India's #1 PG List Platform & Management Software",
  description: "India's #1 PG list platform. Find 100% verified zero brokerage PGs, get direct tenant leads, use free PG management software, or earn as a partner.",
  canonicalPath: "/",
  keywords: ["PG list platform", "PG listing platform", "Zero brokerage PG", "Paying guest list", "PG management software India"],
});

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(FAQ_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(SOFTWARE_APPLICATION_SCHEMA) }}
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
      
      {/* ── Partner & Owner Sections ── */}
      <PartnerBanner />
      <SoftwareShowcase />

      {/* CTA Section for Owners */}
      <section className="py-12 md:py-24 bg-primary-950 text-white">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-16 items-center">
            {/* Left: copy + benefits */}
            <div>
              <div className="inline-flex items-center gap-2.5 text-xs font-bold text-primary-300 uppercase tracking-widest mb-3 sm:mb-5">
                <span className="w-6 h-px bg-primary-400" />
                For PG Owners
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-5 text-white tracking-tight leading-[1.15]">
                Are you a PG Owner? List on PGSathi.
              </h2>
              <p className="text-primary-200/70 text-sm sm:text-base md:text-lg mb-6 sm:mb-9 max-w-xl leading-relaxed">
                Join 10,000+ owners getting verified leads directly on WhatsApp — manage tenants and rent from one dashboard, zero commission.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 sm:gap-y-4">
                {[
                  "100% Free Basic Listing",
                  "Direct WhatsApp Leads",
                  "No Brokerage / Commission",
                  "Easy Dashboard Management",
                ].map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2.5 font-medium text-primary-50 text-xs sm:text-sm">
                    <CheckCircle2 className="text-primary-400 shrink-0" size={16} />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: action card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl">
              <p className="text-[11px] sm:text-xs font-bold text-primary-700 uppercase tracking-widest mb-1.5 sm:mb-2">Get started free</p>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mb-5 sm:mb-6 leading-tight">List your first PG in under 5 minutes</h3>
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <Link
                  href="/dashboard/owner/listings/new"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-[0.98] min-h-[44px]"
                >
                  List Your PG Now <ArrowRight size={17} />
                </Link>
                <Link
                  href="/for-owners"
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl font-bold transition-all flex items-center justify-center text-sm sm:text-base active:scale-[0.98] min-h-[44px]"
                >
                  Learn More
                </Link>
                <Link
                  href="/pg-management-software"
                  className="text-primary-700 hover:text-primary-900 px-4 py-2 font-bold transition-colors flex items-center justify-center text-xs sm:text-sm underline-offset-4 hover:underline"
                >
                  Explore PG Software &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
