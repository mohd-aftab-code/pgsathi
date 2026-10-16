import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import PGCard from "@/components/listings/PGCard";
import { Search, MapPin, Filter, Train, GraduationCap, Building2, IndianRupee, ShieldCheck, Users, Home, Sparkles } from "lucide-react";
import Link from "next/link";
import { constructMetadata } from "@/lib/seo";
import { safeJsonLd } from "@/lib/json-ld";
import { generateLocalityGuideContent, getLocalityProfile } from "@/lib/locality-content";

export async function generateMetadata(props: {
  params: Promise<{ city: string; locality: string }>;
}) {
  const params = await props.params;
  const city = await db.city.findUnique({ where: { slug: params.city } });
  const locality = await db.locality.findFirst({ where: { slug: params.locality, cityId: city?.id } });

  if (!city || !locality) return { title: "PGs Not Found" };

  const rawTitle = `PGs in ${locality.name}, ${city.name} | Zero Brokerage PGSathi`;
  const rawDesc = `Find verified PGs in ${locality.name}, ${city.name} starting ₹4,500. Direct owner contact, zero brokerage, Wi-Fi & meals included on PGSathi.`;

  return constructMetadata({
    title: rawTitle,
    description: rawDesc,
    canonicalPath: `/pg/${city.slug}/${locality.slug}`,
    keywords: [
      `PG in ${locality.name}`,
      `Hostels in ${locality.name} ${city.name}`,
      `Paying guest in ${locality.name}`,
      `Zero brokerage PG ${city.name}`,
      "PG list platform",
    ],
  });
}

export default async function LocalityPage(props: {
  params: Promise<{ city: string; locality: string }>;
}) {
  const params = await props.params;

  const city = await db.city.findUnique({ where: { slug: params.city } });
  if (!city) notFound();

  const locality = await db.locality.findFirst({ where: { slug: params.locality, cityId: city.id } });
  if (!locality) notFound();

  // Fetch all active listings in this locality
  const listings = await db.listing.findMany({
    where: {
      cityId: city.id,
      localityId: locality.id,
      status: "ACTIVE",
      isActive: true,
    },
    include: {
      city: true,
      locality: true,
      photos: { orderBy: { sortOrder: "asc" } },
      reviews: { where: { isApproved: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  // Local SEO Guide Content (Guaranteed 150+ words, metro, colleges, offices, rent)
  const guide = generateLocalityGuideContent({
    cityName: city.name,
    citySlug: city.slug,
    localityName: locality.name,
    localitySlug: locality.slug,
    type: "pg",
  });
  const profile = getLocalityProfile(locality.slug, locality.name, city.name);

  // Fetch 3+ nearby localities for internal links (Rule 2)
  const nearby = await db.locality.findMany({
    where: { cityId: city.id, isActive: true, id: { not: locality.id } },
    take: 6,
    orderBy: { listings: { _count: "desc" } },
  });

  // JSON-LD: BreadcrumbList + ItemList (Rule 3)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://pgsathi.in",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `PGs in ${city.name}`,
        "item": `https://pgsathi.in/pg-in-${city.slug}`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `PGs in ${locality.name}`,
        "item": `https://pgsathi.in/pg/${city.slug}/${locality.slug}`,
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Verified PGs in ${locality.name}, ${city.name}`,
    "numberOfItems": listings.length,
    "itemListElement": listings.slice(0, 10).map((l, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `https://pgsathi.in/pg/${city.slug}/${locality.slug}/${l.slug}`,
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
              { label: `PGs in ${locality.name}`, href: `/pg/${city.slug}/${locality.slug}` },
            ]}
          />
          {/* Rule 5: One H1 per page containing primary keyword */}
          <h1 className="text-3xl md:text-5xl font-black mt-4 mb-4 tracking-tight leading-tight">
            Best PGs in {locality.name}, {city.name}
          </h1>
          <p className="text-primary-100 text-base md:text-lg max-w-3xl leading-relaxed">
            Find 100% verified zero brokerage PG accommodations in {locality.name}. Direct owner contact via phone and WhatsApp on India's trusted PG list platform.
          </p>

          {/* Quick Category Filters */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-primary-900/60">
            <Link
              href={`/pg/${city.slug}/${locality.slug}/boys-pg`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors border border-white/10 min-h-[40px]"
            >
              <Users size={14} className="text-blue-300 shrink-0" />
              <span>Boys PGs in {locality.name}</span>
            </Link>
            <Link
              href={`/pg/${city.slug}/${locality.slug}/girls-pg`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors border border-white/10 min-h-[40px]"
            >
              <ShieldCheck size={14} className="text-rose-300 shrink-0" />
              <span>Girls PGs in {locality.name}</span>
            </Link>
            <Link
              href={`/pg/${city.slug}/${locality.slug}/co-living`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors border border-white/10 min-h-[40px]"
            >
              <Home size={14} className="text-amber-300 shrink-0" />
              <span>Co-living Spaces</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div className="container-max py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-neutral-900">
              Verified Properties in {locality.name}
            </h2>
            <p className="text-neutral-500 text-sm mt-0.5">
              Showing {listings.length} verified zero-brokerage {listings.length === 1 ? "PG" : "PGs"}
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
              <PGCard key={pg.id} pg={pg as any} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No active PGs in {locality.name} right now</h3>
            <p className="text-neutral-500 text-sm mb-6">
              Be the first to list or browse verified properties in nearby localities of {city.name}.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href={`/pg-in-${city.slug}`}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md"
              >
                View all PGs in {city.name}
              </Link>
              <Link
                href="/dashboard/owner/listings/new"
                className="bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
              >
                List your PG for free
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Rule 2: 150+ Words Local Guide Content & Area Snapshot ── */}
      <section className="container-max mt-8 pt-8">
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-sm space-y-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              Area Guide &amp; Micro-Market Insights
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-3 mb-4">
              Living in {locality.name}, {city.name}: What You Need to Know
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
                <p className="text-xs font-bold text-neutral-900 leading-snug">
                  {profile.nearestMetro}
                </p>
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
              Explore PGs in Nearby Areas of {city.name}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Compare verified student and working professional PGs across adjacent micro-markets:
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
            {nearby.map((loc) => (
              <Link
                key={loc.id}
                href={`/pg/${city.slug}/${loc.slug}`}
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
