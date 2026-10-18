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
import {
  buildCityFilterClause,
  getNormalizedCityList,
  getFeaturedCityPills,
  CITY_ALIASES,
} from "@/lib/city-filter";
import { MapPin, X, SlidersHorizontal, Sparkles } from "lucide-react";

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

  // Fetch real-time search data with resilient retry for serverless DB cold starts
  const fetchQueries = () =>
    Promise.all([
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
      db.listing.groupBy({
        by: ["cityId"],
        where: { isActive: true, status: "ACTIVE" },
        _count: { id: true },
      }),
    ]);

  let searchData;
  try {
    searchData = await fetchQueries();
  } catch (error: any) {
    if (error?.code === "P1001" || error?.message?.includes("Can't reach database server")) {
      // Allow Neon serverless compute 1.5s to finish spinning up and retry
      await new Promise((res) => setTimeout(res, 1500));
      searchData = await fetchQueries();
    } else {
      throw error;
    }
  }

  const [listings, totalCount, rawCities, cityCounts] = searchData;

  // Clean deduplicated cities list & live city pills
  const cities = getNormalizedCityList(rawCities);
  const cityPills = getFeaturedCityPills(cityCounts, rawCities);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Friendly city display label
  const activeCityName = citySlug && citySlug !== "all"
    ? cities.find(c => c.slug === citySlug)?.name || citySlug.charAt(0).toUpperCase() + citySlug.slice(1).replace(/-/g, " ")
    : null;

  // Active filters helper for removable tags
  const activeFilters: Array<{ label: string; paramKey: string; href: string }> = [];
  if (activeCityName) {
    const p = new URLSearchParams();
    if (gender) p.set("gender", gender);
    if (budget) p.set("budget", budget);
    if (amenitiesStr) p.set("amenities", amenitiesStr);
    if (queryParam) p.set("q", queryParam);
    activeFilters.push({ label: `City: ${activeCityName}`, paramKey: "city", href: `/search?${p.toString()}` });
  }
  if (gender && gender !== "all") {
    const p = new URLSearchParams();
    if (citySlug) p.set("city", citySlug);
    if (budget) p.set("budget", budget);
    if (amenitiesStr) p.set("amenities", amenitiesStr);
    if (queryParam) p.set("q", queryParam);
    const gLabel = gender === "BOYS" ? "Boys PG" : gender === "GIRLS" ? "Girls PG" : "Co-ed";
    activeFilters.push({ label: gLabel, paramKey: "gender", href: `/search?${p.toString()}` });
  }
  if (budget) {
    const p = new URLSearchParams();
    if (citySlug) p.set("city", citySlug);
    if (gender) p.set("gender", gender);
    if (amenitiesStr) p.set("amenities", amenitiesStr);
    if (queryParam) p.set("q", queryParam);
    const bLabel = budget === "under5k" ? "< ₹5k" : budget === "5k-10k" ? "₹5k-₹10k" : "> ₹10k";
    activeFilters.push({ label: `Budget: ${bLabel}`, paramKey: "budget", href: `/search?${p.toString()}` });
  }
  if (amenitiesStr) {
    const p = new URLSearchParams();
    if (citySlug) p.set("city", citySlug);
    if (gender) p.set("gender", gender);
    if (budget) p.set("budget", budget);
    if (queryParam) p.set("q", queryParam);
    activeFilters.push({ label: `Amenities (${amenitiesStr.split(",").length})`, paramKey: "amenities", href: `/search?${p.toString()}` });
  }

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
    <div className="bg-neutral-50 min-h-screen py-4 sm:py-8">
      {/* JSON-LD Schema Markup for Search Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListSchema) }}
      />
      <div className="container-max section-padding px-4 sm:px-6">

        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumbs
            items={[
              ...(activeCityName ? [{ label: `PGs in ${activeCityName}`, href: `/pg-in-${citySlug}` }] : []),
              { label: "Search Results" }
            ]}
          />
        </div>

        {/* Search Header - overflow-visible ensures dropdowns float out cleanly */}
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 text-white shadow-xl relative z-30">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 pointer-events-none rounded-2xl sm:rounded-3xl overflow-hidden"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-400 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                Zero Brokerage Discovery
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black mb-4 sm:mb-6 text-white tracking-tight">
              {activeCityName ? `Verified PGs in ${activeCityName}` : "Find Your Perfect PG"}
            </h1>
            <SearchBar initialCity={citySlug === "all" ? "" : citySlug} initialGender={gender === "all" ? "" : gender} initialQuery={queryParam || ""} cities={cities} />
          </div>
        </div>

        {/* ── Mobile-First Quick City Switcher Pills (Horizontal Scroll) ── */}
        <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-none flex items-center gap-2 py-1">
          <Link
            href="/search"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all shrink-0 border min-h-[38px] ${
              !citySlug || citySlug === "all"
                ? "bg-primary-600 text-white border-primary-600 shadow-md"
                : "bg-white text-neutral-700 border-neutral-200 hover:border-primary-400 shadow-sm"
            }`}
          >
            <span>All Cities</span>
          </Link>
          {cityPills
            .filter((c) => c.count > 0)
            .map((c) => {
              const isActive = citySlug === c.slug;
              return (
                <Link
                  key={c.slug}
                  href={`/search?city=${c.slug}`}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all shrink-0 border min-h-[38px] ${
                    isActive
                      ? "bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/20"
                      : "bg-white text-neutral-700 border-neutral-200 hover:border-primary-400 shadow-sm"
                  }`}
                >
                  <MapPin size={12} className={isActive ? "text-white" : "text-primary-500"} />
                  <span>{c.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      isActive ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {c.count}
                  </span>
                </Link>
              );
            })}
        </div>

        {/* ── Active Filter Tags Row ── */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5 pb-3 border-b border-neutral-200/80">
            <span className="text-xs font-extrabold text-neutral-500 uppercase tracking-wide mr-1">
              Active:
            </span>
            {activeFilters.map((f, idx) => (
              <Link
                key={idx}
                href={f.href}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-800 text-xs font-bold border border-primary-200 hover:bg-primary-100 transition-colors"
                title={`Remove ${f.label}`}
              >
                <span>{f.label}</span>
                <X size={12} className="text-primary-600 hover:text-primary-900" />
              </Link>
            ))}
            <Link
              href="/search"
              className="text-xs text-neutral-500 hover:text-neutral-900 underline font-semibold ml-2"
            >
              Clear All
            </Link>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <Suspense fallback={<div className="w-full lg:w-64 shrink-0 animate-pulse bg-white rounded-3xl h-[600px] border border-neutral-200"></div>}>
            <SearchFilters cities={cities} />
          </Suspense>

          {/* Results Grid */}
          <main className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-neutral-200 gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                  {activeCityName ? `Verified PGs in ${activeCityName}` : "All Verified Properties"}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  Showing <strong className="text-neutral-900">{listings.length}</strong> of {totalCount} verified zero brokerage {listings.length === 1 ? "PG" : "PGs"}
                </p>
              </div>
              <div className="w-full sm:w-auto">
                <SearchSort />
              </div>
            </div>

            {listings.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-neutral-200 shadow-sm max-w-xl mx-auto my-8">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 mb-2">
                  No PGs found {activeCityName ? `in ${activeCityName}` : "matching your search"}
                </h3>
                <p className="text-neutral-500 mb-6 text-xs sm:text-sm leading-relaxed">
                  We couldn't find any listings matching these exact filters. Try tapping on <strong>All Cities</strong> or another popular city above.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Link href="/search" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-colors shadow-md min-h-[44px] flex items-center justify-center">
                    View All Available PGs
                  </Link>
                  <Link href="/dashboard/owner/listings/new" className="bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-colors min-h-[44px] flex items-center justify-center">
                    List Your PG for Free
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {listings.map(pg => (
                  <PGCard key={pg.id} pg={pg as any} />
                ))}
              </div>
            )}

            <div className="mt-8">
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
