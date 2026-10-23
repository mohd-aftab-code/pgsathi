import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { getListingUrl } from "@/lib/url";
import { getListingBySlug } from "@/lib/listing";

import { constructMetadata } from "@/lib/seo";
import { safeJsonLd } from "@/lib/json-ld";
import { isLocalityType, getTypeLabel, generateLocalityGuideContent, getLocalityProfile } from "@/lib/locality-content";
import PGCard from "@/components/listings/PGCard";
import { Filter, Search, IndianRupee, Train, GraduationCap, Building2, ShieldCheck, Users, Home, MapPin } from "lucide-react";

export async function generateMetadata(props: {
  params: Promise<{ city: string; locality: string; slug: string }>;
}) {
  const params = await props.params;

  // Rule 2: Locality pages follow /pg/{city}/{area}/{type}
  if (isLocalityType(params.slug)) {
    const city = await db.city.findUnique({ where: { slug: params.city } });
    const locality = await db.locality.findFirst({ where: { slug: params.locality, cityId: city?.id } });
    if (!city || !locality) return { title: "PGs Not Found" };

    const typeInfo = getTypeLabel(params.slug);
    const title = `${typeInfo.title} in ${locality.name}, ${city.name} | PGSathi`;
    const description = `Find verified ${typeInfo.title.toLowerCase()} in ${locality.name}, ${city.name} starting ₹4,500. Zero brokerage direct owner contact on PGSathi.`;

    return constructMetadata({
      title,
      description,
      canonicalPath: `/pg/${city.slug}/${locality.slug}/${params.slug}`,
      keywords: [
        `${typeInfo.title} in ${locality.name}`,
        `${params.slug} ${city.name}`,
        `Hostels in ${locality.name}`,
        "PG list platform",
        "Zero brokerage PG",
      ],
    });
  }

  const pg = await getListingBySlug(params.slug);
  if (!pg) return { title: "PG Not Found" };

  const cityName = pg.city?.name || "";
  const localityName = pg.locality?.name || "";
  const title = pg.metaTitle || `${pg.title.slice(0, 40)} - PG in ${localityName || cityName} | PGSathi`;
  const description = pg.metaDesc || `${pg.genderAllowed} PG in ${localityName || cityName}, ${cityName} from ₹${pg.priceMin}/mo. Zero brokerage verified PG on India's #1 PG list platform.`;
  const image = pg.photos?.[0]?.url || "https://www.pgsathi.in/og-image.jpg";
  const canonicalPath = getListingUrl(pg);

  return constructMetadata({
    title,
    description,
    image,
    canonicalPath,
    keywords: [pg.title, `PG in ${localityName}`, `PG in ${cityName}`, `${pg.genderAllowed} PG`, "Zero Brokerage PG", "PG list platform"],
  });
}

