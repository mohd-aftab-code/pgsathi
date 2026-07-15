/**
 * app/api/manage/leads/[id]/route.ts
 * PATCH — Mark a lead as read
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext } from "@/lib/manage-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await getManageContext();
    if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const lead = await db.lead.findFirst({
      where: { id: parseInt(id), listing: { ownerId: ctx.userId } },
    });

    if (!lead) return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 });

    await db.lead.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, message: "Lead marked as read" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
