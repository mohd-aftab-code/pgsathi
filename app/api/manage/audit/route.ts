/**
 * app/api/manage/audit/route.ts
 * GET — list audit log entries for the owner
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext } from "@/lib/manage-auth";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const page  = parseInt(searchParams.get("page") ?? "1");
    const limit = 30;

    const [logs, total] = await Promise.all([
      db.pgAuditLog.findMany({
        where: { ownerId: ctx.userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.pgAuditLog.count({ where: { ownerId: ctx.userId } }),
    ]);

    return NextResponse.json({ success: true, data: logs, total, pages: Math.ceil(total / limit) });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
