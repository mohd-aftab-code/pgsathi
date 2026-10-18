import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { MapPin, ArrowRight } from "lucide-react";
import { unstable_cache } from "next/cache";

const getTopCities = unstable_cache(
  async () => {
    try {
      return await db.city.findMany({
        where: { isActive: true },
        orderBy: { priority: "asc" },
        take: 6,
        include: {
          _count: {
            select: { localities: true }
          }
        }
      });
    } catch (error) {
      console.error("[CityGrid] Failed to fetch top cities:", error);
      return [];
    }
  },
  ["top-cities-grid-v2"],
  { revalidate: 3600 }
);

export default async function CityGrid() {
  const topCities = await getTopCities();

  if (!topCities || topCities.length === 0) {
    return null; // or a fallback UI
  }

  return (
    <section className="bg-neutral-50 py-12 md:py-20">
      <div className="container-max section-padding">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-neutral-900 mb-2 tracking-tight">Explore Popular Cities</h2>
            <p className="section-subtitle mb-0">Find the best PGs in India's top education and IT hubs.</p>
          </div>
          <Link href="/search" className="btn-ghost flex items-center gap-2 group whitespace-nowrap">
            View All Cities <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {topCities.map((city: any) => (
            <Link 
              key={city.id} 
              href={`/pg-in-${city.slug}`}
              className="group relative h-36 sm:h-44 md:h-56 rounded-2xl overflow-hidden block shadow-sm hover:shadow-hover transition-all duration-300 active:scale-[0.98]"
            >
              {/* Background Image */}
              {city.imageUrl ? (
                <Image 
                  src={city.imageUrl} 
                  alt={city.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 text-transparent"
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-200"></div>
              )}
              
              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
              
              <div className="absolute inset-0 p-3 sm:p-5 flex flex-col justify-end text-white z-10">
                <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                  <MapPin size={13} className="text-orange-400 shrink-0 sm:w-4 sm:h-4" />
                  <span className="text-[11px] sm:text-sm font-medium text-neutral-200 truncate">{city.state}</span>
                </div>
                <h3 className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight">{city.name}</h3>
                <p className="text-[11px] sm:text-sm text-neutral-300 mt-0.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {city._count?.localities || 0} localities
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
