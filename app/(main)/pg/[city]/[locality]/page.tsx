import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import ListingCard from "@/components/listings/ListingCard";
import { Search, MapPin, Filter } from "lucide-react";
import Link from "next/link";

export async function generateMetadata(props: {
  params: Promise<{ city: string; locality: string }>;
}) {
  const params = await props.params;
  const city = await db.city.findUnique({ where: { slug: params.city } });
  const locality = await db.locality.findFirst({ where: { slug: params.locality, cityId: city?.id } });

  if (!city || !locality) return { title: "PGs Not Found" };

  return {
    title: `Zero Brokerage PGs in ${locality.name}, ${city.name} | PGSathi`,
    description: `Find the best verified Boys & Girls PGs in ${locality.name}, ${city.name} starting from ₹5000. Book directly with owners. Zero Brokerage.`,
    alternates: {
      canonical: `https://pgsathi.in/pg/${city.slug}/${locality.slug}`,
    }
  };
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
      reviews: { where: { isApproved: true } }
    },
    orderBy: [
      { isFeatured: "desc" },
      { createdAt: "desc" }
    ]
  });

  return (
    <div className="bg-neutral-50 min-h-screen pb-12">
      {/* Hero Section */}
      <div className="bg-primary-900 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container-max relative z-10">
          <Breadcrumbs 
            items={[
              { label: `PGs in ${city.name}`, href: `/pg-in-${city.slug}` },
              { label: `PGs in ${locality.name}`, href: `/pg/${city.slug}/${locality.slug}` }
            ]} 
          />
          <h1 className="text-3xl md:text-5xl font-black mt-4 mb-4">
            PGs in {locality.name}, {city.name}
          </h1>
          <p className="text-primary-100 text-lg md:text-xl max-w-2xl">
            Find 100% verified zero brokerage PG accommodations in {locality.name}. Direct owner contact.
          </p>
        </div>
      </div>

      <div className="container-max py-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              {listings.length} {listings.length === 1 ? 'PG' : 'PGs'} Found
            </h2>
            <p className="text-neutral-500 text-sm">Showing top verified properties</p>
          </div>
          <Link href="/search" className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-neutral-50">
            <Filter size={16} /> Filters
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((pg) => (
              <ListingCard key={pg.id} listing={pg as any} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm max-w-2xl mx-auto mt-12">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">No PGs found in {locality.name}</h3>
            <p className="text-neutral-500 mb-8">We couldn't find any active listings in this specific locality right now. Try searching in nearby areas or the entire city.</p>
            <Link 
              href={`/pg-in-${city.slug}`}
              className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
            >
              View all PGs in {city.name}
            </Link>
          </div>
        )}
      </div>

      {/* Internal Linking: Nearby Localities */}
      <NearbyLocalitiesWidget cityId={city.id} currentLocalityId={locality.id} citySlug={city.slug} cityName={city.name} />
    </div>
  );
}

async function NearbyLocalitiesWidget({ cityId, currentLocalityId, citySlug, cityName }: { cityId: number, currentLocalityId: number, citySlug: string, cityName: string }) {
  const nearby = await db.locality.findMany({
    where: { cityId, isActive: true, id: { not: currentLocalityId } },
    take: 12,
    orderBy: { listings: { _count: 'desc' } }
  });

  if (nearby.length === 0) return null;

  return (
    <div className="container-max mt-12 pt-12 border-t border-neutral-200">
      <h3 className="text-2xl font-bold text-neutral-900 mb-6">Popular Localities in {cityName}</h3>
      <div className="flex flex-wrap gap-3">
        {nearby.map((loc) => (
          <Link 
            key={loc.id} 
            href={`/pg/${citySlug}/${loc.slug}`}
            className="bg-white border border-neutral-200 hover:border-primary-500 hover:text-primary-700 px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 transition-colors flex items-center gap-2"
          >
            <MapPin size={14} className="text-neutral-400" />
            {loc.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
