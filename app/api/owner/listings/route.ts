import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Must be Owner or Admin
    if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const ownerId = parseInt(session.user.id!);

    const listings = await db.listing.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      include: {
        city: true,
        locality: true,
        photos: {
          take: 1,
          orderBy: { sortOrder: "asc" }
        },
        _count: {
          select: { leads: true }
        }
      },
    });

    return NextResponse.json({ success: true, data: listings });
  } catch (error: any) {
    console.error("Owner fetch listings error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch owner listings" }, { status: 500 });
  }
}
