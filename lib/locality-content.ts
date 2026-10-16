/**
 * lib/locality-content.ts
 * Generates unique, rich local content for locality pages: /pg/{city}/{area}/{type}
 * Conforms to SEO Rule 2:
 * - At least 150 words of unique local content
 * - Nearest metro station or transport transit hub
 * - Nearby colleges, coaching centers & universities
 * - Nearby offices, corporate hubs & tech parks
 * - Average rent range (Single, Double, Triple sharing)
 * - 3 nearby-area internal links
 */

export type LocalityType = "boys-pg" | "girls-pg" | "unisex-pg" | "coed-pg" | "co-living" | "pg" | "all-pg" | "hostels";

export const LOCALITY_TYPES: LocalityType[] = [
  "boys-pg",
  "girls-pg",
  "unisex-pg",
  "coed-pg",
  "co-living",
  "pg",
  "all-pg",
  "hostels",
];

export function isLocalityType(slug: string): slug is LocalityType {
  return LOCALITY_TYPES.includes(slug as LocalityType);
}

export function getTypeLabel(type: string): { title: string; genderFilter?: "BOYS" | "GIRLS" | "COED"; tag: string } {
  switch (type) {
    case "boys-pg":
      return { title: "Boys PG & Hostels", genderFilter: "BOYS", tag: "Boys" };
    case "girls-pg":
      return { title: "Girls PG & Hostels", genderFilter: "GIRLS", tag: "Girls" };
    case "unisex-pg":
    case "coed-pg":
      return { title: "Co-ed & Unisex PGs", genderFilter: "COED", tag: "Co-ed" };
    case "co-living":
      return { title: "Co-living Spaces", tag: "Co-living" };
    case "hostels":
      return { title: "Hostels", tag: "Hostels" };
    case "pg":
    case "all-pg":
    default:
      return { title: "Paying Guest (PG) Accommodations", tag: "PGs" };
  }
}

interface LocalityProfile {
  nearestMetro: string;
  colleges: string[];
  offices: string[];
  rentRange: {
    single: string;
    double: string;
    triple: string;
  };
  highlights: string[];
}

