import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const ownerId = parseInt(session.user.id!);

    // Fetch leads
    const leads = await db.lead.findMany({
      where: { listing: { ownerId } },
      include: { listing: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: leads });
  } catch (error: any) {
    console.error("Owner fetch leads error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch owner leads" }, { status: 500 });
  }
}
