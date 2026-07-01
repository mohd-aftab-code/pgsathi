import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { CITY_SLUGS } from '@/constants/cities';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in';

  // Get all active PG listings
  const activeListings = await db.listing.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true, updatedAt: true, city: { select: { slug: true } }, locality: { select: { slug: true } } },
  });

  const listingUrls = activeListings.map((listing) => ({
    url: `${baseUrl}/pg/${listing.city?.slug || 'unknown'}/${listing.locality?.slug || 'all'}/${listing.slug}`,
    lastModified: listing.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Generate Advanced Programmatic City URLs
  const programmaticUrls: any[] = [];
  
  CITY_SLUGS.forEach((slug) => {
    // Base city PG page
    programmaticUrls.push({
      url: `${baseUrl}/pg-in-${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });

    // Gender specific pages for each city
    ['boys', 'girls', 'coed'].forEach((gender) => {
      programmaticUrls.push({
        url: `${baseUrl}/${gender}-pg-in-${slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });
    });
  });

  // Blog Posts URLs
  const blogPosts = [
    'ncr-zero-brokerage-pg-guide',
    '5-things-check-before-renting',
    'how-to-avoid-broker-scams'
  ];
  
  const blogUrls = blogPosts.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
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

  return [...staticRoutes, ...programmaticUrls, ...blogUrls, ...listingUrls];
}
