import { db } from "@/lib/db";
import Link from "next/link";
import { MapPin } from "lucide-react";

export async function PopularLocalitiesWidget({ citySlug, cityName }: { citySlug: string, cityName: string }) {
  const city = await db.city.findUnique({
    where: { slug: citySlug },
    select: { id: true }
  });

  if (!city) return null;

  const nearby = await db.locality.findMany({
    where: { cityId: city.id, isActive: true },
    take: 24,
    orderBy: { listings: { _count: 'desc' } }
  });

  if (nearby.length === 0) return null;

  return (
    <div className="bg-neutral-50 py-16 border-t border-neutral-200">
      <div className="container-max section-padding">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Popular Localities for PG in {cityName}</h2>
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
    </div>
  );
}
