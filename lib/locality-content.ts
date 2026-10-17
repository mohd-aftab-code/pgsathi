/**
 * lib/locality-content.ts
 * Generates unique, rich local content for locality pages: /pg/{city}/{area}/{type}
 * Conforms to Advanced SEO Standards:
 * - 200+ words of unique local content with localized search intent
 * - Nearest metro station, transit lines & authoritative external transit links (DMRC, NMRC, etc.)
 * - Top nearby colleges, universities & coaching institutes
 * - Corporate hubs, tech parks & business corridors
 * - Average rent range (Single, Double, Triple sharing)
 * - Structured FAQ data for Google Rich Snippets
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

export interface LocalityProfile {
  nearestMetro: string;
  metroLine?: string;
  transitUrl: string;
  transitName: string;
  colleges: string[];
  offices: string[];
  rentRange: {
    single: string;
    double: string;
    triple: string;
  };
  highlights: string[];
  faqs?: Array<{ question: string; answer: string }>;
}

// Comprehensive micro-market profiles for top NCR & major Indian student/IT hubs
const LOCALITY_PROFILES: Record<string, Partial<LocalityProfile>> = {
  // ─── NOIDA (TOP NCR IT & ACADEMIC HUBS) ─────────────────────────────
  "sector-62": {
    nearestMetro: "Noida Electronic City Metro (Blue Line) & Sector 62 Metro Station",
    metroLine: "Delhi Metro Blue Line",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "Delhi Metro (DMRC) Blue Line Guide",
    colleges: ["Jaypee Institute of Information Technology (JIIT)", "JSS Academy of Technical Education", "Symbiosis Centre for Management Studies", "IIM Lucknow Noida Campus"],
    offices: ["Logix Cyber Park", "Stellar IT Park", "Barclays Global Service Centre", "Samsung India R&D", "Unitech Infospace"],
    rentRange: { single: "₹7,500 – ₹14,000", double: "₹4,800 – ₹8,500", triple: "₹3,500 – ₹5,500" },
    highlights: ["Largest IT & Engineering corridor in Noida", "Modern high-rise co-living properties", "Zero commute time to major tech companies", "High-speed Wi-Fi & 3-time meal options"],
  },
  "sector-126": {
    nearestMetro: "Okhla Bird Sanctuary Metro Station & Botanical Garden Interchange",
    metroLine: "Delhi Metro Magenta Line",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "Delhi Metro (DMRC) Magenta Line Guide",
    colleges: ["Amity University Noida (Direct Walking Distance)", "Amity Law School", "Asian Academy of Film & TV (AAFT)"],
    offices: ["HCL Technologies Campus", "Tech Mahindra", "Noida-Greater Noida Expressway Corporate Belt", "Genpact"],
    rentRange: { single: "₹8,500 – ₹16,000", double: "₹5,200 – ₹9,500", triple: "₹4,000 – ₹6,500" },
    highlights: ["Directly opposite Amity University Gate 2 & 4", "Fast 15-minute access to South Delhi via Magenta Line", "Strict biometric security & female wardens for girls PGs"],
  },
  "sector-18": {
    nearestMetro: "Noida Sector 18 Metro Station (Blue Line)",
    metroLine: "Delhi Metro Blue Line",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "Delhi Metro Blue Line Portal",
    colleges: ["Amity University (10 mins drive)", "Noida International Institute of Technology"],
    offices: ["Wave Silver Tower", "DLF Mall of India Corporate Wings", "Sector 16 Film City Corporate Parks"],
    rentRange: { single: "₹9,500 – ₹17,000", double: "₹6,000 – ₹10,500", triple: "₹4,800 – ₹7,000" },
    highlights: ["Heart of Noida's commercial & retail district", "Walking distance to metro, cafes & premium shopping", "Executive suites with housekeeping & high-speed Wi-Fi"],
  },
  "sector-15": {
    nearestMetro: "Noida Sector 15 Metro Station (Blue Line)",
    metroLine: "Delhi Metro Blue Line",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "Delhi Metro Blue Line Guide",
    colleges: ["Asian School of Media Studies", "IMS Noida nearby", "Mayur Vihar Colleges nearby"],
    offices: ["Sector 16 Film City", "Times of India & Zee Media Offices", "Wipro Technologies"],
    rentRange: { single: "₹6,500 – ₹11,500", double: "₹4,200 – ₹7,500", triple: "₹3,200 – ₹5,000" },
    highlights: ["Bordering East Delhi & Mayur Vihar", "Proximity to Film City studios & commercial centers", "Budget-friendly rooms for interns & freshers"],
  },
  "sector-22": {
    nearestMetro: "Noida City Centre Metro & Sector 34 Metro Station",
    metroLine: "Delhi Metro Blue Line",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "Delhi Metro Route Planner",
    colleges: ["Government Degree College Noida", "Noida Institute of Education"],
    offices: ["Sector 57 Commercial Hub", "Sector 59 IT Park", "Sector 62 IT Corridor (5 mins)"],
    rentRange: { single: "₹6,000 – ₹10,500", double: "₹3,800 – ₹6,500", triple: "₹2,800 – ₹4,500" },
    highlights: ["Noida's top budget PG hotspot", "Affordable dining and street food markets", "Direct bus & shared auto to Sector 62 tech companies"],
  },
  "sector-137": {
    nearestMetro: "Noida Sector 137 Metro Station (Aqua Line)",
    metroLine: "Noida Metro Rail Corporation (Aqua Line)",
    transitUrl: "https://www.nmrcnoida.com/",
    transitName: "Noida Metro (NMRC) Official Portal",
    colleges: ["Shiv Nadar University Campus", "Amity University (10 mins via Aqua Line)"],
    offices: ["Advant Navis Business Park", "Felix Healthcare Hub", "Expressway IT SEZ"],
    rentRange: { single: "₹8,500 – ₹15,000", double: "₹5,000 – ₹9,000", triple: "₹3,800 – ₹6,000" },
    highlights: ["Modern high-rise residential societies", "Walking distance to Advant Navis Business Park", "Clean, gated societies with 24/7 security & gyms"],
  },
  "knowledge-park": {
    nearestMetro: "Knowledge Park II Metro Station (Aqua Line)",
    metroLine: "Noida Metro (Aqua Line)",
    transitUrl: "https://www.nmrcnoida.com/",
    transitName: "NMRC Aqua Line Route & Timetable",
    colleges: ["Galgotias University & College", "Sharda University", "GL Bajaj Institute of Tech", "IIMT Group of Colleges"],
    offices: ["Greater Noida Industrial Development Area", "Wipro SEZ", "Stellar Gymkhana"],
    rentRange: { single: "₹7,000 – ₹13,000", double: "₹4,500 – ₹7,500", triple: "₹3,500 – ₹5,200" },
    highlights: ["Educational hub of Greater Noida", "Student-friendly hostels with food & transport shuttles", "Air-conditioned rooms with power backup"],
  },

  // ─── DELHI (STUDENT & PROFESSIONAL HUBS) ───────────────────────────
  "north-campus": {
    nearestMetro: "Vishwavidyalaya Metro Station & GTB Nagar Metro (Yellow Line)",
    metroLine: "Delhi Metro Yellow Line",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "Delhi Metro Yellow Line Route",
    colleges: ["St. Stephen's College", "Hindu College", "SRCC", "Hansraj College", "Faculty of Law (DU)", "Ramjas College"],
    offices: ["Hudson Lane Commercial Complex", "Civil Lines Secretariat", "Delhi High Court (Direct Yellow Line)"],
    rentRange: { single: "₹10,000 – ₹20,000", double: "₹6,500 – ₹12,000", triple: "₹5,000 – ₹8,000" },
    highlights: ["India's premier college student destination", "Vibrant student culture in Hudson Lane & Kamla Nagar", "Air-conditioned study lounges, Wi-Fi & hygienic mess"],
  },
  "mukherjee-nagar": {
    nearestMetro: "GTB Nagar Metro Station (Yellow Line) & Vishwavidyalaya Metro",
    metroLine: "Delhi Metro Yellow Line",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "Delhi Metro Transit Portal",
    colleges: ["Drishti IAS", "Vision IAS", "Vajiram & Ravi North Wing", "Hindu College (DU North Campus)"],
    offices: ["Commercial complex Batra Cinema", "Hudson Lane Hubs", "Civil Lines Administrative Offices"],
    rentRange: { single: "₹8,000 – ₹15,000", double: "₹5,000 – ₹9,000", triple: "₹3,800 – ₹6,000" },
    highlights: ["UPSC & Government exams coaching capital", "24/7 quiet air-conditioned study libraries", "Zero brokerage verified PG rooms with nutritious mess"],
  },
  "laxmi-nagar": {
    nearestMetro: "Laxmi Nagar Metro Station (Blue Line) & Nirman Vihar Metro",
    metroLine: "Delhi Metro Blue Line",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "Delhi Metro Blue Line Guide",
    colleges: ["ICAI Bhawan (Chartered Accountants Hub)", "Amity University (East Campus)", "Vivekananda College"],
    offices: ["Scope Tower District Centre", "Preet Vihar Corporate Offices", "ITO Institutional Area (3 Metro stops)"],
    rentRange: { single: "₹6,500 – ₹11,500", double: "₹4,000 – ₹7,200", triple: "₹3,200 – ₹5,000" },
    highlights: ["CA & CS Coaching epicentre of India", "Budget-friendly street food & dining on every corner", "Direct Blue Line metro connectivity to Noida Sector 62 & CP"],
  },
  "karol-bagh": {
    nearestMetro: "Karol Bagh Metro Station (Blue Line) & Rajendra Place Metro",
    metroLine: "Delhi Metro Blue Line",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "Delhi Metro Blue Line Schedule",
    colleges: ["Vajiram & Ravi", "Sri Ram IAS", "Tibbia Ayurvedic College", "Pusa Institute"],
    offices: ["Rajendra Place Financial District", "Jhandewalan Corporate Towers", "Connaught Place (10 mins)"],
    rentRange: { single: "₹9,500 – ₹17,000", double: "₹6,200 – ₹10,500", triple: "₹4,500 – ₹7,000" },
    highlights: ["Premier Civil Services coaching ecosystem", "Walking access to Blue Line metro & Rajendra Place", "Dedicated female security wardens and biometric entry"],
  },
  "rajendra-nagar": {
    nearestMetro: "Rajendra Place Metro Station & Karol Bagh Metro (Blue Line)",
    metroLine: "Delhi Metro Blue Line",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "Delhi Metro Transit Information",
    colleges: ["Next IAS", "Forum IAS", "Vision IAS Main Campus", "Khalsa College (Evening)"],
    offices: ["Rajendra Place Commercial Towers", "Pusa Road Corporate Hub", "Central Secretariat"],
    rentRange: { single: "₹10,500 – ₹19,000", double: "₹6,800 – ₹11,500", triple: "₹5,000 – ₹7,500" },
    highlights: ["Old Rajendra Nagar (ORN) - Heart of Civil Services aspirants", "Study cafes with 100 Mbps Wi-Fi & quiet reading halls", "Hygienic home-cooked North & South Indian meals"],
  },
  "satya-niketan": {
    nearestMetro: "Durgabai Deshmukh South Campus Metro Station (Pink Line)",
    metroLine: "Delhi Metro Pink Line",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "Delhi Metro Pink Line Route Guide",
    colleges: ["Sri Venkateswara College (Venky)", "ARSD College", "Motilal Nehru College", "Ram Lal Anand College"],
    offices: ["Bhikaji Cama Place", "Chanakyapuri Diplomatic Enclave", "Dhaula Kuan Central Hub"],
    rentRange: { single: "₹8,500 – ₹15,500", double: "₹5,500 – ₹9,500", triple: "₹4,200 – ₹6,500" },
    highlights: ["Directly opposite DU South Campus gates", "Vibrant student cafe culture and green parks", "Gated security, biometric access & modern furnishings"],
  },
  "saket": {
    nearestMetro: "Saket Metro Station & Malviya Nagar Metro (Yellow Line)",
    metroLine: "Delhi Metro Yellow Line",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "Delhi Metro Yellow Line Guide",
    colleges: ["Shaheed Bhagat Singh College", "College of Vocational Studies (CVS)", "Sri Aurobindo College"],
    offices: ["Saket District Centre", "Select Citywalk Corporate Wings", "Max Super Speciality Hospital Hub"],
    rentRange: { single: "₹10,000 – ₹18,000", double: "₹6,500 – ₹11,000", triple: "₹5,000 – ₹7,500" },
    highlights: ["Upscale South Delhi living environment", "Minutes from Select Citywalk & DLF Avenue Malls", "High-speed Wi-Fi, laundry service & zero brokerage"],
  },

  // ─── GURGAON / GURUGRAM (CORPORATE TECH CORRIDOR) ──────────────────
  "dlf-phase-3": {
    nearestMetro: "Moulsari Avenue Rapid Metro & Cyber City Metro Station",
    metroLine: "Gurgaon Rapid Metro & DMRC Yellow Line",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "Rapid Metro Gurugram Guide",
    colleges: ["The NorthCap University", "IILM University", "Apeejay Stya University"],
    offices: ["DLF Cyber City", "Cyber Green", "Infinity Towers", "Google India", "Deloitte", "KPMG"],
    rentRange: { single: "₹11,000 – ₹20,000", double: "₹7,000 – ₹12,000", triple: "₹5,200 – ₹8,000" },
    highlights: ["Walking distance to DLF Cyber Hub & Infinity Towers", "Doorstep Rapid Metro connectivity", "Fully furnished executive rooms with daily housekeeping & power backup"],
  },
  "dlf-phase-2": {
    nearestMetro: "Sikanderpur Metro Station (Yellow Line & Rapid Metro Interchange)",
    metroLine: "Delhi Metro Yellow Line & Rapid Metro",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "DMRC & Rapid Metro Interchange Guide",
    colleges: ["Management Development Institute (MDI Gurgaon)", "Amity Gurgaon Hub"],
    offices: ["Cyber Hub Corporate Hub", "Standard Chartered Building", "Golf Course Road MNCs"],
    rentRange: { single: "₹12,000 – ₹22,000", double: "₹7,500 – ₹13,000", triple: "₹5,500 – ₹8,500" },
    highlights: ["Sikanderpur major transit interchange to Central Delhi", "Luxury co-living spaces with gym & recreation lounges", "Safe gated society with 24/7 security guards"],
  },
  "sector-14": {
    nearestMetro: "MG Road Metro Station (Yellow Line) & IFFCO Chowk Metro",
    metroLine: "Delhi Metro Yellow Line",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "Delhi Metro Yellow Line Route Planner",
    colleges: ["Government College for Girls", "Dronacharya Government College"],
    offices: ["Old Delhi-Gurgaon Road Commercial Belt", "Maruti Suzuki Plant", "Signature Towers"],
    rentRange: { single: "₹7,500 – ₹13,500", double: "₹4,800 – ₹8,500", triple: "₹3,500 – ₹5,500" },
    highlights: ["Established residential market with lush parks", "Proximity to famous HUDA Market Sector 14 dining", "Pocket-friendly shared accommodation with homely food"],
  },
  "sector-21": {
    nearestMetro: "IndusInd Bank Cyber City Metro & Moulsari Avenue",
    metroLine: "Rapid Metro Gurugram",
    transitUrl: "https://www.delhimetrorail.com/",
    transitName: "Gurugram Rapid Metro Portal",
    colleges: ["The NorthCap University (Sector 23A)", "Ansal University nearby"],
    offices: ["Udyog Vihar Phase 1 to 5", "TCS Cyber Park", "Concentrix", "Maruti Udyog"],
    rentRange: { single: "₹8,000 – ₹14,500", double: "₹5,000 – ₹9,000", triple: "₹3,800 – ₹6,000" },
    highlights: ["Bordering Udyog Vihar massive corporate belt", "Easy commute to Delhi Kapashera border", "Zero brokerage direct landlord contacts on PGSathi"],
  },

  // ─── KOTA (PREMIER COACHING CITY) ──────────────────────────────────
  "talwandi": {
    nearestMetro: "Kota Junction Railway Station (15 mins via Cab/Auto)",
    transitUrl: "https://indiarailinfo.com/departures/kota-junction-kta/415",
    transitName: "Kota Junction (KTA) Rail Guide",
    colleges: ["Allen Career Institute (Satyarth & Samarth Campus)", "Resonance HQ", "Career Point"],
    offices: ["Commercial complex City Mall", "Aakash Institute Administrative Wing"],
    rentRange: { single: "₹7,500 – ₹15,000", double: "₹4,800 – ₹8,500", triple: "₹3,500 – ₹5,800" },
    highlights: ["Prime coaching capital of Kota", "Silent study-friendly rooms with AC, study table & pin board", "Nutritious homely 3-time mess included in rent"],
  },
  "kunhari": {
    nearestMetro: "Kota Junction Railway Station (10 mins drive)",
    transitUrl: "https://indiarailinfo.com/departures/kota-junction-kta/415",
    transitName: "Kota Junction (KTA) Rail Information",
    colleges: ["Allen Sangyan & Samyak Campuses", "Motion Education", "Reliable Institute"],
    offices: ["Landmark City Corporate Buildings", "Kunhari Main Road Commercial Hub"],
    rentRange: { single: "₹6,800 – ₹13,500", double: "₹4,200 – ₹7,800", triple: "₹3,200 – ₹5,200" },
    highlights: ["Modern high-rise student hostels in Landmark City", "Biometric security and parent updates", "Dedicated wardens, power backup and in-house mess"],
  },
};

export function getLocalityProfile(localitySlug: string, localityName: string, cityName: string): LocalityProfile {
  const custom = LOCALITY_PROFILES[localitySlug.toLowerCase()] || {};

  const isDelhi = cityName.toLowerCase().includes("delhi");
  const isNoida = cityName.toLowerCase().includes("noida");
  const isGurgaon = cityName.toLowerCase().includes("gurgaon");

  let defaultTransitUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${localityName} ${cityName} Metro Station`);
  let defaultTransitName = `${cityName} Public Transit Portal`;

  if (isDelhi) {
    defaultTransitUrl = "https://www.delhimetrorail.com/";
    defaultTransitName = "Delhi Metro Rail Corporation (DMRC)";
  } else if (isNoida) {
    defaultTransitUrl = "https://www.nmrcnoida.com/";
    defaultTransitName = "Noida Metro Rail Corporation (NMRC)";
  } else if (isGurgaon) {
    defaultTransitUrl = "https://www.delhimetrorail.com/";
    defaultTransitName = "Delhi Metro & Rapid Metro Portal";
  }

  return {
    nearestMetro: custom.nearestMetro || `${localityName} Metro / Transit Hub (${cityName})`,
    metroLine: custom.metroLine || `${cityName} Metro Network`,
    transitUrl: custom.transitUrl || defaultTransitUrl,
    transitName: custom.transitName || defaultTransitName,
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

  const intro = `Looking for the best verified ${typeInfo.title.toLowerCase()} in ${localityName}, ${cityName}? PGSathi is India's leading zero-brokerage PG list platform, connecting students and working professionals directly with verified property owners. ${localityName} is one of the most in-demand residential micro-markets in ${cityName}, known for its peaceful living atmosphere, excellent transit connectivity, and abundant dining avenues. Whether you are a college student attending lectures or an IT professional commuting to commercial tech hubs, living in a verified PG in ${localityName} gives you modern amenities and pocket-friendly rentals without paying brokerage.`;

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
