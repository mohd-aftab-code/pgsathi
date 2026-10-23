import { CITY_ALIASES } from "./city-filter";

export interface ListingUrlData {
  slug: string;
  city?: { slug: string } | null;
  locality?: { slug: string } | null;
}

/**
 * Returns canonical city slug, mapping administrative/district names
 * (e.g., 'gautam-buddha-nagar' -> 'noida', 'south-delhi' -> 'delhi').
 */
export function getCanonicalCitySlug(citySlug?: string | null): string {
  if (!citySlug) return "india";
  const lower = citySlug.toLowerCase().trim();
  const alias = CITY_ALIASES[lower];
  if (alias?.canonicalSlug) {
    return alias.canonicalSlug;
  }
  return lower;
}

/**
 * Generates the clean, simple City + PG Name URL.
 * Example: /pg/noida/the-laxmi-stays-girls-pg
 *          /pg/delhi/justpg-ard-house
 */
export function getListingUrl(listing: ListingUrlData): string {
  const citySlug = getCanonicalCitySlug(listing.city?.slug);
  return `/pg/${citySlug}/${listing.slug}`;
}
