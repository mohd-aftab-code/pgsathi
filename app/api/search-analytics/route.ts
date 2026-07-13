import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { query, citySlug } = await req.json();

    if (!query && !citySlug) {
      return NextResponse.json({ success: false, message: "Missing data" }, { status: 400 });
    }

    // Fire and forget (don't await if we want it to be super fast, but Vercel needs await)
    await db.searchAnalytic.create({
      data: {
        query: query ? query.substring(0, 250) : null,
        citySlug: citySlug || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SEARCH_ANALYTIC_ERROR]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
