/**
 * Comprehensive City Alias & Normalized Location Filter
 * Maps user-selected cities/slugs to all matching database city records and addresses.
 * For example:
 * - 'noida' matches city 'noida' (id: 9), 'gautam-buddha-nagar' (id: 32), and addresses containing 'Noida'
 * - 'delhi' matches city 'delhi' (id: 2), 'south-delhi' (id: 36), and state 'Delhi'
 * - 'prayagraj' / 'allahabad' matches both 'allahabad' (id: 30) and 'allahabad-uttar-pradesh' (id: 35)
 * - 'hyderabad' matches city 'hyderabad' (id: 6) and 'kvrangareddy' (id: 34)
 */

export interface CityAliasConfig {
  canonicalSlug: string;
  displayName: string;
  slugs: string[];
  names: string[];
  state?: string;
}

export const CITY_ALIASES: Record<string, CityAliasConfig> = {
  noida: {
    canonicalSlug: "noida",
    displayName: "Noida",
    slugs: ["noida", "gautam-buddha-nagar", "greater-noida"],
    names: ["Noida", "Gautam Buddha Nagar", "Dadri"],
  },
  "gautam-buddha-nagar": {
    canonicalSlug: "noida",
    displayName: "Noida",
    slugs: ["noida", "gautam-buddha-nagar", "greater-noida"],
    names: ["Noida", "Gautam Buddha Nagar", "Dadri"],
  },
  delhi: {
    canonicalSlug: "delhi",
    displayName: "Delhi",
    slugs: ["delhi", "south-delhi", "new-delhi", "north-delhi", "east-delhi", "west-delhi"],
    names: ["Delhi", "South Delhi", "New Delhi"],
    state: "Delhi",
  },
  "south-delhi": {
    canonicalSlug: "delhi",
    displayName: "Delhi",
    slugs: ["delhi", "south-delhi", "new-delhi"],
    names: ["Delhi", "South Delhi", "New Delhi"],
    state: "Delhi",
  },
  allahabad: {
    canonicalSlug: "allahabad",
    displayName: "Prayagraj (Allahabad)",
    slugs: ["allahabad", "prayagraj", "allahabad-uttar-pradesh"],
    names: ["Prayagraj", "Allahabad"],
  },
  prayagraj: {
    canonicalSlug: "allahabad",
    displayName: "Prayagraj (Allahabad)",
    slugs: ["allahabad", "prayagraj", "allahabad-uttar-pradesh"],
    names: ["Prayagraj", "Allahabad"],
  },
  "allahabad-uttar-pradesh": {
    canonicalSlug: "allahabad",
    displayName: "Prayagraj (Allahabad)",
    slugs: ["allahabad", "prayagraj", "allahabad-uttar-pradesh"],
    names: ["Prayagraj", "Allahabad"],
  },
  hyderabad: {
    canonicalSlug: "hyderabad",
    displayName: "Hyderabad",
    slugs: ["hyderabad", "kvrangareddy", "secunderabad"],
    names: ["Hyderabad", "K.V.Rangareddy", "Rangareddy"],
  },
  kvrangareddy: {
    canonicalSlug: "hyderabad",
    displayName: "Hyderabad",
    slugs: ["hyderabad", "kvrangareddy", "secunderabad"],
    names: ["Hyderabad", "K.V.Rangareddy", "Rangareddy"],
  },
  chennai: {
    canonicalSlug: "chennai",
    displayName: "Chennai",
    slugs: ["chennai", "kanchipuram"],
    names: ["Chennai", "Kanchipuram"],
  },
  kanchipuram: {
    canonicalSlug: "chennai",
    displayName: "Chennai",
    slugs: ["chennai", "kanchipuram"],
    names: ["Chennai", "Kanchipuram"],
  },
  kolkata: {
    canonicalSlug: "kolkata",
    displayName: "Kolkata",
    slugs: ["kolkata", "north-24-parganas", "south-24-parganas", "howrah"],
    names: ["Kolkata", "North 24 Parganas"],
  },
  "north-24-parganas": {
    canonicalSlug: "kolkata",
    displayName: "Kolkata",
    slugs: ["kolkata", "north-24-parganas"],
    names: ["Kolkata", "North 24 Parganas"],
  },
  jaipur: {
    canonicalSlug: "jaipur",
    displayName: "Jaipur",
    slugs: ["jaipur", "jaipur-municipal-corporation"],
    names: ["Jaipur", "Jaipur Municipal Corporation"],
  },
  "jaipur-municipal-corporation": {
    canonicalSlug: "jaipur",
    displayName: "Jaipur",
    slugs: ["jaipur", "jaipur-municipal-corporation"],
    names: ["Jaipur", "Jaipur Municipal Corporation"],
  },
  ghaziabad: {
    canonicalSlug: "ghaziabad",
    displayName: "Ghaziabad",
    slugs: ["ghaziabad"],
    names: ["Ghaziabad", "Vaishali", "Indirapuram"],
  },
  kota: {
    canonicalSlug: "kota",
    displayName: "Kota",
    slugs: ["kota"],
    names: ["Kota"],
  },
  mumbai: {
    canonicalSlug: "mumbai",
    displayName: "Mumbai",
    slugs: ["mumbai", "navi-mumbai", "thane"],
    names: ["Mumbai", "Navi Mumbai", "Thane"],
  },
  indore: {
    canonicalSlug: "indore",
    displayName: "Indore",
    slugs: ["indore"],
    names: ["Indore"],
  },
  sikar: {
    canonicalSlug: "sikar",
    displayName: "Sikar",
    slugs: ["sikar"],
    names: ["Sikar"],
  },
};

