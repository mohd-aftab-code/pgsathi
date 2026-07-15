import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const citySlug = searchParams.get("city") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Build the where clause
    const whereClause: any = {
      isActive: true,
      name: { contains: query, mode: "insensitive" },
    };

    if (citySlug && citySlug !== "all") {
      whereClause.city = { slug: citySlug };
    }

    const localities = await db.locality.findMany({
      where: whereClause,
      include: {
        city: {
          select: { name: true, slug: true },
        },
      },
      take: 10,
    });

    const data = localities.map((loc) => ({
      id: loc.id,
      name: loc.name,
      slug: loc.slug,
      cityName: loc.city.name,
      citySlug: loc.city.slug,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Locality search error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to search localities" },
      { status: 500 }
    );
  }
}
