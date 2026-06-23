import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { CITY_SLUGS } from '@/constants/cities';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in';

  // Get all active PG listings
  const activeListings = await db.listing.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true, updatedAt: true },
  });

  const listingUrls = activeListings.map((listing) => ({
    url: `${baseUrl}/pg/${listing.slug}`,
    lastModified: listing.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Generate City URLs
  const cityUrls = CITY_SLUGS.map((slug) => ({
    url: `${baseUrl}/search?city=${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Static core routes
  const staticRoutes = [
    '',
    '/search',
    '/about',
    '/contact',
    '/pricing',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return [...staticRoutes, ...cityUrls, ...listingUrls];
}
