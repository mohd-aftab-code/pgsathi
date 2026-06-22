import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeLocalities = searchParams.get("localities") === "true";

    const cities = await db.city.findMany({
      orderBy: { priority: "asc" },
      include: includeLocalities ? {
        localities: {
          orderBy: { name: "asc" }
        }
      } : undefined,
    });

    return NextResponse.json({ success: true, data: cities });
  } catch (error: any) {
    console.error("Fetch Cities Error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch cities" }, { status: 500 });
  }
}
