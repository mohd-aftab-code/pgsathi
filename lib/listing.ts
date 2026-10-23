import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

export function getListingBySlug(slug: string) {
  return unstable_cache(
    async () => {
      let listing = await db.listing.findUnique({
        where: { slug, status: "ACTIVE", isActive: true },
        include: {
          city: true,
          locality: true,
          photos: { orderBy: { sortOrder: "asc" } },
          amenities: { include: { amenity: true } },
          reviews: {
            where: { isApproved: true },
            include: { user: { select: { name: true, avatar: true } } },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          owner: { select: { name: true, avatar: true } },
        },
      });

      // Flexible fallback: if slug has or doesn't have suffix (e.g. without -203909)
      if (!listing) {
        listing = await db.listing.findFirst({
          where: {
            OR: [
              { slug: { startsWith: `${slug}-` } },
              { slug: slug.replace(/-\d{4,8}$/, "") },
            ],
            status: "ACTIVE",
            isActive: true,
          },
          include: {
            city: true,
            locality: true,
            photos: { orderBy: { sortOrder: "asc" } },
            amenities: { include: { amenity: true } },
            reviews: {
              where: { isApproved: true },
              include: { user: { select: { name: true, avatar: true } } },
              orderBy: { createdAt: "desc" },
              take: 10,
            },
            owner: { select: { name: true, avatar: true } },
          },
        });
      }

      return listing;
    },
    ["pg-detail", slug],
    {
      revalidate: 300, // 5 minutes
      tags: [`listing-${slug}`],
    }
  )();
}