export default async function PGDetailPage(props: {
  params: Promise<{ city: string; locality: string; slug: string }>;
}) {
  const params = await props.params;

  // ── Rule 2: If the 3rd param is a Locality Type (/pg/{city}/{area}/{type}) ──
  if (isLocalityType(params.slug)) {
    const city = await db.city.findUnique({ where: { slug: params.city } });
    if (!city) notFound();

    const locality = await db.locality.findFirst({ where: { slug: params.locality, cityId: city.id } });
    if (!locality) notFound();

    const typeInfo = getTypeLabel(params.slug);

    // Filter listings by gender if type is boys/girls/coed
    const genderWhere = typeInfo.genderFilter ? { genderAllowed: typeInfo.genderFilter } : {};

    const listings = await db.listing.findMany({
      where: {
        cityId: city.id,
        localityId: locality.id,
        status: "ACTIVE",
        isActive: true,
        ...genderWhere,
      },
      include: {
        city: true,
        locality: true,
        photos: { orderBy: { sortOrder: "asc" } },
        reviews: { where: { isApproved: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    const guide = generateLocalityGuideContent({
      cityName: city.name,
      citySlug: city.slug,
      localityName: locality.name,
      localitySlug: locality.slug,
      type: params.slug,
    });
    const profile = getLocalityProfile(locality.slug, locality.name, city.name);

    // Rule 2: 3 nearby-area internal links
    const nearby = await db.locality.findMany({
      where: { cityId: city.id, isActive: true, id: { not: locality.id } },
      take: 6,
      orderBy: { listings: { _count: "desc" } },
    });

    // Rule 3: BreadcrumbList + ItemList schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.pgsathi.in",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": `PGs in ${city.name}`,
          "item": `https://www.pgsathi.in/pg-in-${city.slug}`,
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": `PGs in ${locality.name}`,
          "item": `https://www.pgsathi.in/pg/${city.slug}/${locality.slug}`,
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": typeInfo.title,
          "item": `https://www.pgsathi.in/pg/${city.slug}/${locality.slug}/${params.slug}`,
        },
      ],
    };

    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `${typeInfo.title} in ${locality.name}, ${city.name}`,
      "numberOfItems": listings.length,
      "itemListElement": listings.slice(0, 10).map((l, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `https://www.pgsathi.in/pg/${city.slug}/${locality.slug}/${l.slug}`,
        "name": l.title,
      })),
    };

    return (
      <div className="bg-neutral-50 min-h-screen pb-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListSchema) }} />

        {/* Hero Section */}
        <div className="bg-primary-950 text-white py-12 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="container-max relative z-10">
            <Breadcrumbs
              items={[
                { label: `PGs in ${city.name}`, href: `/pg-in-${city.slug}` },
                { label: locality.name, href: `/pg/${city.slug}/${locality.slug}` },
                { label: typeInfo.title, href: `/pg/${city.slug}/${locality.slug}/${params.slug}` },
              ]}
            />
            {/* Rule 5: One H1 per page containing primary keyword */}
            <h1 className="text-3xl md:text-5xl font-black mt-4 mb-4 tracking-tight leading-tight">
              Best {typeInfo.title} in {locality.name}, {city.name}
            </h1>
            <p className="text-primary-100 text-base md:text-lg max-w-3xl leading-relaxed">
              Find 100% verified zero brokerage {typeInfo.title.toLowerCase()} in {locality.name}. Direct owner contact via phone &amp; WhatsApp on India&apos;s #1 PG list platform.
            </p>

            {/* Quick sibling links */}
            <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-primary-900/60">
              <Link
                href={`/pg/${city.slug}/${locality.slug}/boys-pg`}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border min-h-[40px] ${
                  params.slug === "boys-pg"
                    ? "bg-white text-primary-950 border-white shadow"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/10"
                }`}
              >
                <Users size={14} className={params.slug === "boys-pg" ? "text-primary-600" : "text-blue-300"} />
                <span>Boys PGs</span>
              </Link>
              <Link
                href={`/pg/${city.slug}/${locality.slug}/girls-pg`}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border min-h-[40px] ${
                  params.slug === "girls-pg"
                    ? "bg-white text-primary-950 border-white shadow"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/10"
                }`}
              >
                <ShieldCheck size={14} className={params.slug === "girls-pg" ? "text-primary-600" : "text-rose-300"} />
                <span>Girls PGs</span>
              </Link>
              <Link
                href={`/pg/${city.slug}/${locality.slug}/co-living`}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border min-h-[40px] ${
                  params.slug === "co-living"
                    ? "bg-white text-primary-950 border-white shadow"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/10"
                }`}
              >
                <Home size={14} className={params.slug === "co-living" ? "text-primary-600" : "text-amber-300"} />
                <span>Co-living</span>
              </Link>
              <Link
                href={`/pg/${city.slug}/${locality.slug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 min-h-[40px]"
              >
                <Building2 size={14} className="text-emerald-300" />
                <span>All PGs in {locality.name}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="container-max py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black text-neutral-900">
                Verified {typeInfo.title} in {locality.name}
              </h2>
              <p className="text-neutral-500 text-sm mt-0.5">
                Showing {listings.length} verified zero-brokerage properties
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 bg-white border border-neutral-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-50 shadow-sm w-full sm:w-auto min-h-[44px]"
            >
              <Filter size={16} /> Filters
            </Link>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((pg) => (
                <PGCard key={pg.id} pg={pg} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm max-w-2xl mx-auto my-8">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">No active {typeInfo.title.toLowerCase()} in {locality.name} right now</h3>
              <p className="text-neutral-500 text-sm mb-6">
                Browse other verified options in {locality.name} or nearby localities of {city.name}.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href={`/pg/${city.slug}/${locality.slug}`}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md"
                >
                  View All PGs in {locality.name}
                </Link>
                <Link
                  href={`/pg-in-${city.slug}`}
                  className="bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                >
                  View all PGs in {city.name}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Rule 2: 150+ Words Local Guide Content ── */}
        <section className="container-max mt-8 pt-8">
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-sm space-y-8">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                Area Guide &amp; Micro-Market Insights
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-3 mb-4">
                Guide to {typeInfo.title} in {locality.name}, {city.name}
              </h2>
              <div className="text-neutral-700 text-sm sm:text-base leading-relaxed space-y-4">
                <p>{guide.body}</p>
              </div>
            </div>

            {/* Key Infrastructure Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-neutral-100">
              {/* Rent Range Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-black text-neutral-600 uppercase tracking-wider">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <IndianRupee size={15} />
                  </div>
                  <span>Average PG Rent</span>
                </div>
                <ul className="text-xs space-y-1.5 text-neutral-700 font-medium pl-1">
                  <li className="flex justify-between items-center"><span className="text-neutral-500">Single Room:</span> <strong className="text-neutral-900 font-bold">{profile.rentRange.single}</strong></li>
                  <li className="flex justify-between items-center"><span className="text-neutral-500">Double Sharing:</span> <strong className="text-neutral-900 font-bold">{profile.rentRange.double}</strong></li>
                  <li className="flex justify-between items-center"><span className="text-neutral-500">Triple Sharing:</span> <strong className="text-neutral-900 font-bold">{profile.rentRange.triple}</strong></li>
                </ul>
              </div>

              {/* Nearest Metro */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-black text-neutral-600 uppercase tracking-wider">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Train size={15} />
                  </div>
                  <span>Transit &amp; Metro</span>
                </div>
                <div className="pl-1">
                  <p className="text-xs font-bold text-neutral-900 leading-snug">{profile.nearestMetro}</p>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">Direct auto, bus &amp; shared cab connectivity available.</p>
                </div>
              </div>

              {/* Nearby Colleges */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-black text-neutral-600 uppercase tracking-wider">
                  <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <GraduationCap size={15} />
                  </div>
                  <span>Nearby Colleges</span>
                </div>
                <ul className="text-xs space-y-1 text-neutral-700 pl-1 font-medium">
                  {profile.colleges.slice(0, 3).map((c, i) => (
                    <li key={i} className="truncate">• {c}</li>
                  ))}
                </ul>
              </div>

              {/* Corporate Hubs */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-black text-neutral-600 uppercase tracking-wider">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Building2 size={15} />
                  </div>
                  <span>Tech &amp; Work Hubs</span>
                </div>
                <ul className="text-xs space-y-1 text-neutral-700 pl-1 font-medium">
                  {profile.offices.slice(0, 3).map((o, i) => (
                    <li key={i} className="truncate">• {o}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Rule 2: 3 Nearby-Area Internal Links ── */}
        {nearby.length > 0 && (
          <div className="container-max mt-8 pt-8 border-t border-neutral-200">
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Explore {typeInfo.title} in Nearby Areas of {city.name}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Compare verified properties across adjacent micro-markets:
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
              {nearby.map((loc) => (
                <Link
                  key={loc.id}
                  href={`/pg/${city.slug}/${loc.slug}/${params.slug}`}
                  className="bg-white border border-neutral-200 hover:border-primary-500 hover:text-primary-700 p-3 rounded-2xl text-xs font-bold text-neutral-700 transition-all flex items-center gap-2 shadow-sm min-h-[44px]"
                >
                  <MapPin size={14} className="text-primary-500 shrink-0" />
                  <span className="truncate">{loc.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Otherwise: 3-segment Listing URL accessed -> 301 Redirect to clean 2-segment URL ──
  const pg = await getListingBySlug(params.slug);
  if (!pg) notFound();

  const canonicalPath = getListingUrl(pg);
  redirect(canonicalPath);
}

