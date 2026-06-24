import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// PATCH — Mark lead as read/unread
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const leadId = parseInt(id);
    const ownerId = parseInt(session.user.id!);

    const data = await req.json();

    // Verify this lead belongs to the owner's listing
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: { listing: { select: { ownerId: true } } },
    });

    if (!lead) {
      return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 });
    }

    if (lead.listing.ownerId !== ownerId && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const updated = await db.lead.update({
      where: { id: leadId },
      data: { isRead: data.isRead ?? true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Update Lead Error:", error);
    return NextResponse.json({ success: false, message: "Failed to update lead" }, { status: 500 });
  }
}
