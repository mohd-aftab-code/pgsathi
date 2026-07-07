import Image from "next/image";
import Link from "next/link";
import { MapPin, CheckCircle, ArrowRight } from "lucide-react";
import { getThumbnailUrl } from "@/lib/cloudinary";

interface PGCardProps {
  pg: any; // Ideally we use proper Prisma type here
}

export default function PGCard({ pg }: PGCardProps) {
  const imageUrl = pg.photos?.[0]?.url 
    ? getThumbnailUrl(pg.photos[0].url, 400, 300) 
    : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80"; // Fallback placeholder

  const genderLabel = pg.genderAllowed === "BOYS" ? "Boys" : pg.genderAllowed === "GIRLS" ? "Girls" : "Co-ed";

  return (
    <Link href={`/pg/${pg.city?.slug || 'unknown'}/${pg.locality?.slug || 'all'}/${pg.slug}`} className="group flex flex-col bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-56 md:h-48 w-full overflow-hidden bg-neutral-100 shrink-0">
        <Image 
          src={imageUrl} 
          alt={pg.title} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {pg.isFeatured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] md:text-xs font-bold px-2 md:px-2.5 py-1 rounded-md shadow-md flex items-center gap-1 uppercase tracking-wider">
            Featured
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-primary-900 text-[10px] md:text-xs font-bold px-2 md:px-2.5 py-1 rounded-md shadow-sm">
          {genderLabel} PG
        </div>
      </div>
      
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1">
          <h3 className="font-bold text-base sm:text-lg md:text-xl text-neutral-900 line-clamp-2 group-hover:text-primary-600 transition-colors leading-tight">
            {pg.title}
          </h3>
          <div className="text-right shrink-0">
            <div className="font-black text-lg sm:text-xl md:text-2xl text-primary-700 whitespace-nowrap leading-none">
              ₹{pg.priceMin}
            </div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-neutral-500 font-medium">/month</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-neutral-500 text-xs md:text-sm mb-4 mt-1">
          <MapPin size={14} className="text-orange-500 shrink-0" />
          <span className="line-clamp-1">
            {[pg.locality?.name, pg.city?.name].filter(Boolean).join(", ")}
          </span>
        </div>

        <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded-md">
            <CheckCircle size={12} className="text-green-500" /> Verified
          </div>
          <div className="flex items-center gap-1 text-xs md:text-sm font-bold text-primary-600 group-hover:gap-2 transition-all">
            View <ArrowRight size={14} className="md:w-4 md:h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
