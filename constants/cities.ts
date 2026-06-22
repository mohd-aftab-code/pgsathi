export const CITIES = [
  {
    id: 1,
    name: "Kota",
    slug: "kota",
    state: "Rajasthan",
    priority: 1,
    localities: [
      "Talwandi", "Vigyan Nagar", "Mahaveer Nagar", "Dadabari",
      "Borkhera", "Kunhari", "Industrial Area", "Rangpur",
    ],
  },
  {
    id: 2,
    name: "Jaipur",
    slug: "jaipur",
    state: "Rajasthan",
    priority: 2,
    localities: [
      "Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme",
      "Jagatpura", "Sitapura", "Sanganer", "Tonk Road",
    ],
  },
  {
    id: 3,
    name: "Pune",
    slug: "pune",
    state: "Maharashtra",
    priority: 3,
    localities: [
      "Kothrud", "Hadapsar", "Baner", "Wakad",
      "Hinjawadi", "Viman Nagar", "Kalyani Nagar", "Shivajinagar",
    ],
  },
  {
    id: 4,
    name: "Indore",
    slug: "indore",
    state: "Madhya Pradesh",
    priority: 4,
    localities: [
      "Vijay Nagar", "Scheme 54", "Palasia", "Bhawarkua",
      "Rau", "Super Corridor", "Rajwada", "LIG Colony",
    ],
  },
  {
    id: 5,
    name: "Bhopal",
    slug: "bhopal",
    state: "Madhya Pradesh",
    priority: 5,
    localities: [
      "Arera Colony", "MP Nagar", "Kolar Road", "Habibganj",
      "Shahpura", "Ayodhya Bypass", "Berasia Road", "Karond",
    ],
  },
  {
    id: 6,
    name: "Lucknow",
    slug: "lucknow",
    state: "Uttar Pradesh",
    priority: 6,
    localities: [
      "Hazratganj", "Gomti Nagar", "Aliganj", "Indira Nagar",
      "Rajajipuram", "Alambagh", "Chinhat", "Faizabad Road",
    ],
  },
  {
    id: 7,
    name: "Patna",
    slug: "patna",
    state: "Bihar",
    priority: 7,
    localities: [
      "Boring Road", "Bailey Road", "Kankarbagh", "Rajendra Nagar",
      "Ashok Raj Path", "Anisabad", "Danapur", "Khagaul",
    ],
  },
  {
    id: 8,
    name: "Bhubaneswar",
    slug: "bhubaneswar",
    state: "Odisha",
    priority: 8,
    localities: [
      "Saheed Nagar", "Nayapalli", "Patia", "Chandrasekharpur",
      "Kalinga Nagar", "Damana", "Mancheswar", "Rasulgarh",
    ],
  },
];

export const CITY_SLUGS = CITIES.map((c) => c.slug);

export function getCityBySlug(slug: string) {
  return CITIES.find((c) => c.slug === slug);
}
