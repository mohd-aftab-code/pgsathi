/**
 * app/api/admin/cities/route.ts
 * CRUD for City management — list, create, toggle active.
 * PATCH /api/admin/cities  { id, action: "toggle" | "update", name?, state?, priority? }
 * POST  /api/admin/cities  { name, state, slug?, priority? }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const cities = await db.city.findMany({
    orderBy: [{ isActive: "desc" }, { priority: "desc" }, { name: "asc" }],
    include: { _count: { select: { listings: true, localities: true } } },
  });

  return NextResponse.json({ success: true, data: cities });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, state, priority = 0 } = body;

  if (!name?.trim() || !state?.trim()) {
    return NextResponse.json({ success: false, message: "Name and state are required." }, { status: 400 });
  }

  // Auto-generate slug
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-pg";

  const existing = await db.city.findFirst({ where: { slug } });
  if (existing) {
    return NextResponse.json({ success: false, message: "City with this name already exists." }, { status: 400 });
  }

  const city = await db.city.create({
    data: { name: name.trim(), state: state.trim(), slug, priority: Number(priority), isActive: true },
  });

  return NextResponse.json({ success: true, data: city, message: "City created!" });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, action, name, state, priority } = body;

  if (!id) return NextResponse.json({ success: false, message: "ID required." }, { status: 400 });

  if (action === "toggle") {
    const city = await db.city.findUnique({ where: { id } });
    if (!city) return NextResponse.json({ success: false, message: "City not found." }, { status: 404 });

    await db.city.update({ where: { id }, data: { isActive: !city.isActive } });
    return NextResponse.json({ success: true, message: `City ${city.isActive ? "deactivated" : "activated"}.` });
  }

  if (action === "update") {
    const update: any = {};
    if (name?.trim()) update.name = name.trim();
    if (state?.trim()) update.state = state.trim();
    if (priority !== undefined) update.priority = Number(priority);
    await db.city.update({ where: { id }, data: update });
    return NextResponse.json({ success: true, message: "City updated." });
  }

  return NextResponse.json({ success: false, message: "Unknown action." }, { status: 400 });
}
