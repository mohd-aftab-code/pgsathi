/**
 * app/api/partner/leads/[id]/route.ts
 * PATCH  — move a lead along, or record why it was lost.
 * DELETE — remove a lead.
 *
 * Every query filters on the session's `partnerId` as well as the id, so a
 * partner cannot reach another partner's pipeline by guessing a number.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePartnerApi, logPartnerActivity } from "@/lib/partner-auth";
import { STAGES } from "../route";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePartnerApi();
  if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const leadId = parseInt(id);
  if (Number.isNaN(leadId)) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

  const existing = await db.partnerLead.findFirst({
    where: { id: leadId, partnerId: ctx.partnerId },
    select: { id: true, stage: true, name: true },
  });
  if (!existing) return NextResponse.json({ success: false, message: "Lead nahi mili" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data: any = {};

  if (body.stage !== undefined) {
    if (!STAGES.includes(body.stage)) {
      return NextResponse.json({ success: false, message: "Invalid stage" }, { status: 400 });
    }
    data.stage = body.stage;
    // A closed lead has nothing left to chase.
    if (body.stage === "WON" || body.stage === "LOST") {
      data.nextFollowUpAt = null;
      if (body.stage === "WON") data.convertedAt = new Date();
    }
  }
  if (body.notes !== undefined) data.notes = String(body.notes).trim() || null;
  if (body.city !== undefined) data.city = String(body.city).trim() || null;
  if (body.pgName !== undefined) data.pgName = String(body.pgName).trim() || null;
  if (body.lostReason !== undefined) data.lostReason = String(body.lostReason).trim().slice(0, 200) || null;
  if (body.nextFollowUpAt !== undefined) {
    if (body.nextFollowUpAt === null || body.nextFollowUpAt === "") {
      data.nextFollowUpAt = null;
    } else {
      const d = new Date(body.nextFollowUpAt);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ success: false, message: "Follow-up date sahi nahi hai" }, { status: 400 });
      }
      data.nextFollowUpAt = d;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ success: false, message: "Kuch update karne ko nahi hai" }, { status: 400 });
  }

  const lead = await db.partnerLead.update({ where: { id: leadId }, data });
  await logPartnerActivity(ctx.partnerId, `lead.${data.stage ? `stage.${String(data.stage).toLowerCase()}` : "updated"}`, {
    entity: "PartnerLead",
    entityId: leadId,
  });

  return NextResponse.json({ success: true, message: "Lead update ho gayi", data: lead });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePartnerApi();
  if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const leadId = parseInt(id);
  if (Number.isNaN(leadId)) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

  // deleteMany, not delete: it takes the partner scope in the same statement,
  // so there is no window where the wrong row could be removed.
  const res = await db.partnerLead.deleteMany({ where: { id: leadId, partnerId: ctx.partnerId } });
  if (res.count === 0) return NextResponse.json({ success: false, message: "Lead nahi mili" }, { status: 404 });

  await logPartnerActivity(ctx.partnerId, "lead.deleted", { entity: "PartnerLead", entityId: leadId });
  return NextResponse.json({ success: true, message: "Lead delete ho gayi" });
}
