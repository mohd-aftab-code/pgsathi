export interface AmenityDef {
  id: number;
  name: string;
  slug: string;
  icon: string;          // lucide-react icon name
  category: "food" | "security" | "comfort" | "connectivity" | "transport" | "facility";
}

export const AMENITIES: AmenityDef[] = [
  // FOOD
  { id: 1,  name: "Meals Included",     slug: "meals-included",     icon: "UtensilsCrossed", category: "food" },
  { id: 2,  name: "Kitchen Access",     slug: "kitchen-access",     icon: "ChefHat",         category: "food" },
  { id: 3,  name: "Tiffin Service",     slug: "tiffin-service",     icon: "Package",         category: "food" },
  { id: 4,  name: "RO Water",           slug: "ro-water",           icon: "Droplets",        category: "food" },

  // SECURITY
  { id: 5,  name: "24/7 Security",      slug: "security-24x7",      icon: "Shield",          category: "security" },
  { id: 6,  name: "CCTV Cameras",       slug: "cctv",               icon: "Camera",          category: "security" },
  { id: 7,  name: "Biometric Entry",    slug: "biometric-entry",    icon: "Fingerprint",     category: "security" },
  { id: 8,  name: "Gated Campus",       slug: "gated-campus",       icon: "Lock",            category: "security" },

  // COMFORT
  { id: 9,  name: "AC Room",            slug: "ac-room",            icon: "Wind",            category: "comfort" },
  { id: 10, name: "Attached Bathroom",  slug: "attached-bathroom",  icon: "Bath",            category: "comfort" },
  { id: 11, name: "Furnished Room",     slug: "furnished",          icon: "Sofa",            category: "comfort" },
  { id: 12, name: "Washing Machine",    slug: "washing-machine",    icon: "WashingMachine",  category: "comfort" },
  { id: 13, name: "Hot Water",          slug: "hot-water",          icon: "Flame",           category: "comfort" },
  { id: 14, name: "Wardrobe",           slug: "wardrobe",           icon: "Square",          category: "comfort" },
  { id: 15, name: "Study Table",        slug: "study-table",        icon: "GraduationCap",   category: "comfort" },

  // CONNECTIVITY
  { id: 16, name: "High Speed WiFi",    slug: "wifi",               icon: "Wifi",            category: "connectivity" },
  { id: 17, name: "Power Backup",       slug: "power-backup",       icon: "Zap",             category: "connectivity" },

  // TRANSPORT
  { id: 18, name: "Parking Available",  slug: "parking",            icon: "Car",             category: "transport" },
  { id: 19, name: "Bike Allowed",       slug: "bike-allowed",       icon: "Bike",            category: "transport" },
  { id: 20, name: "Bus Stop Nearby",    slug: "bus-stop",           icon: "Bus",             category: "transport" },

  // FACILITY
  { id: 21, name: "Common Room",        slug: "common-room",        icon: "Tv",              category: "facility" },
  { id: 22, name: "Gym",               slug: "gym",                icon: "Dumbbell",        category: "facility" },
  { id: 23, name: "Housekeeping",       slug: "housekeeping",       icon: "Brush",           category: "facility" },
  { id: 24, name: "Laundry Service",    slug: "laundry",            icon: "Shirt",           category: "facility" },
  { id: 25, name: "Reading Room",       slug: "reading-room",       icon: "BookOpen",        category: "facility" },
];

export const AMENITY_CATEGORIES = [
  { key: "food",          label: "Food & Water" },
  { key: "security",      label: "Security" },
  { key: "comfort",       label: "Comfort" },
  { key: "connectivity",  label: "Connectivity" },
  { key: "transport",     label: "Transport" },
  { key: "facility",      label: "Facilities" },
];

export function getAmenityBySlug(slug: string): AmenityDef | undefined {
  return AMENITIES.find((a) => a.slug === slug);
}

export function getAmenitiesByCategory(category: AmenityDef["category"]): AmenityDef[] {
  return AMENITIES.filter((a) => a.category === category);
}
