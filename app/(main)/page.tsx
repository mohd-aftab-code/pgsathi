import HeroSection from "@/components/landing/HeroSection";
import CityGrid from "@/components/landing/CityGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturedListings from "@/components/landing/FeaturedListings";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Kya PGSathi par PG dhoondhna sach mein zero brokerage hai?", "acceptedAnswer": { "@type": "Answer", "text": "Haan. Tenants se hum kabhi koi fees nahi lete — search se le kar owner ka number lene tak, sab free hai." } },
    { "@type": "Question", "name": "Listings verify kaise hoti hain?", "acceptedAnswer": { "@type": "Answer", "text": "Har naya PG hamari team review karti hai listing live hone se pehle — address, photos, aur owner details check hoti hain." } },
    { "@type": "Question", "name": "PG owner se contact kaise karu?", "acceptedAnswer": { "@type": "Answer", "text": "Kisi bhi listing pe Contact Owner ya WhatsApp button milega — direct owner ke phone number pe connect hote ho, koi bichauliya nahi." } },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <HeroSection />
      <CityGrid />
      <HowItWorks />

      {/* Featured PGs Section */}
      <Suspense fallback={<div className="h-96 bg-neutral-100 flex items-center justify-center animate-pulse">Loading featured PGs...</div>}>
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
                PG Owner hain? PGSathi par list karein.
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
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2.5"
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
