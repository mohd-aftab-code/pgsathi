import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "OWNER" && session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const ownerId = parseInt(session.user.id!);

    // Fetch complaints
    const complaints = await db.pgComplaint.findMany({
      where: { ownerId },
      include: {
        listing: { select: { title: true } },
        tenant: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: complaints });
  } catch (error: any) {
    console.error("Manager fetch complaints error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch complaints" }, { status: 500 });
  }
}
