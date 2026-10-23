const fs = require('fs');
const path = require('path');

// Load .env
if (!process.env.DATABASE_URL) {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');
  for (const line of envContent.split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const { PrismaClient } = require('@prisma/client');
const slugify = require('slugify');
const db = new PrismaClient();

const CITY_MAP = {
  'gautam-buddha-nagar': 'noida',
  'south-delhi': 'delhi',
  'south-west-delhi': 'delhi',
  'north-24-parganas': 'kolkata',
  'kanchipuram': 'chennai',
  'kvrangareddy': 'hyderabad',
  'allahabad-uttar-pradesh': 'allahabad',
};

// Clean locality name from raw area text
function cleanLocalityName(raw) {
  if (!raw || raw === 'null' || raw === 'undefined') return null;
  let text = raw.trim();

  // Edge cases
  if (/dadabari/i.test(text)) return 'Dadabari';
  if (/alpha/i.test(text) && /greater\s*noida/i.test(text)) return 'Greater Noida';
  if (/chhaprauli/i.test(text) && /167/i.test(text)) return 'Sector 167';

  // If text is a full comma-separated address like "1 Dha 10, Dadabari, Kota, Rajasthan 324009"
  if (text.includes(',')) {
    const parts = text.split(',').map(p => p.trim()).filter(Boolean);
    // Find a part that is not just a house number or city/pincode
    for (const p of parts) {
      if (!/\d{5,6}/.test(p) && !/^(rajasthan|uttar pradesh|delhi|maharashtra|india)$/i.test(p) && !/^\d+\s+[a-z]/i.test(p)) {
        text = p;
        break;
      }
    }
  }

  // Remove redundant city names at start/end, e.g. "Noida Sector 70" -> "Sector 70"
  text = text.replace(/^(noida|delhi|mumbai|pune|jaipur|kolkata)\s+/i, '');
  text = text.replace(/\s+(noida|delhi|mumbai|pune|jaipur|kolkata)$/i, '');
  text = text.replace(/,\s*(noida|delhi|mumbai|pune|jaipur|kolkata|up|u\.p\.|india).*$/i, '');
  text = text.trim();
  if (text.length < 2) return null;
  // Capitalize nicely
  return text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

async function main() {
  const isApply = process.argv.includes('--apply');
  console.log(isApply ? '🚀 APPLYING LOCATION NORMALIZATION...' : '🔍 DRY-RUN PREVIEW (Pass --apply to commit)...');

  const listings = await db.listing.findMany({
    include: {
      city: true,
      locality: true,
    }
  });

  const cityCache = {};
  async function getTargetCity(canonicalSlug) {
    if (cityCache[canonicalSlug]) return cityCache[canonicalSlug];
    const city = await db.city.findFirst({ where: { slug: canonicalSlug, isActive: true } });
    if (city) cityCache[canonicalSlug] = city;
    return city;
  }

  for (const l of listings) {
    const rawCitySlug = l.city?.slug || '';
    const canonicalCitySlug = CITY_MAP[rawCitySlug] || rawCitySlug;
    
    let targetCity = l.city;
    let cityChanged = false;
    if (CITY_MAP[rawCitySlug]) {
      const canonicalCity = await getTargetCity(canonicalCitySlug);
      if (canonicalCity && canonicalCity.id !== l.cityId) {
        targetCity = canonicalCity;
        cityChanged = true;
      }
    }

    let targetLocality = l.locality;
    let localityChanged = false;

    if (!targetLocality && targetCity) {
      const areaName = cleanLocalityName(l.areaLocality) || cleanLocalityName(l.landmark);
      if (areaName) {
        const locSlug = slugify(areaName, { lower: true, strict: true });
        
        // Find existing locality in target city
        let loc = await db.locality.findFirst({
          where: { cityId: targetCity.id, slug: locSlug }
        });

        if (!loc) {
          if (isApply) {
            loc = await db.locality.create({
              data: {
                cityId: targetCity.id,
                name: areaName,
                slug: locSlug,
                isActive: true,
              }
            });
          } else {
            loc = { id: 9999, name: areaName, slug: locSlug }; // preview mock
          }
        }

        if (loc) {
          targetLocality = loc;
          localityChanged = true;
        }
      }
    }

    if (cityChanged || localityChanged) {
      console.log(`[#${l.id}] "${l.title}":`);
      if (cityChanged) {
        console.log(`  City: ${l.city?.name} (${l.city?.slug}) -> ${targetCity.name} (${targetCity.slug})`);
      }
      if (localityChanged) {
        console.log(`  Locality: NULL -> ${targetLocality.name} (${targetLocality.slug})`);
      }

      const newUrl = `/pg/${targetCity.slug}/${targetLocality?.slug || 'none'}/${l.slug}`;
      console.log(`  Old URL: /pg/${l.city?.slug}/all/${l.slug}`);
      console.log(`  New Canonical URL: ${newUrl}\n`);

      if (isApply) {
        await db.listing.update({
          where: { id: l.id },
          data: {
            cityId: targetCity.id,
            ...(targetLocality?.id && targetLocality.id !== 9999 ? { localityId: targetLocality.id } : {}),
          }
        });
      }
    }
  }

  console.log('✅ Done!');
}

main().catch(console.error).finally(() => db.$disconnect());
