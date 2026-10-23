import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { BLOG_POSTS } from '@/lib/data/blogs';
import { getListingUrl } from '@/lib/url';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // cache for 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pgsathi.in';

  // 1. Get all genuinely active PG listings
  const activeListings = await db.listing.findMany({
    where: {
      status: 'ACTIVE',
      isActive: true,
      cityId: { not: null },
    },
    select: {
      slug: true,
      updatedAt: true,
      city: { select: { slug: true } },
      locality: { select: { slug: true } },
    },
  });

  const listingUrls: MetadataRoute.Sitemap = activeListings.map((listing) => ({
    url: `${baseUrl}${getListingUrl(listing)}`,
    lastModified: listing.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 2. Fetch cities that have genuine active listings (eligible for indexing)
  // Empty city pages have `noIndex: true` and must not be submitted to the sitemap.
  const citiesWithListings = await db.city.findMany({
    where: {
      isActive: true,
      listings: {
        some: {
          status: 'ACTIVE',
          isActive: true,
        },
      },
    },
    select: {
      slug: true,
      listings: {
        where: {
          status: 'ACTIVE',
          isActive: true,
        },
        select: {
          genderAllowed: true,
        },
      },
    },
  });

  const cityUrls: MetadataRoute.Sitemap = [];
  for (const city of citiesWithListings) {
    if (!city.slug) continue;

    cityUrls.push({
      url: `${baseUrl}/pg-in-${city.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    });

    const hasBoys = city.listings.some((l) => l.genderAllowed === 'BOYS');
    const hasGirls = city.listings.some((l) => l.genderAllowed === 'GIRLS');
    const hasCoed = city.listings.some((l) => l.genderAllowed === 'COED');

    if (hasBoys) {
      cityUrls.push({
        url: `${baseUrl}/boys-pg-in-${city.slug}`,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      });
    }
    if (hasGirls) {
      cityUrls.push({
        url: `${baseUrl}/girls-pg-in-${city.slug}`,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      });
    }
    if (hasCoed) {
      cityUrls.push({
        url: `${baseUrl}/coed-pg-in-${city.slug}`,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      });
    }
  }

  // 3. Fetch localities that have genuine active listings
  const localitiesWithListings = await db.locality.findMany({
    where: {
      isActive: true,
      city: { isActive: true },
      listings: {
        some: {
          status: 'ACTIVE',
          isActive: true,
        },
      },
    },
    select: {
      slug: true,
      city: { select: { slug: true } },
      listings: {
        where: {
          status: 'ACTIVE',
          isActive: true,
        },
        select: {
          genderAllowed: true,
        },
      },
    },
  });

  const localityUrls: MetadataRoute.Sitemap = [];
  for (const loc of localitiesWithListings) {
    if (!loc.city?.slug || !loc.slug) continue;

    localityUrls.push({
      url: `${baseUrl}/pg/${loc.city.slug}/${loc.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    });

    const hasBoys = loc.listings.some((l) => l.genderAllowed === 'BOYS');
    const hasGirls = loc.listings.some((l) => l.genderAllowed === 'GIRLS');
    const hasCoed = loc.listings.some((l) => l.genderAllowed === 'COED');

    if (hasBoys) {
      localityUrls.push({
        url: `${baseUrl}/pg/${loc.city.slug}/${loc.slug}/boys-pg`,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      });
    }
    if (hasGirls) {
      localityUrls.push({
        url: `${baseUrl}/pg/${loc.city.slug}/${loc.slug}/girls-pg`,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      });
    }
    if (hasCoed) {
      localityUrls.push({
        url: `${baseUrl}/pg/${loc.city.slug}/${loc.slug}/co-living`,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      });
    }
  }

  // 4. Blog Posts URLs (using verified article publication dates)
  const blogUrls: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // 5. Static core routes (omit lastModified when real modification date is unavailable)
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/about',
    '/contact',
    '/blog',
    '/privacy',
    '/terms',
    '/refund',
    '/faq',
    '/for-owners',
    '/partner',
    '/pg-management-software',
    '/compare',
    '/compare/pgsathi-vs-rentok',
    '/compare/pgsathi-vs-nobroker',
    '/trust-and-safety',
    '/how-it-works',
    '/help',
    '/careers',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return [...staticRoutes, ...cityUrls, ...localityUrls, ...blogUrls, ...listingUrls];
}