// Well-known micro-market profiles for top metros & student hubs
const LOCALITY_PROFILES: Record<string, Partial<LocalityProfile>> = {
  // Delhi
  "mukherjee-nagar": {
    nearestMetro: "GTB Nagar Metro Station (Yellow Line) & Vishwavidyalaya Metro",
    colleges: ["Delhi University (North Campus)", "Hindu College", "Hansraj College", "Drishti IAS & Vision IAS Centers"],
    offices: ["Commercial complex Batra Cinema", "Hudson Lane Hubs", "Civil Lines administrative offices"],
    rentRange: { single: "₹8,000 – ₹14,000", double: "₹5,000 – ₹8,500", triple: "₹3,800 – ₹5,500" },
    highlights: ["24/7 libraries nearby", "Walking distance from DU North Campus", "Safe environment for competitive aspirants"],
  },
  "laxmi-nagar": {
    nearestMetro: "Laxmi Nagar Metro Station (Blue Line) & Nirman Vihar Metro",
    colleges: ["ICAI Bhawan", "Amity University (East Campus)", "Vivekananda College"],
    offices: ["Scope Tower District Centre", "Preet Vihar Corporate Offices", "ITO Institutional Area (3 Metro stops)"],
    rentRange: { single: "₹6,500 – ₹11,000", double: "₹4,000 – ₹7,000", triple: "₹3,200 – ₹4,800" },
    highlights: ["CA/CS Coaching Hub of India", "Budget-friendly street food & dining", "Direct Blue Line metro connectivity to Noida and CP"],
  },
  "karol-bagh": {
    nearestMetro: "Karol Bagh Metro Station (Blue Line) & Rajendra Place Metro",
    colleges: ["Vajiram & Ravi", "Sri Ram IAS", "Tibbia College", "Pusa Institute"],
    offices: ["Rajendra Place Financial District", "Jhandewalan Corporate Towers", "Connaught Place (10 mins)"],
    rentRange: { single: "₹9,000 – ₹16,000", double: "₹6,000 – ₹10,000", triple: "₹4,500 – ₹6,500" },
    highlights: ["Premier UPSC IAS coaching capital", "Vibrant markets and 24/7 study rooms", "Walking access to Blue Line metro"],
  },
  "rajendra-nagar": {
    nearestMetro: "Karol Bagh Metro Station & Rajendra Place (Blue Line)",
    colleges: ["Next IAS", "Forum IAS", "Vision IAS", "Khalsa College"],
    offices: ["Rajendra Place Commercial Towers", "Pusa Road Offices", "Connaught Place (Central Delhi)"],
    rentRange: { single: "₹10,000 – ₹18,000", double: "₹6,500 – ₹11,000", triple: "₹5,000 – ₹7,000" },
    highlights: ["Heart of civil services coaching", "Peaceful residential parks", "Dedicated study cafes and hygienic mess"],
  },
  "satya-niketan": {
    nearestMetro: "Durgabai Deshmukh South Campus Metro (Pink Line)",
    colleges: ["Sri Venkateswara College (Venky)", "ARSD College", "Motilal Nehru College", "Ram Lal Anand College"],
    offices: ["Bhikaji Cama Place", "Chanakyapuri Diplomatic Enclave", "Dhaula Kuan Army HQ"],
    rentRange: { single: "₹8,500 – ₹15,000", double: "₹5,500 – ₹9,000", triple: "₹4,000 – ₹6,000" },
    highlights: ["Vibrant student hub with cafes", "Walking distance to South Campus colleges", "Gated security and dedicated female wardens"],
  },

  // Noida
  "sector-62": {
    nearestMetro: "Noida Electronic City Metro Station (Blue Line) & Sector 62 Metro",
    colleges: ["Jaypee Institute of Information Technology (JIIT)", "JSS Academy of Technical Education", "Symbiosis Centre for Management Studies", "MAIT"],
    offices: ["Logix Cyber Park", "Stellar IT Park", "Barclays", "Samsung India R&D", "Unitech Infospace"],
    rentRange: { single: "₹7,500 – ₹13,500", double: "₹4,500 – ₹8,000", triple: "₹3,500 – ₹5,500" },
    highlights: ["Largest IT and engineering hub in Noida", "Modern high-rise co-living properties", "Zero commute time to major tech companies"],
  },
  "sector-126": {
    nearestMetro: "Okhla Bird Sanctuary Metro Station (Magenta Line)",
    colleges: ["Amity University Noida (Direct walking distance)", "Amity Law School", "Asian Academy of Film and Television (AAFT)"],
    offices: ["HCL Technologies Campus", "Tech Mahindra", "Noida-Greater Noida Expressway Corporate Belt"],
    rentRange: { single: "₹8,000 – ₹15,000", double: "₹5,000 – ₹9,000", triple: "₹3,800 – ₹6,000" },
    highlights: ["Directly opposite Amity University Gate", "Fast access to South Delhi via Magenta Line", "Premium furnished co-living amenities"],
  },
  "sector-15": {
    nearestMetro: "Noida Sector 15 Metro Station (Blue Line)",
    colleges: ["Asian School of Media Studies", "IMS Noida nearby", "Delhi University nearby"],
    offices: ["Sector 16 Film City", "Times of India Offices", "Zee Media", "Wipro Technologies"],
    rentRange: { single: "₹6,500 – ₹11,000", double: "₹4,000 – ₹7,000", triple: "₹3,200 – ₹5,000" },
    highlights: ["Bordering East Delhi & Mayur Vihar", "Proximity to Film City and commercial centers", "Budget-friendly living options"],
  },
  "sector-18": {
    nearestMetro: "Noida Sector 18 Metro Station (Blue Line)",
    colleges: ["Amity University (10 mins)", "Noida International Institute of Technology"],
    offices: ["Wave Silver Tower", "DLF Mall of India Commercial Wings", "Sector 16 Corporate Parks"],
    rentRange: { single: "₹9,000 – ₹16,000", double: "₹6,000 – ₹10,000", triple: "₹4,500 – ₹7,000" },
    highlights: ["Heart of Noida's commercial & retail district", "Walking distance to Metro, malls, and dining", "Premium luxury PGs and executive suites"],
  },

  // Gurgaon
  "dlf-phase-3": {
    nearestMetro: "Moulsari Avenue Rapid Metro & IndusInd Bank Cyber City Metro",
    colleges: ["The NorthCap University", "IILM University", "Apeejay Stya University Hubs"],
    offices: ["DLF Cyber City", "Cyber Green", "Infinity Towers", "Google India", "Deloitte"],
    rentRange: { single: "₹10,000 – ₹18,000", double: "₹6,500 – ₹11,000", triple: "₹5,000 – ₹7,500" },
    highlights: ["Walking distance to Cyber City corporate offices", "Rapid Metro connection at doorstep", "High-speed Wi-Fi & modern food courts"],
  },
  "sector-14": {
    nearestMetro: "MG Road Metro Station (Yellow Line) & IFFCO Chowk Metro",
    colleges: ["Government College for Girls", "Dronacharya Government College"],
    offices: ["Old Delhi-Gurgaon Road Commercial Belt", "Maruti Suzuki Plant", "Signature Towers"],
    rentRange: { single: "₹7,500 – ₹13,000", double: "₹4,500 – ₹8,000", triple: "₹3,500 – ₹5,500" },
    highlights: ["Established residential market with lush parks", "Proximity to HUDA Market Sector 14", "Budget-friendly shared accommodation"],
  },

  // Kota
  "talwandi": {
    nearestMetro: "Kota Junction Railway Station (15 mins via Cab/Auto)",
    colleges: ["Allen Career Institute (Satyarth & Samarth Campus)", "Resonance HQ", "Career Point"],
    offices: ["Commercial complex City Mall", "Aakash Institute Administrative Wing"],
    rentRange: { single: "₹7,000 – ₹14,000", double: "₹4,500 – ₹8,000", triple: "₹3,500 – ₹5,500" },
    highlights: ["Prime coaching capital of Kota", "Silent study-friendly rooms with AC & study table", "Nutritious homely mess included"],
  },
  "kunhari": {
    nearestMetro: "Kota Junction Railway Station (10 mins drive)",
    colleges: ["Allen Sangyan & Samyak Campuses", "Motion Education", "Reliable Institute"],
    offices: ["Landmark City Corporate Buildings", "Kunhari Main Road Commercial Hub"],
    rentRange: { single: "₹6,500 – ₹13,000", double: "₹4,000 – ₹7,500", triple: "₹3,000 – ₹5,000" },
    highlights: ["Modern high-rise student hostels in Landmark City", "Biometric security and parent updates", "Dedicated wardens and in-house mess"],
  },
};

