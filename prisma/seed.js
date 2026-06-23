const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const cities = [
  {
    name: "Jaipur",
    slug: "jaipur",
    state: "Rajasthan",
    priority: 1,
    isActive: true,
    localities: [
      { name: "Malviya Nagar", slug: "malviya-nagar" },
      { name: "Vaishali Nagar", slug: "vaishali-nagar" },
      { name: "Mansarovar", slug: "mansarovar" },
      { name: "C-Scheme", slug: "c-scheme" },
      { name: "Tonk Road", slug: "tonk-road" },
      { name: "Bapu Nagar", slug: "bapu-nagar" },
      { name: "Sodala", slug: "sodala" },
      { name: "Jagatpura", slug: "jagatpura" },
      { name: "Sanganer", slug: "sanganer" },
      { name: "Sitapura", slug: "sitapura" },
      { name: "Pratap Nagar", slug: "pratap-nagar" },
      { name: "Shyam Nagar", slug: "shyam-nagar" },
    ]
  },
  {
    name: "Delhi",
    slug: "delhi",
    state: "Delhi",
    priority: 2,
    isActive: true,
    localities: [
      { name: "Laxmi Nagar", slug: "laxmi-nagar" },
      { name: "Dwarka", slug: "dwarka" },
      { name: "Rohini", slug: "rohini" },
      { name: "Janakpuri", slug: "janakpuri" },
      { name: "Saket", slug: "saket" },
      { name: "Pitampura", slug: "pitampura" },
      { name: "Preet Vihar", slug: "preet-vihar" },
      { name: "Shahdara", slug: "shahdara" },
    ]
  },
  {
    name: "Mumbai",
    slug: "mumbai",
    state: "Maharashtra",
    priority: 3,
    isActive: true,
    localities: [
      { name: "Andheri", slug: "andheri" },
      { name: "Bandra", slug: "bandra" },
      { name: "Dadar", slug: "dadar" },
      { name: "Thane", slug: "thane" },
      { name: "Powai", slug: "powai" },
      { name: "Malad", slug: "malad" },
      { name: "Borivali", slug: "borivali" },
      { name: "Goregaon", slug: "goregaon" },
    ]
  },
  {
    name: "Bangalore",
    slug: "bangalore",
    state: "Karnataka",
    priority: 4,
    isActive: true,
    localities: [
      { name: "Koramangala", slug: "koramangala" },
      { name: "Indiranagar", slug: "indiranagar" },
      { name: "Whitefield", slug: "whitefield" },
      { name: "HSR Layout", slug: "hsr-layout" },
      { name: "Marathahalli", slug: "marathahalli" },
      { name: "Electronic City", slug: "electronic-city" },
      { name: "BTM Layout", slug: "btm-layout" },
      { name: "Jayanagar", slug: "jayanagar" },
    ]
  },
  {
    name: "Pune",
    slug: "pune",
    state: "Maharashtra",
    priority: 5,
    isActive: true,
    localities: [
      { name: "Kothrud", slug: "kothrud" },
      { name: "Baner", slug: "baner" },
      { name: "Hinjewadi", slug: "hinjewadi" },
      { name: "Viman Nagar", slug: "viman-nagar" },
      { name: "Wakad", slug: "wakad" },
      { name: "Pimple Saudagar", slug: "pimple-saudagar" },
    ]
  },
  {
    name: "Hyderabad",
    slug: "hyderabad",
    state: "Telangana",
    priority: 6,
    isActive: true,
    localities: [
      { name: "Gachibowli", slug: "gachibowli" },
      { name: "HITEC City", slug: "hitec-city" },
      { name: "Madhapur", slug: "madhapur" },
      { name: "Kondapur", slug: "kondapur" },
      { name: "Kukatpally", slug: "kukatpally" },
      { name: "Begumpet", slug: "begumpet" },
    ]
  },
  {
    name: "Chennai",
    slug: "chennai",
    state: "Tamil Nadu",
    priority: 7,
    isActive: true,
    localities: [
      { name: "Anna Nagar", slug: "anna-nagar" },
      { name: "Velachery", slug: "velachery" },
      { name: "T. Nagar", slug: "t-nagar" },
      { name: "Porur", slug: "porur" },
      { name: "Adyar", slug: "adyar" },
    ]
  },
  {
    name: "Kolkata",
    slug: "kolkata",
    state: "West Bengal",
    priority: 8,
    isActive: true,
    localities: [
      { name: "Salt Lake", slug: "salt-lake" },
      { name: "Park Street", slug: "park-street" },
      { name: "Howrah", slug: "howrah" },
      { name: "New Town", slug: "new-town" },
      { name: "Jadavpur", slug: "jadavpur" },
    ]
  },
  {
    name: "Noida",
    slug: "noida",
    state: "Uttar Pradesh",
    priority: 9,
    isActive: true,
    localities: [
      { name: "Sector 18", slug: "sector-18" },
      { name: "Sector 62", slug: "sector-62" },
      { name: "Sector 63", slug: "sector-63" },
      { name: "Sector 137", slug: "sector-137" },
      { name: "Greater Noida", slug: "greater-noida" },
    ]
  },
  {
    name: "Gurgaon",
    slug: "gurgaon",
    state: "Haryana",
    priority: 10,
    isActive: true,
    localities: [
      { name: "DLF Phase 1", slug: "dlf-phase-1" },
      { name: "DLF Phase 2", slug: "dlf-phase-2" },
      { name: "Sohna Road", slug: "sohna-road" },
      { name: "Golf Course Road", slug: "golf-course-road" },
      { name: "MG Road", slug: "mg-road" },
    ]
  },
];

async function seed() {
  console.log('🌱 Seeding cities and localities...\n');

  for (const city of cities) {
    const { localities, ...cityData } = city;
    
    // Create city
    const createdCity = await db.city.create({
      data: cityData,
    });
    console.log(`✅ Created city: ${createdCity.name}`);

    // Create localities for this city
    for (const locality of localities) {
      await db.locality.create({
        data: {
          cityId: createdCity.id,
          name: locality.name,
          slug: locality.slug,
          isActive: true,
        },
      });
    }
    console.log(`   └── Added ${localities.length} localities`);
  }

  const totalCities = await db.city.count();
  const totalLocalities = await db.locality.count();
  console.log(`\n🎉 Done! Total: ${totalCities} cities, ${totalLocalities} localities`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
