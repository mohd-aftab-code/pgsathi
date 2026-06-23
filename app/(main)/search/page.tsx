import { db } from "@/lib/db";
import PGCard from "@/components/listings/PGCard";
import SearchBar from "@/components/landing/SearchBar";
import SearchFilters from "@/components/search/SearchFilters";
import { Suspense } from "react";

export const metadata = {
  title: "Search PGs - PGSathi",
  description: "Find the best PGs and Hostels matching your requirements.",
};

export default async function SearchPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const citySlug = searchParams.city as string | undefined;
  const gender = searchParams.gender as string | undefined;
  const budget = searchParams.budget as string | undefined;
  const amenitiesStr = searchParams.amenities as string | undefined;

  // Build query
  const where: any = { isActive: true, status: "ACTIVE" };
  
  if (citySlug && citySlug !== "all") {
    where.city = { slug: citySlug };
  }
  
  if (gender && gender !== "all") {
    where.genderAllowed = gender;
  }

  // Budget Filter
  if (budget === "under5k") {
    where.priceMin = { lte: 5000 };
  } else if (budget === "5k-10k") {
    where.priceMin = { gte: 5000 };
    where.priceMax = { lte: 10000 };
  } else if (budget === "above10k") {
    where.priceMin = { gt: 10000 };
  }

  // Amenities / Rules Filter
  if (amenitiesStr) {
    const amenities = amenitiesStr.split(",");
    if (amenities.includes("noticePeriod")) where.noticePeriod = false; // "No Notice Period" means noticePeriod=false
    if (amenities.includes("gateClosingTime")) where.gateClosingTime = false; 
    if (amenities.includes("foodIncluded")) where.foodIncluded = true;
    if (amenities.includes("laundryService")) where.laundryService = true;
    if (amenities.includes("roomCleaning")) where.roomCleaning = true;
  }

  // Fetch listings
  const listings = await db.listing.findMany({
    where,
    include: {
      city: true,
      locality: true,
      photos: { take: 1 },
    },
    orderBy: [
      { isFeatured: "desc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <div className="bg-neutral-50 min-h-screen py-8">
      <div className="container-max section-padding">
        
        {/* Search Header */}
        <div className="bg-primary-900 rounded-3xl p-6 md:p-8 mb-8 text-white shadow-xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Find Your Perfect PG</h1>
          <SearchBar initialCity={citySlug === "all" ? "" : citySlug} initialGender={gender === "all" ? "" : gender} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          <Suspense fallback={<div className="w-full lg:w-64 shrink-0 animate-pulse bg-white rounded-2xl h-[600px] border border-neutral-200"></div>}>
            <SearchFilters />
          </Suspense>

          {/* Results Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {listings.length} PGs Found
              </h2>
              <select className="bg-white border border-neutral-200 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none">
                <option>Sort by: Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            {listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map(pg => (
                  <PGCard key={pg.id} pg={pg} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm">
                <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-bold mb-2">No PGs found</h3>
                <p className="text-neutral-500 mb-6">We couldn't find any listings matching your criteria. Try adjusting your filters.</p>
                <button className="bg-primary-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-primary-700 transition-colors cursor-pointer">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
