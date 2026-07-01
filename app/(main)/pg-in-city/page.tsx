import SearchPage from "@/app/(main)/search/page";
import { Metadata } from "next";

export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const city = (searchParams.city as string) || "city";
  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, " ");

  const title = `Best PGs & Hostels in ${cityName} - Zero Brokerage | PGSathi`;
  const description = `Looking for a PG in ${cityName}? Find 100% verified properties, top amenities, and direct owner contacts with zero brokerage on PGSathi.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `https://pgsathi.in/pg-in-${city}`,
    }
  };
}

export default async function PgInCityPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const city = (searchParams.city as string) || "city";
  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, " ");
  
  // Inject the city from the URL path into the searchParams for the SearchPage component
  const updatedSearchParams = Promise.resolve({
    ...searchParams,
    city: city,
  });

  return (
    <>
      <div className="bg-white border-b border-neutral-200">
        <div className="container-max section-padding py-12 md:py-16">
          <h1 className="text-3xl md:text-5xl font-black text-neutral-900 mb-4">
            Zero Brokerage Verified PGs in {cityName}
          </h1>
          <p className="text-lg text-neutral-600 max-w-3xl mb-8 leading-relaxed">
            Whether you are a student or a working professional, finding a safe, affordable PG in {cityName} shouldn't cost you an extra month's rent in brokerage. PGSathi brings you 100% physically verified properties with direct owner contact.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <h3 className="font-bold text-neutral-900">Zero Hidden Fees</h3>
              <p className="text-sm text-neutral-500">Pay rent directly to owners</p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <h3 className="font-bold text-neutral-900">Verified Properties</h3>
              <p className="text-sm text-neutral-500">Physical verification done</p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <h3 className="font-bold text-neutral-900">Direct Contact</h3>
              <p className="text-sm text-neutral-500">Chat directly on WhatsApp</p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <h3 className="font-bold text-neutral-900">Premium Amenities</h3>
              <p className="text-sm text-neutral-500">AC, WiFi, Food & more</p>
            </div>
          </div>
        </div>
      </div>
      
      <SearchPage searchParams={updatedSearchParams} />
      
      <div className="bg-white border-t border-neutral-200 py-16">
        <div className="container-max section-padding">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-8">Frequently Asked Questions about PGs in {cityName}</h2>
          <div className="space-y-6 max-w-4xl">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">What is the average rent for a PG in {cityName}?</h3>
              <p className="text-neutral-600">The rent varies depending on the locality and amenities. On average, you can find a good PG starting from ₹5,000 to ₹15,000 per month. Since PGSathi charges zero brokerage, you save an entire month's rent upfront.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Are there safe Girls PGs in {cityName} with late gate closing times?</h3>
              <p className="text-neutral-600">Yes, PGSathi lists many verified girls' PGs that cater to working professionals and offer flexible gate timings or biometric access for safety. You can use our "Gate Closing" filter to find them.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Does PGSathi charge any commission from tenants?</h3>
              <p className="text-neutral-600">No! PGSathi is a 100% free platform for tenants. We connect you directly with the PG owners so you don't have to pay any brokerage or hidden fees.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