/**
 * Builds a Prisma WHERE condition that matches all listings in the target city,
 * including regional administrative aliases (e.g., Gautam Buddha Nagar for Noida).
 */
export function buildCityFilterClause(citySlug: string) {
  if (!citySlug || citySlug === "all") return null;

  const normalized = citySlug.toLowerCase().trim();
  const alias = CITY_ALIASES[normalized];

  const orConditions: any[] = [];

  if (alias) {
    // 1. Match any of the city slugs
    orConditions.push({ city: { slug: { in: alias.slugs } } });

    // 2. Match city names
    orConditions.push({ city: { name: { in: alias.names, mode: "insensitive" } } });

    // 3. Match state if defined (e.g. state = 'Delhi')
    if (alias.state) {
      orConditions.push({ city: { state: { contains: alias.state, mode: "insensitive" } } });
    }

    // 4. Match address text containing the city name
    for (const name of alias.names) {
      orConditions.push({ address: { contains: name, mode: "insensitive" } });
    }
  } else {
    // Generic fallback for any other city
    orConditions.push({ city: { slug: normalized } });
    orConditions.push({ city: { name: { contains: normalized, mode: "insensitive" } } });
    orConditions.push({ address: { contains: normalized, mode: "insensitive" } });
  }

  return { OR: orConditions };
}

/**
 * Returns a deduplicated, cleanly labelled list of searchable cities for dropdowns.
 */
export function getNormalizedCityList(rawCities: Array<{ id: number; name: string; slug: string; priority?: number }>) {
  const seenCanonical = new Set<string>();
  const result: Array<{ name: string; slug: string }> = [];

  // Priority order of main active cities
  const priorityOrder = [
    { name: "Noida", slug: "noida" },
    { name: "Delhi", slug: "delhi" },
    { name: "Prayagraj (Allahabad)", slug: "allahabad" },
    { name: "Kota", slug: "kota" },
    { name: "Ghaziabad", slug: "ghaziabad" },
    { name: "Indore", slug: "indore" },
    { name: "Mumbai", slug: "mumbai" },
    { name: "Hyderabad", slug: "hyderabad" },
    { name: "Chennai", slug: "chennai" },
    { name: "Jaipur", slug: "jaipur" },
    { name: "Kolkata", slug: "kolkata" },
    { name: "Sikar", slug: "sikar" },
  ];

  for (const p of priorityOrder) {
    seenCanonical.add(p.slug);
    result.push(p);
  }

  // Add any additional cities from DB that aren't already represented
  for (const c of rawCities) {
    const alias = CITY_ALIASES[c.slug.toLowerCase()];
    const canonical = alias ? alias.canonicalSlug : c.slug;
    if (!seenCanonical.has(canonical)) {
      seenCanonical.add(canonical);
      result.push({ name: c.name, slug: c.slug });
    }
  }

  return result;
}
