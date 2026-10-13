import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid enquiry ID" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { status, isRead, adminNotes } = body;

    const data: any = {};
    if (status !== undefined) data.status = status;
    if (isRead !== undefined) data.isRead = !!isRead;
    if (adminNotes !== undefined) data.adminNotes = adminNotes;

    const updated = await db.contactEnquiry.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, enquiry: updated });
  } catch (error: any) {
    console.error("[Admin Enquiry PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid enquiry ID" }, { status: 400 });
    }

    await db.contactEnquiry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Enquiry deleted successfully" });
  } catch (error: any) {
    console.error("[Admin Enquiry DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete enquiry" }, { status: 500 });
  }
}
