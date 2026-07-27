/**
 * app/api/admin/settings/route.ts
 * Simple key-value settings stored in the AdminAuditLog table's metadata
 * using a special entity="SystemSettings" pattern.
 * GET returns current settings, POST saves them.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Settings = {
  trialDays: number;
  announcementEnabled: boolean;
  announcementText: string;
  maintenanceMode: boolean;
  defaultTrialPlanSlug: string;
};

const DEFAULTS: Settings = {
  trialDays: 14,
  announcementEnabled: false,
  announcementText: "",
  maintenanceMode: false,
  defaultTrialPlanSlug: "starter",
};

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  // Read from latest settings log entry
  const latest = await db.adminAuditLog.findFirst({
    where: { entity: "SystemSettings", action: "settings.saved" },
    orderBy: { createdAt: "desc" },
  });

  const settings: Settings = latest?.after
    ? { ...DEFAULTS, ...(latest.after as Partial<Settings>) }
    : DEFAULTS;

  return NextResponse.json({ success: true, data: settings });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const adminId = parseInt(session.user.id);

  // Read current settings first
  const latest = await db.adminAuditLog.findFirst({
    where: { entity: "SystemSettings", action: "settings.saved" },
    orderBy: { createdAt: "desc" },
  });
  const before = latest?.after ?? DEFAULTS;

  const next: Settings = {
    trialDays: Number(body.trialDays) || DEFAULTS.trialDays,
    announcementEnabled: Boolean(body.announcementEnabled),
    announcementText: String(body.announcementText || ""),
    maintenanceMode: Boolean(body.maintenanceMode),
    defaultTrialPlanSlug: String(body.defaultTrialPlanSlug || DEFAULTS.defaultTrialPlanSlug),
  };

  await db.adminAuditLog.create({
    data: {
      adminId,
      actor: session.user.name ?? "Admin",
      action: "settings.saved",
      entity: "SystemSettings",
      before: before as any,
      after: next as any,
    },
  });

  return NextResponse.json({ success: true, message: "Settings saved." });
}