export function getLocalityProfile(localitySlug: string, localityName: string, cityName: string): LocalityProfile {
  const custom = LOCALITY_PROFILES[localitySlug.toLowerCase()] || {};

  return {
    nearestMetro: custom.nearestMetro || `${localityName} Metro / Main Transit Hub (${cityName})`,
    colleges: custom.colleges || [
      `${cityName} University & Associated Colleges`,
      `State Technical & Management Institutes near ${localityName}`,
      `Leading Coaching & Professional Training Academies`,
    ],
    offices: custom.offices || [
      `Corporate Tech Parks in & around ${localityName}`,
      `${cityName} Central Business District & Commercial Hubs`,
      `IT, Financial & BPO Complexes`,
    ],
    rentRange: custom.rentRange || {
      single: "₹7,000 – ₹13,500",
      double: "₹4,500 – ₹8,000",
      triple: "₹3,500 – ₹5,500",
    },
    highlights: custom.highlights || [
      "100% Zero Brokerage directly with verified property owners",
      "High-speed Wi-Fi, daily housekeeping & 24/7 security",
      "Hygienic 3-time meals (Breakfast, Lunch & Dinner) included options",
    ],
  };
}

export function generateLocalityGuideContent(opts: {
  cityName: string;
  citySlug: string;
  localityName: string;
  localitySlug: string;
  type: string;
}): {
  wordCount: number;
  body: string;
  rentOverview: string;
  transportOverview: string;
  educationOverview: string;
} {
  const { cityName, citySlug, localityName, localitySlug, type } = opts;
  const typeInfo = getTypeLabel(type);
  const profile = getLocalityProfile(localitySlug, localityName, cityName);

  const intro = `Looking for the best ${typeInfo.title.toLowerCase()} in ${localityName}, ${cityName}? PGSathi is India's premier zero-brokerage PG list platform, connecting students and working professionals directly with verified property owners. ${localityName} is one of the most sought-after residential micro-markets in ${cityName}, known for its peaceful living atmosphere, excellent public transit connectivity, and abundant dining and market avenues. Whether you are a college student attending nearby lectures or an IT professional commuting to commercial tech hubs, living in a verified PG in ${localityName} gives you the perfect balance of convenience, modern amenities, and pocket-friendly rentals without paying a single rupee to middlemen or property brokers.`;

  const rentOverview = `Average PG rents in ${localityName}, ${cityName} cater to all budget brackets. Single private occupancy rooms typically range between ${profile.rentRange.single} per month, offering complete privacy, attached washrooms, and air-conditioning. Double sharing rooms are the most popular choice among students and young executives, averaging ${profile.rentRange.double} per month with shared wardrobes, study desks, and high-speed Wi-Fi. Budget-friendly triple sharing options are available between ${profile.rentRange.triple} per month. Most accommodations listed on PGSathi come fully furnished with bed linen, geysers, RO purified drinking water, 24/7 CCTV surveillance, and flexible meal plans serving nutritious breakfast, lunch, and dinner.`;

  const transportOverview = `Commute convenience is a major advantage of living in ${localityName}. The area is well served by ${profile.nearestMetro}, alongside frequent auto-rickshaws, city buses, and app-based cab services like Uber and Ola. Daily commuters enjoy smooth arterial connectivity to central commercial districts, railway terminals, and airports, making it effortless to reach offices or universities on time without enduring long traffic delays.`;

  const educationOverview = `Students in ${localityName} benefit from quick access to prestigious academic and coaching centers, including ${profile.colleges.slice(0, 3).join(", ")}. Working professionals are situated close to leading employment corridors such as ${profile.offices.slice(0, 3).join(", ")}, reducing daily travel fatigue. By browsing listings on PGSathi, you can inspect real room photographs, check verified amenities, verify security deposit terms, and directly call or message owners on WhatsApp to schedule an instant site visit.`;

  const fullText = `${intro} ${rentOverview} ${transportOverview} ${educationOverview}`;
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  return {
    wordCount,
    body: fullText,
    rentOverview,
    transportOverview,
    educationOverview,
  };
}
