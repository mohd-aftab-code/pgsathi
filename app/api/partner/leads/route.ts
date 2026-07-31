/**
 * app/api/partner/leads/route.ts
 * GET  — the partner's own pipeline.
 * POST — add a lead.
 *
 * The portal could previously only show a PG that was already registered, so a
 * partner's actual work — the calls, the demos, the follow-ups — lived in their
 * phone. A partner who has a reason to open the portal daily closes more, and
 * a lead that has been sitting in NEGOTIATION for three weeks is something an
 * admin can actually help with.
 *
 * Scoped by `partnerId` from the session, never from the body.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePartnerApi, logPartnerActivity } from "@/lib/partner-auth";

export const STAGES = ["NEW", "CONTACTED", "DEMO", "NEGOTIATION", "WON", "LOST"] as const;

export async function GET(req: NextRequest) {
  const ctx = await requirePartnerApi();
  if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");
  const q = (searchParams.get("q") ?? "").trim();

  const where: any = { partnerId: ctx.partnerId };
  if (stage && STAGES.includes(stage as any)) where.stage = stage;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { pgName: { contains: q, mode: "insensitive" } },
    ];
  }

  const [rows, counts] = await Promise.all([
    db.partnerLead.findMany({
      where,
      orderBy: [{ nextFollowUpAt: "asc" }, { updatedAt: "desc" }],
      take: 200,
    }),
    db.partnerLead.groupBy({
      by: ["stage"],
      where: { partnerId: ctx.partnerId },
      _count: { _all: true },
    }),
  ]);

  const now = new Date();
  return NextResponse.json({
    success: true,
    data: rows.map((l) => ({
      ...l,
      // Surfaced by the API rather than recomputed in three different places
      // in the UI.
      overdue: Boolean(l.nextFollowUpAt && l.nextFollowUpAt < now && !["WON", "LOST"].includes(l.stage)),
    })),
    counts: Object.fromEntries(counts.map((c) => [c.stage, c._count._all])),
  });
}

export async function POST(req: NextRequest) {
  const ctx = await requirePartnerApi();
  if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").replace(/\D/g, "");
  const city = String(body.city ?? "").trim() || null;
  const pgName = String(body.pgName ?? "").trim() || null;
  const notes = String(body.notes ?? "").trim() || null;
  const stage = STAGES.includes(body.stage) ? body.stage : "NEW";
  const nextFollowUpAt = body.nextFollowUpAt ? new Date(body.nextFollowUpAt) : null;

  if (name.length < 2) return NextResponse.json({ success: false, message: "Lead ka naam daalein" }, { status: 400 });
  if (phone.length !== 10) return NextResponse.json({ success: false, message: "10-digit phone number daalein" }, { status: 400 });
  if (nextFollowUpAt && Number.isNaN(nextFollowUpAt.getTime())) {
    return NextResponse.json({ success: false, message: "Follow-up date sahi nahi hai" }, { status: 400 });
  }

  try {
    const lead = await db.partnerLead.create({
      data: { partnerId: ctx.partnerId, name, phone, city, pgName, stage, notes, nextFollowUpAt },
    });
    await logPartnerActivity(ctx.partnerId, "lead.created", { entity: "PartnerLead", entityId: lead.id });
    return NextResponse.json({ success: true, message: `${name} lead me add ho gaye`, data: lead });
  } catch (e: any) {
    // Unique on (partnerId, phone) — the same number twice is a duplicate, not
    // a second opportunity.
    if (e?.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Ye number pehle se aapke leads me hai" },
        { status: 409 },
      );
    }
    throw e;
  }
}
