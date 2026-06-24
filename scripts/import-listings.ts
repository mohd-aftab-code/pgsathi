/**
 * PgSathi — Bulk Import Script
 * JSON se seedha database mein listings import karo
 * Run: npx tsx scripts/import-listings.ts
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const db = new PrismaClient();

// ─── CONFIG ──────────────────────────────────────────────────
const JSON_FILE = path.join(process.cwd(), "pg_cleaned_import.json");
const ADMIN_EMAIL = "aftab@pgsathi.in"; // Admin user jo owner banega

// Default price ranges by city
const DEFAULT_PRICES: Record<string, { min: number; max: number }> = {
  noida:   { min: 4000, max: 9000 },
  delhi:   { min: 5000, max: 12000 },
  gurgaon: { min: 6000, max: 15000 },
};

function makeSlug(title: string, cityKey: string, index: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "");
  return `${base}-${cityKey}-${index}`;
}

async function main() {
  console.log("🚀 PgSathi Bulk Import Starting...\n");

  // 1. Load JSON
  if (!fs.existsSync(JSON_FILE)) {
    console.error("❌ JSON file not found:", JSON_FILE);
    process.exit(1);
  }
  const raw = fs.readFileSync(JSON_FILE, "utf-8").replace(/^\uFEFF/, ""); // strip BOM
  const listings: any[] = JSON.parse(raw);
  console.log(`📦 Total records in JSON: ${listings.length}`);

  // 2. Admin user — DB se confirmed id:4
  const adminUser = { id: 4, email: "admin@pgsathi.in" };
  console.log(`✅ Admin owner: ${adminUser.email} (id: ${adminUser.id})`);

  // 3. City map — DB se confirmed IDs
  const cityMap: Record<string, number> = {
    noida:   9,   // Noida
    delhi:   2,   // Delhi
    gurgaon: 10,  // Gurgaon
  };

  console.log("🏙️  City map:", JSON.stringify(cityMap));

  // 4. Import loop
  let imported = 0;
  let skipped = 0;
  let duplicates = 0;

  for (let i = 0; i < listings.length; i++) {
    const pg = listings[i];

    const cityId = cityMap[pg.cityKey];
    if (!cityId) {
      console.warn(`⚠️  Skipping (no city): ${pg.title}`);
      skipped++;
      continue;
    }

    const slug = makeSlug(pg.title, pg.cityKey, i + 1);
    const prices = DEFAULT_PRICES[pg.cityKey] || { min: 4000, max: 8000 };

    // Build description
    const gender = pg.genderAllowed === "BOYS" ? "Boys" : pg.genderAllowed === "GIRLS" ? "Girls" : "Boys & Girls";
    const desc = `${pg.title} is a ${pg.category} in ${pg.cityKey.charAt(0).toUpperCase() + pg.cityKey.slice(1)}${pg.sector ? ", " + pg.sector : ""}. Available for ${gender}. Contact for latest availability and pricing. Source: Google Maps. Rating: ${pg.rating}/5.`;

    // Meta fields
    const metaTitle = `${pg.title.slice(0, 60)} - PG in ${pg.cityKey.charAt(0).toUpperCase() + pg.cityKey.slice(1)} | PgSathi`;
    const metaDesc  = `Find ${pg.title}${pg.sector ? " in " + pg.sector : ""}, ${pg.cityKey}. Zero brokerage PG listing. Book a visit directly with the owner on PgSathi.`;

    try {
      await db.listing.create({
        data: {
          ownerId:       adminUser.id,
          cityId,
          title:         pg.title.slice(0, 200),
          slug,
          description:   desc,
          pgType:        pg.pgType as any,
          genderAllowed: pg.genderAllowed as any,
          address:       (pg.address || `${pg.sector || ""}, ${pg.cityKey}`).slice(0, 500) || "Address not available",
          pincode:       pg.pincode || "000000",
          latitude:      pg.latitude  ? pg.latitude  : null,
          longitude:     pg.longitude ? pg.longitude : null,
          priceMin:      prices.min,
          priceMax:      prices.max,
          avgRating:     pg.rating > 0 ? pg.rating : 0,
          status:        "PENDING",  // Admin manually approve karega
          isActive:      false,      // Jab tak approve na ho, hide rahega
          isVerified:    false,
          isFeatured:    false,
          metaTitle:     metaTitle.slice(0, 160),
          metaDesc:      metaDesc.slice(0, 320),
        },
      });
      imported++;

      if (imported % 50 === 0) {
        console.log(`  ✅ ${imported} imported...`);
      }
    } catch (err: any) {
      if (err.code === "P2002") {
        // Unique constraint (slug) — retry with different slug
        try {
          await db.listing.create({
            data: {
              ownerId:       adminUser.id,
              cityId,
              title:         pg.title.slice(0, 200),
              slug:          slug + "-" + Math.random().toString(36).slice(2, 6),
              description:   desc,
              pgType:        pg.pgType as any,
              genderAllowed: pg.genderAllowed as any,
              address:       (pg.address || `${pg.sector || ""}, ${pg.cityKey}`).slice(0, 500) || "Address not available",
              pincode:       pg.pincode || "000000",
              latitude:      pg.latitude  ? pg.latitude  : null,
              longitude:     pg.longitude ? pg.longitude : null,
              priceMin:      prices.min,
              priceMax:      prices.max,
              avgRating:     pg.rating > 0 ? pg.rating : 0,
              status:        "PENDING",
              isActive:      false,
              isVerified:    false,
              isFeatured:    false,
              metaTitle:     metaTitle.slice(0, 160),
              metaDesc:      metaDesc.slice(0, 320),
            },
          });
          imported++;
          duplicates++;
        } catch {
          skipped++;
        }
      } else {
        console.error(`  ❌ Error (row ${i + 1}): ${err.message}`);
        skipped++;
      }
    }
  }

  // 5. Final report
  console.log("\n" + "=".repeat(50));
  console.log("🎉 IMPORT COMPLETE!");
  console.log("=".repeat(50));
  console.log(`✅ Imported  : ${imported}`);
  console.log(`⚠️  Skipped   : ${skipped}`);
  console.log(`🔁 Dup-fixed : ${duplicates}`);
  console.log(`📦 Total     : ${listings.length}`);
  console.log("=".repeat(50));
  console.log("\n📋 Next Steps:");
  console.log("  1. Admin dashboard pe jao: /dashboard/admin/listings");
  console.log("  2. PENDING listings bulk approve karo");
  console.log("  3. isActive = true karo taaki public dikhe");

  await db.$disconnect();
}

main().catch((e) => {
  console.error("❌ Fatal Error:", e);
  process.exit(1);
});
