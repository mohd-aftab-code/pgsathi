import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "OWNER") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { enabled } = await req.json();
    const ownerId = parseInt(session.user.id);

    await db.listing.updateMany({
      where: { ownerId },
      data: { reviewsEnabled: !!enabled },
    });

    return NextResponse.json({ success: true, data: { enabled: !!enabled } });
  } catch (error: any) {
    console.error("Toggle Reviews Error:", error);
    return NextResponse.json({ success: false, message: "Failed to update reviews setting" }, { status: 500 });
  }
}
