import Image from "next/image";
import Link from "next/link";
import { MapPin, User, CheckCircle } from "lucide-react";
import { getThumbnailUrl } from "@/lib/cloudinary";

interface PGCardProps {
  pg: any; // Ideally we use proper Prisma type here
}

export default function PGCard({ pg }: PGCardProps) {
  const imageUrl = pg.photos?.[0]?.url 
    ? getThumbnailUrl(pg.photos[0].url, 400, 300) 
    : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80"; // Fallback placeholder

  return (
    <Link href={`/pg/${pg.slug}`} className="group block bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-hover transition-all duration-300">
      <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
        <Image 
          src={imageUrl} 
          alt={pg.title} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {pg.isFeatured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
            Featured
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-primary-900 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
          {pg.genderAllowed} PG
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg text-neutral-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {pg.title}
          </h3>
          <div className="font-extrabold text-lg text-primary-700 whitespace-nowrap">
            ₹{pg.priceMin}<span className="text-xs text-neutral-500 font-normal">/mo</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-neutral-500 text-sm mb-4">
          <MapPin size={14} className="text-orange-500" />
          <span className="line-clamp-1">
            {[pg.locality?.name, pg.city?.name].filter(Boolean).join(", ")}
          </span>
        </div>

        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
            <CheckCircle size={12} /> Verified
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-secondary-600">
            View Details &rarr;
          </div>
        </div>
      </div>
    </Link>
  );
}
