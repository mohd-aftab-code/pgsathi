/**
 * app/api/manage/leads/[id]/route.ts
 * PATCH — update a lead's pipeline state (owner-scoped).
 * Whitelisted fields only (status / followUpAt / notes / isRead) — never spreads the body.
 * An empty PATCH keeps the legacy behaviour of just marking the lead as read.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext } from "@/lib/manage-auth";

const STAGES = ["NEW", "CONTACTED", "VISIT_SCHEDULED", "CONVERTED", "LOST"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);
    const ctx = await getManageContext();
    if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    // Ownership scope — the lead's listing must belong to the caller's owner.
    const lead = await db.lead.findFirst({
      where: { id: leadId, listing: { ownerId: ctx.userId } },
    });
    if (!lead) return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));

    const data: {
      isRead?: boolean;
      status?: (typeof STAGES)[number];
      followUpAt?: Date | null;
      notes?: string | null;
    } = {};

    if (typeof body.status === "string") {
      if (!STAGES.includes(body.status)) {
        return NextResponse.json({ success: false, message: "Invalid stage" }, { status: 400 });
      }
      data.status = body.status;
      data.isRead = true; // touching the pipeline implies the lead has been seen
    }
    if (body.followUpAt !== undefined) {
      data.followUpAt = body.followUpAt ? new Date(body.followUpAt) : null;
    }
    if (typeof body.notes === "string") {
      data.notes = body.notes.slice(0, 1000);
    }
    if (typeof body.isRead === "boolean") {
      data.isRead = body.isRead;
    }

    // Legacy: an empty PATCH (old MarkRead button) just marks the lead read.
    if (Object.keys(data).length === 0) data.isRead = true;

    await db.lead.update({ where: { id: leadId }, data });

    return NextResponse.json({ success: true, message: "Lead updated" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
