import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const citySlug = searchParams.get("city");
    const gender = searchParams.get("gender");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = { isActive: true, status: "ACTIVE" };

    if (citySlug) {
      where.city = { slug: citySlug };
    }
    
    if (gender) {
      where.gender = gender;
    }

    const listings = await db.listing.findMany({
      where,
      take: limit,
      include: {
        city: true,
        locality: true,
        photos: {
          take: 1, // Get primary photo
        },
      },
      orderBy: [
        { isFeatured: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, data: listings });
  } catch (error: any) {
    console.error("Fetch Listings Error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Create listing
    const listing = await db.listing.create({
      data: {
        ownerId: parseInt(session.user.id),
        title: data.title,
        slug: data.slug, // Should generate on frontend or utils
        description: data.description,
        pgType: data.pgType || "SINGLE_ROOM",
        genderAllowed: data.genderAllowed || "BOYS",
        priceMin: data.priceMin || 0,
        priceMax: data.priceMax || 0,
        securityDeposit: data.securityDeposit,
        // Notice period removed because it's not in schema
        
        address: data.address,
        landmark: data.landmark,
        pincode: data.pincode,
        latitude: data.latitude,
        longitude: data.longitude,
        
        cityId: data.cityId,
        localityId: data.localityId,
        
        status: "PENDING", // Admin will publish later
      },
    });

    return NextResponse.json({ success: true, data: listing });
  } catch (error: any) {
    console.error("Create Listing Error:", error);
    return NextResponse.json({ success: false, message: "Failed to create listing" }, { status: 500 });
  }
}
