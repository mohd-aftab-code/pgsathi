import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import slugify from "slugify";

// POST /api/admin/bulk-import
// Import PG listings from parsed Google Maps data
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Admin only" }, { status: 403 });
    }

    const { listings } = await req.json();
    if (!Array.isArray(listings) || listings.length === 0) {
      return NextResponse.json({ success: false, message: "No listings provided" }, { status: 400 });
    }

    const adminId = parseInt(session.user.id!);
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const pg of listings) {
      try {
        // Map category to genderAllowed
        const cat = (pg.category || "").toLowerCase();
        let genderAllowed: "BOYS" | "GIRLS" | "COED" = "COED";
        if (cat.includes("boy") || cat.includes("men")) genderAllowed = "BOYS";
        else if (cat.includes("girl") || cat.includes("women") || cat.includes("woman")) genderAllowed = "GIRLS";

        // Map category to pgType
        let pgType: "SINGLE_ROOM" | "DOUBLE_SHARING" | "TRIPLE_SHARING" | "DORMITORY" | "STUDIO" | "ENTIRE_FLAT" = "SINGLE_ROOM";
        if (cat.includes("dormitory") || cat.includes("hostel")) pgType = "DORMITORY";

        // Find or determine city
        const cityName = (pg.city || "").trim().toLowerCase();
        let city = null;
        if (cityName.includes("noida")) {
          city = await db.city.findFirst({ where: { name: { contains: "Noida" } } });
        } else if (cityName.includes("delhi")) {
          city = await db.city.findFirst({ where: { name: { contains: "Delhi" } } });
        } else if (cityName.includes("gurgaon") || cityName.includes("gurugram") || cityName.includes("gurgram")) {
          city = await db.city.findFirst({ where: { name: { contains: "Gurgaon" } } });
        }

        if (!city) {
          skipped++;
          errors.push(`Skipped: ${pg.name} — city not found (${pg.city})`);
          continue;
        }

        if (!pg.name || pg.name.trim() === "") {
          skipped++;
          continue;
        }

        // Generate unique slug
        const baseSlug = slugify(`${pg.name}-${city.name}`, { lower: true, strict: true });
        const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-5)}`;

        // Check duplicate by phone
        if (pg.phone && pg.phone.length >= 10) {
          const existing = await db.listing.findFirst({
            where: { owner: { phone: pg.phone } }
          });
          if (existing) {
            skipped++;
            continue;
          }
        }

        await db.listing.create({
          data: {
            ownerId: adminId, // Assigned to admin, owner can claim later
            cityId: city.id,
            title: pg.name.slice(0, 200),
            slug: uniqueSlug,
            description: `${pg.name} is a ${pg.category || "PG"} located in ${city.name}. Contact us for more details about availability and pricing.`,
            pgType,
            genderAllowed,
            address: (pg.address || `${city.name}`).slice(0, 500),
            pincode: "000000", // Will be updated later
            latitude: pg.latitude ? parseFloat(pg.latitude) : null,
            longitude: pg.longitude ? parseFloat(pg.longitude) : null,
            priceMin: 3000, // Default — will be updated by owner
            priceMax: 8000,
            status: "PENDING", // Admin must manually approve
            isActive: false,   // Hidden until approved
            metaTitle: `${pg.name} - Zero Brokerage PG in ${city.name} | PgSathi`,
            metaDesc: `Looking for a PG in ${city.name}? Check out ${pg.name}. Direct owner contact. Zero Brokerage.`,
          },
        });

        imported++;
      } catch (err: any) {
        errors.push(`Error: ${pg.name} — ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: listings.length,
      errors: errors.slice(0, 20), // Return first 20 errors only
    });
  } catch (error: any) {
    console.error("Bulk Import Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
