import { db } from "@/lib/db";
import PGCard from "@/components/listings/PGCard";
import SearchBar from "@/components/landing/SearchBar";
import SearchFilters from "@/components/search/SearchFilters";
import SearchSort from "@/components/search/SearchSort";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import Pagination from "@/components/search/Pagination";
import { Suspense } from "react";
import Link from "next/link";
import { safeJsonLd } from "@/lib/json-ld";
import { buildCityFilterClause, getNormalizedCityList, CITY_ALIASES } from "@/lib/city-filter";

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

  // Canonical: point Google to the clean SEO URL instead of /search?city=noida
  const canonicalUrl = (city && city !== "all")
    ? `https://pgsathi.in/pg-in-${city}`
    : `https://pgsathi.in/search`;

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
    },
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

  const currentPage = pageParam ? Math.max(1, parseInt(pageParam)) : 1;
  const ITEMS_PER_PAGE = 18;

  // Build query
  const where: any = { isActive: true, status: "ACTIVE" };
  const andConditions: any[] = [];

  // 1. City / Location Filter with full alias coverage
  // (e.g., 'noida' finds all listings in Noida + Gautam Buddha Nagar, 'delhi' finds South Delhi/Delhi)
  if (citySlug && citySlug !== "all") {
    const cityClause = buildCityFilterClause(citySlug);
    if (cityClause) {
      andConditions.push(cityClause);
    }
  }

  // 2. Keyword Search across Title, Address, Landmark, Area, Locality, and City Name/State
  if (queryParam) {
    const stopWords = ["pg", "in", "near", "hostel", "room", "rooms", "boys", "girls", "for", "rent", "best", "top", "at", "around", "the", "a", "an", "is", "of", "and"];

    const keywords = queryParam
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));

    const keywordCondition = (kw: string) => {
      const alias = CITY_ALIASES[kw.toLowerCase()];
      const orList: any[] = [
        { title: { contains: kw, mode: "insensitive" } },
        { address: { contains: kw, mode: "insensitive" } },
        { landmark: { contains: kw, mode: "insensitive" } },
        { areaLocality: { contains: kw, mode: "insensitive" } },
        { locality: { name: { contains: kw, mode: "insensitive" } } },
        { city: { name: { contains: kw, mode: "insensitive" } } },
        { city: { state: { contains: kw, mode: "insensitive" } } },
      ];
      if (alias) {
        orList.push({ city: { slug: { in: alias.slugs } } });
        orList.push({ city: { name: { in: alias.names, mode: "insensitive" } } });
      }
      return { OR: orList };
    };

    if (keywords.length > 0) {
      andConditions.push(...keywords.map(keywordCondition));
    } else {
      andConditions.push(keywordCondition(queryParam));
    }
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
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

  // Direct real-time fetch (no stale cache lag)
  const [listings, totalCount, rawCities] = await Promise.all([
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
      orderBy: { priority: "asc" },
    }),
  ]);

  // Clean deduplicated cities list
  const cities = getNormalizedCityList(rawCities);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Friendly city display label
  const activeCityName = citySlug && citySlug !== "all"
    ? cities.find(c => c.slug === citySlug)?.name || citySlug.charAt(0).toUpperCase() + citySlug.slice(1).replace(/-/g, " ")
    : null;

  // SEO: ItemList Schema for Rich Snippets
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": listings.map((pg, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://pgsathi.in/pg/${pg.city?.slug || "all"}/${pg.locality?.slug || "all"}/${pg.slug}`
    }))
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-8">
      {/* JSON-LD Schema Markup for Search Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListSchema) }}
      />
      <div className="container-max section-padding">

        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            ...(activeCityName ? [{ label: `PGs in ${activeCityName}`, href: `/pg-in-${citySlug}` }] : []),
            { label: "Search Results" }
          ]}
        />

        {/* Search Header */}
        <div className="bg-primary-900 rounded-3xl p-6 md:p-8 mb-8 text-white shadow-xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white">
            {activeCityName ? `Verified PGs in ${activeCityName}` : "Find Your Perfect PG"}
          </h1>
          <SearchBar initialCity={citySlug === "all" ? "" : citySlug} initialGender={gender === "all" ? "" : gender} initialQuery={queryParam || ""} cities={cities} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          <Suspense fallback={<div className="w-full lg:w-64 shrink-0 animate-pulse bg-white rounded-2xl h-[600px] border border-neutral-200"></div>}>
            <SearchFilters cities={cities} />
          </Suspense>

          {/* Results Grid */}
          <main className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-neutral-200 gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  {activeCityName ? `PGs in ${activeCityName}` : "All Properties"}
                </h2>
                <p className="text-sm text-neutral-500">
                  Showing {listings.length} of {totalCount} verified zero brokerage properties
                </p>
              </div>
              <SearchSort />
            </div>

            {listings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">No PGs found in this location</h3>
                <p className="text-neutral-500 mb-6 max-w-md mx-auto text-sm">
                  We couldn't find any listings matching your exact filters. Try clearing your budget or amenities filter to see all properties in this city.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/search" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md">
                    View All Available PGs
                  </Link>
                  <Link href="/dashboard/owner/listings/new" className="bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
                    List Your PG for Free
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map(pg => (
                  <PGCard key={pg.id} pg={pg as any} />
                ))}
              </div>
            )}

            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </main>
        </div>
      </div>
    </div>
  );
}
