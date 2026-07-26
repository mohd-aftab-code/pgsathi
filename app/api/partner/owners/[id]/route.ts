/**
 * app/api/partner/owners/[id]/route.ts
 * POST { action: "reset_password" } — issue a fresh password for one of the
 * partner's own owners.
 *
 * The password shown at creation is never stored in readable form, so a partner
 * who loses it has no way to look it up. This is the recovery path — and it is
 * scoped by `partnerId` taken from the session, so a partner can only ever reset
 * an owner they actually brought in.
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { generateOwnerPassword } from "@/lib/owner-credentials";
import { requirePartnerApi, logPartnerActivity } from "@/lib/partner-auth";

export const runtime = "nodejs";


export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePartnerApi();
  if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ownerId = parseInt(id);
  if (Number.isNaN(ownerId)) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  if (body.action !== "reset_password") {
    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  }

  // partnerId inside the query, not checked after — a cross-partner reset is then
  // structurally impossible rather than merely guarded against.
  const owner = await db.user.findFirst({
    where: { id: ownerId, partnerId: ctx.partnerId, role: "OWNER" },
    select: { id: true, name: true, phone: true },
  });
  if (!owner) return NextResponse.json({ success: false, message: "Owner nahi mila" }, { status: 404 });

  const password = generateOwnerPassword();
  await db.user.update({ where: { id: owner.id }, data: { passwordHash: await bcrypt.hash(password, 10) } });

  await logPartnerActivity(ctx.partnerId, "owner.password_reset", { entity: "User", entityId: owner.id });

  return NextResponse.json({
    success: true,
    message: "Naya password ban gaya",
    data: { id: owner.id, name: owner.name, phone: owner.phone, password },
  });
}
