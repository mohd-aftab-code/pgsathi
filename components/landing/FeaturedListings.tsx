import PGCard from "@/components/listings/PGCard";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function FeaturedListings() {
  // Fetch featured listings first
  let listings = await db.listing.findMany({
    where: { isActive: true, status: "ACTIVE", isFeatured: true },
    take: 6,
    include: {
      city: true,
      locality: true,
      photos: { take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const isFeatured = listings.length > 0;

  // Fallback: show latest listings if no featured ones
  if (!isFeatured) {
    listings = await db.listing.findMany({
      where: { isActive: true, status: "ACTIVE" },
      take: 6,
      include: {
        city: true,
        locality: true,
        photos: { take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (listings.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container-max section-padding">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="section-title mb-2">{isFeatured ? "Featured PGs" : "Latest PGs"}</h2>
            <p className="section-subtitle mb-0">
              {isFeatured ? "Handpicked top-rated PGs across India." : "Freshly listed PGs — be the first to enquire."}
            </p>
          </div>
          <Link href="/search" className="btn-ghost flex items-center gap-2 group whitespace-nowrap">
            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((pg) => (
            <PGCard key={pg.id} pg={pg} />
          ))}
        </div>
      </div>
    </section>
  );
}
