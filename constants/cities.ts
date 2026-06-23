export const CITIES = [
  {
    id: 1,
    name: "Delhi",
    slug: "delhi",
    state: "Delhi NCR",
    priority: 1,
    localities: [
      "Mukherjee Nagar", "Rajendra Nagar", "Laxmi Nagar", "South Ex",
      "Karol Bagh", "Satya Niketan", "North Campus", "South Campus",
    ],
  },
  {
    id: 2,
    name: "Noida",
    slug: "noida",
    state: "Uttar Pradesh (NCR)",
    priority: 2,
    localities: [
      "Sector 62", "Sector 15", "Sector 22", "Sector 126",
      "Knowledge Park", "Sector 18", "Sector 44", "Sector 137",
    ],
  },
  {
    id: 3,
    name: "Gurgaon",
    slug: "gurgaon",
    state: "Haryana (NCR)",
    priority: 3,
    localities: [
      "DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "Udyog Vihar",
      "Sector 14", "Sector 44", "Sushant Lok", "Sector 21",
    ],
  },
  {
    id: 4,
    name: "Kota",
    slug: "kota",
    state: "Rajasthan",
    priority: 4,
    localities: [
      "Talwandi", "Vigyan Nagar", "Mahaveer Nagar", "Dadabari",
      "Borkhera", "Kunhari", "Industrial Area", "Rangpur",
    ],
  },
  {
    id: 5,
    name: "Jaipur",
    slug: "jaipur",
    state: "Rajasthan",
    priority: 5,
    localities: [
      "Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme",
      "Jagatpura", "Sitapura", "Sanganer", "Tonk Road",
    ],
  },
  {
    id: 6,
    name: "Pune",
    slug: "pune",
    state: "Maharashtra",
    priority: 6,
    localities: [
      "Kothrud", "Hadapsar", "Baner", "Wakad",
      "Hinjawadi", "Viman Nagar", "Kalyani Nagar", "Shivajinagar",
    ],
  },
  {
    id: 7,
    name: "Indore",
    slug: "indore",
    state: "Madhya Pradesh",
    priority: 7,
    localities: [
      "Vijay Nagar", "Scheme 54", "Palasia", "Bhawarkua",
      "Rau", "Super Corridor", "Rajwada", "LIG Colony",
    ],
  },
  {
    id: 8,
    name: "Bhopal",
    slug: "bhopal",
    state: "Madhya Pradesh",
    priority: 8,
    localities: [
      "Arera Colony", "MP Nagar", "Kolar Road", "Habibganj",
      "Shahpura", "Ayodhya Bypass", "Berasia Road", "Karond",
    ],
  },
  {
    id: 9,
    name: "Lucknow",
    slug: "lucknow",
    state: "Uttar Pradesh",
    priority: 9,
    localities: [
      "Hazratganj", "Gomti Nagar", "Aliganj", "Indira Nagar",
      "Rajajipuram", "Alambagh", "Chinhat", "Faizabad Road",
    ],
  },
  {
    id: 10,
    name: "Patna",
    slug: "patna",
    state: "Bihar",
    priority: 10,
    localities: [
      "Boring Road", "Bailey Road", "Kankarbagh", "Rajendra Nagar",
      "Ashok Raj Path", "Anisabad", "Danapur", "Khagaul",
    ],
  },
];

export const CITY_SLUGS = CITIES.map((c) => c.slug);

export function getCityBySlug(slug: string) {
  return CITIES.find((c) => c.slug === slug);
}
