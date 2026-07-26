import SearchPage from "@/app/(main)/search/page";
import { Metadata } from "next";
import { PopularLocalitiesWidget } from "@/components/common/PopularLocalitiesWidget";

import { db } from "@/lib/db";

import { constructMetadata } from "@/lib/seo";
import { safeJsonLd } from "@/lib/json-ld";

export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const city = (searchParams.city as string) || "city";
  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, " ");

  const cityObj = await db.city.findUnique({
    where: { slug: city }
  });

  const title = cityObj?.metaTitle || `Best PGs & Hostels in ${cityName} - Zero Brokerage`;
  const description = cityObj?.metaDesc || `Looking for a PG in ${cityName}? Find 100% verified properties, top amenities, and direct owner contacts with zero brokerage on PGSathi.`;

  const listingCount = await db.listing.count({
    where: { city: { slug: city }, status: "ACTIVE" }
  });

  return constructMetadata({
    title,
    description,
    canonicalPath: `/pg-in-${city}`,
    noIndex: listingCount === 0,
    keywords: [`PG in ${cityName}`, `Hostels in ${cityName}`, `Zero brokerage PG ${cityName}`, `Rooms for rent in ${cityName}`]
  });
}

export default async function PgInCityPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const city = (searchParams.city as string) || "city";
  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, " ");

  const updatedSearchParams = Promise.resolve({ ...searchParams, city });

  // FAQ Schema for Google Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is the average rent for a PG in ${cityName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `On average, you can find a good PG in ${cityName} starting from ₹5,000 to ₹15,000 per month. Since PGSathi charges zero brokerage, you save an entire month's rent upfront.`,
        },
      },
      {
        "@type": "Question",
        "name": `Are there safe Girls PGs in ${cityName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, PGSathi lists many verified girls' PGs in ${cityName} with flexible gate timings or biometric access for safety.`,
        },
      },
      {
        "@type": "Question",
        "name": "Does PGSathi charge any commission from tenants?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No! PGSathi is 100% free for tenants. We connect you directly with PG owners — zero brokerage, zero hidden fees.",
        },
      },
      {
        "@type": "Question",
        "name": `How do I contact a PG owner in ${cityName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Simply click on any listing on PGSathi and use the "WhatsApp Owner" or "Show Phone Number" button to contact the owner directly — no broker needed.`,
        },
      },
    ],
  };

  return (
    <>
      {/* FAQ Schema Markup for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
      />

      <SearchPage searchParams={updatedSearchParams} />

      <div className="bg-white border-t border-neutral-200 py-16">
        <div className="container-max section-padding">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-8">
            Frequently Asked Questions about PGs in {cityName}
          </h2>
          <div className="space-y-6 max-w-4xl">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                What is the average rent for a PG in {cityName}?
              </h3>
              <p className="text-neutral-600">
                The rent varies depending on the locality and amenities. On average, you can find a good PG starting from ₹5,000 to ₹15,000 per month. Since PGSathi charges zero brokerage, you save an entire month's rent upfront.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                Are there safe Girls PGs in {cityName} with late gate closing times?
              </h3>
              <p className="text-neutral-600">
                Yes, PGSathi lists many verified girls' PGs that cater to working professionals and offer flexible gate timings or biometric access for safety. You can use our "Gate Closing" filter to find them.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                Does PGSathi charge any commission from tenants?
              </h3>
              <p className="text-neutral-600">
                No! PGSathi is a 100% free platform for tenants. We connect you directly with the PG owners so you don't have to pay any brokerage or hidden fees.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                How do I contact a PG owner in {cityName}?
              </h3>
              <p className="text-neutral-600">
                On PGSathi, you can contact PG owners directly via WhatsApp or Phone — no broker involved. Simply click on any listing and use the "WhatsApp Owner" or "Show Phone Number" button.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <PopularLocalitiesWidget citySlug={city} cityName={cityName} />
    </>
  );
}
