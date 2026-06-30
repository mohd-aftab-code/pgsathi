export const CITIES = [
  {
    id: 1,
    name: "Delhi",
    slug: "delhi",
    state: "Delhi NCR",
    priority: 1,
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80",
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
  {
    id: 11,
    name: "Mumbai",
    slug: "mumbai",
    state: "Maharashtra",
    priority: 11,
    localities: [
      "Andheri", "Bandra", "Powai", "Navi Mumbai",
      "Thane", "Goregaon", "Malad", "Borivali",
    ],
  },
  {
    id: 12,
    name: "Bangalore",
    slug: "bangalore",
    state: "Karnataka",
    priority: 12,
    localities: [
      "Koramangala", "Indiranagar", "HSR Layout", "Whitefield",
      "Electronic City", "BTM Layout", "Marathahalli", "Jayanagar",
    ],
  },
  {
    id: 13,
    name: "Hyderabad",
    slug: "hyderabad",
    state: "Telangana",
    priority: 13,
    localities: [
      "Gachibowli", "Madhapur", "Kukatpally", "Banjara Hills",
      "Jubilee Hills", "Kondapur", "Ameerpet", "Hitec City",
    ],
  },
  {
    id: 14,
    name: "Chennai",
    slug: "chennai",
    state: "Tamil Nadu",
    priority: 14,
    localities: [
      "OMR", "Velachery", "Adyar", "Anna Nagar",
      "T Nagar", "Guindy", "Tambaram", "Thiruvanmiyur",
    ],
  },
  {
    id: 15,
    name: "Kolkata",
    slug: "kolkata",
    state: "West Bengal",
    priority: 15,
    localities: [
      "Salt Lake", "New Town", "Ballygunge", "Jadavpur",
      "Park Street", "Dum Dum", "Rajarhat", "Behala",
    ],
  },
  {
    id: 16,
    name: "Ahmedabad",
    slug: "ahmedabad",
    state: "Gujarat",
    priority: 16,
    localities: [
      "Navrangpura", "Satellite", "SG Highway", "Bopal",
      "Vastrapur", "Prahlad Nagar", "Maninagar", "Thaltej",
    ],
  }
];
export const CITY_SLUGS = CITIES.map((c) => c.slug);

export function getCityBySlug(slug: string) {
  return CITIES.find((c) => c.slug === slug);
}
