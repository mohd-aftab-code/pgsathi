import Link from "next/link";
import Image from "next/image";
import { CITIES } from "@/constants/cities";
import { MapPin, ArrowRight } from "lucide-react";

export default function CityGrid() {
  // Only show top 6 priority cities on homepage
  const topCities = CITIES.sort((a, b) => a.priority - b.priority).slice(0, 6);

  return (
    <section className="bg-neutral-50 py-12 md:py-20">
      <div className="container-max section-padding">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="section-title mb-2">Explore Popular Cities</h2>
            <p className="section-subtitle mb-0">Find the best PGs in India's top education and IT hubs.</p>
          </div>
          <Link href="/search" className="btn-ghost flex items-center gap-2 group whitespace-nowrap">
            View All Cities <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {topCities.map((city: any) => (
            <Link 
              key={city.id} 
              href={`/search?city=${city.slug}`}
              className="group relative h-40 md:h-56 rounded-2xl overflow-hidden block shadow-sm hover:shadow-hover transition-all duration-300"
            >
              {/* Background Image */}
              {city.image ? (
                <Image 
                  src={city.image} 
                  alt={city.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 text-transparent"
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-200"></div>
              )}
              
              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100"></div>
              
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white z-10 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} className="text-orange-400" />
                  <span className="text-sm font-medium text-neutral-200">{city.state}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white">{city.name}</h3>
                <p className="text-sm text-neutral-300 mt-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  {city.localities.length} localities
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
