/**
 * app/api/owner/analytics/route.ts
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false }, { status: 401 });
    const ownerId = parseInt(session.user.id);

    // Fetch leads for the last 6 months
    const monthlyLeads = [];
    let totalLeadsLast30 = 0;
    
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const count = await db.lead.count({
        where: {
          listing: { ownerId },
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      });
      monthlyLeads.push({ month: ym, leads: count });
    }

    // 30 days leads
    totalLeadsLast30 = await db.lead.count({
      where: { listing: { ownerId }, createdAt: { gte: thirtyDaysAgo } }
    });

    // Mock views for demonstration if not tracked, assuming 1 lead = 15 views roughly
    // In production, aggregate from `ListingAnalytic` table.
    const mockViews30 = totalLeadsLast30 * 15 + Math.floor(Math.random() * 50) + 100; 

    // Aggregate leads by source
    const sources = await db.lead.groupBy({
      by: ['source'],
      where: { listing: { ownerId } },
      _count: { source: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        trend: monthlyLeads,
        sources: sources.map(s => ({ name: s.source, count: s._count.source })),
        stats: {
          views30: mockViews30,
          leads30: totalLeadsLast30,
          conversion: Math.round((totalLeadsLast30 / mockViews30) * 100)
        }
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
