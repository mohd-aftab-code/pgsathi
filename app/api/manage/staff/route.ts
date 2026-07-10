/**
 * app/api/manage/staff/route.ts
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext, logPgAudit } from "@/lib/manage-auth";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId") ? parseInt(searchParams.get("listingId")!) : undefined;
    const active    = searchParams.get("active") !== "false";

    const where: any = { ownerId: ctx.userId, active };
    if (listingId) where.listingId = listingId;

    const staff = await db.pgStaff.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        listing: { select: { id: true, title: true } },
        payouts: { orderBy: { forMonth: "desc" }, take: 3 },
      },
    });

    const teamMembers = await db.pgTeamMember.findMany({
      where: { ownerId: ctx.userId }
    });

    const enrichedStaff = staff.map(s => {
      if (s.role === "MANAGER") {
        const team = teamMembers.find(t => t.name === s.name);
        if (team) return { ...s, loginEmail: team.email };
      }
      return s;
    });

    return NextResponse.json({ success: true, data: enrichedStaff });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

import bcryptjs from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const data = await req.json();
    if (!data.name) return NextResponse.json({ success: false, message: "name required" }, { status: 400 });

    const role = data.role ?? "OTHER";

    // 1. Create Staff Record
    const staff = await db.pgStaff.create({
      data: {
        ownerId:   ctx.userId,
        listingId: data.listingId ? parseInt(data.listingId) : null,
        name:      data.name,
        role:      role,
        phone:     data.phone   ?? null,
        salary:    parseInt(data.salary ?? 0),
        joinDate:  data.joinDate ? new Date(data.joinDate) : new Date(),
        note:      data.note    ?? null,
        active:    true,
      },
    });

    // 2. If MANAGER, also create TeamMember record for login
    if (role === "MANAGER") {
      if (!data.email || !data.password) {
        return NextResponse.json({ success: false, message: "Email and Password are required for Managers" }, { status: 400 });
      }

      // Check if email already used
      const existingTeam = await db.pgTeamMember.findUnique({ where: { email: data.email } });
      if (existingTeam) {
        return NextResponse.json({ success: false, message: "Email is already in use by another manager." }, { status: 400 });
      }

      const passwordHash = await bcryptjs.hash(data.password, 10);
      
      await db.pgTeamMember.create({
        data: {
          ownerId: ctx.userId,
          name: data.name,
          email: data.email,
          passwordHash: passwordHash,
          role: "MANAGER",
          active: true,
          listingIds: "[]", // full access by default
        }
      });
    }

    await logPgAudit(ctx.userId, ctx.name, `Added staff: ${staff.name} (${staff.role})`, "PgStaff");
    return NextResponse.json({ success: true, data: staff }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
