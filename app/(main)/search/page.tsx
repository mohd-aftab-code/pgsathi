import { db } from "@/lib/db";
import PGCard from "@/components/listings/PGCard";
import SearchBar from "@/components/landing/SearchBar";
import SearchFilters from "@/components/search/SearchFilters";
import SearchSort from "@/components/search/SearchSort";
import Pagination from "@/components/search/Pagination";
import { Suspense } from "react";
import Link from "next/link";

export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const city = searchParams.city as string | undefined;
  const gender = searchParams.gender as string | undefined;

  let title = "Search Best PGs & Hostels | PGSathi";
  let description = "Find the best PGs, Hostels, and Room Rentals near you with zero brokerage. Search verified properties on PGSathi.";

  if (city && city !== "all") {
    const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace("-", " ");
    let genderText = "";
    if (gender === "BOYS") genderText = "Boys ";
    if (gender === "GIRLS") genderText = "Girls ";
    if (gender === "COED") genderText = "Co-ed ";
    
    title = `Best ${genderText}PGs & Hostels in ${cityName} - Zero Brokerage | PGSathi`;
    description = `Looking for a ${genderText}PG in ${cityName}? Find 100% verified properties, top amenities, and direct owner contacts with zero brokerage on PGSathi.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    }
  };
}

export default async function SearchPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const citySlug = searchParams.city as string | undefined;
  const gender = searchParams.gender as string | undefined;
  const budget = searchParams.budget as string | undefined;
  const amenitiesStr = searchParams.amenities as string | undefined;
  const sortBy = searchParams.sort as string | undefined;
  const queryParam = searchParams.q as string | undefined;
  const pageParam = searchParams.page as string | undefined;
  
  const currentPage = pageParam ? parseInt(pageParam) : 1;
  const ITEMS_PER_PAGE = 18;

  // Build query
  const where: any = { isActive: true, status: "ACTIVE" };
  
  if (queryParam) {
    where.OR = [
      { title: { contains: queryParam, mode: "insensitive" } },
      { address: { contains: queryParam, mode: "insensitive" } },
      { locality: { name: { contains: queryParam, mode: "insensitive" } } },
    ];
  }
  
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
    if (amenities.includes("noticePeriod")) where.noticePeriod = false;
    if (amenities.includes("gateClosingTime")) where.gateClosingTime = false; 
    if (amenities.includes("foodIncluded")) where.foodIncluded = true;
    if (amenities.includes("laundryService")) where.laundryService = true;
    if (amenities.includes("roomCleaning")) where.roomCleaning = true;
  }

  // Sort order
  let orderBy: any[] = [{ isFeatured: "desc" }, { createdAt: "desc" }];
  if (sortBy === "price_asc") orderBy = [{ priceMin: "asc" }];
  else if (sortBy === "price_desc") orderBy = [{ priceMin: "desc" }];
  else if (sortBy === "newest") orderBy = [{ createdAt: "desc" }];

  // Fetch listings, total count and cities
  const [listings, totalCount, cities] = await Promise.all([
    db.listing.findMany({
      where,
      include: {
        city: true,
        locality: true,
        photos: { take: 1 },
      },
      orderBy,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    db.listing.count({ where }),
    db.city.findMany({
      where: { isActive: true },
      orderBy: { priority: "desc" }
    })
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="bg-neutral-50 min-h-screen py-8">
      <div className="container-max section-padding">
        
        {/* Search Header */}
        <div className="bg-primary-900 rounded-3xl p-6 md:p-8 mb-8 text-white shadow-xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white">Find Your Perfect PG</h1>
          <SearchBar initialCity={citySlug === "all" ? "" : citySlug} initialGender={gender === "all" ? "" : gender} initialQuery={queryParam || ""} cities={cities} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          <Suspense fallback={<div className="w-full lg:w-64 shrink-0 animate-pulse bg-white rounded-2xl h-[600px] border border-neutral-200"></div>}>
            <SearchFilters cities={cities} />
          </Suspense>

          {/* Results Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {totalCount} PGs Found
              </h2>
              <Suspense fallback={<div className="w-40 h-9 bg-white border border-neutral-200 rounded-lg animate-pulse" />}>
                <SearchSort />
              </Suspense>
            </div>

            {listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listings.map(pg => (
                    <PGCard key={pg.id} pg={pg} />
                  ))}
                </div>
                <Pagination totalPages={totalPages} currentPage={currentPage} />
              </>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm">
                <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-bold mb-2">No PGs found</h3>
                <p className="text-neutral-500 mb-6">We couldn't find any listings matching your criteria. Try adjusting your filters.</p>
                <Link href="/search" className="inline-block bg-primary-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
                  Clear Filters
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
