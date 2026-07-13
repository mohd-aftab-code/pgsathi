import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const [topQueries, topCities] = await Promise.all([
      db.searchAnalytic.groupBy({
        by: ['query'],
        where: { query: { not: null } },
        _count: { query: true },
        orderBy: { _count: { query: 'desc' } },
        take: 10,
      }),
      db.searchAnalytic.groupBy({
        by: ['citySlug'],
        where: { citySlug: { not: null } },
        _count: { citySlug: true },
        orderBy: { _count: { citySlug: 'desc' } },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        topQueries,
        topCities,
      }
    });
  } catch (error) {
    console.error("[HEATMAP_API_ERROR]", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
