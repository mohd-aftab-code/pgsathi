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

    // Real lifetime view count and listing count (Listing.totalViews is incremented
    // on every PG detail page load — see app/(main)/pg/[city]/[locality]/[slug]/page.tsx)
    const [viewAgg, totalListings, totalLeadsAllTime] = await Promise.all([
      db.listing.aggregate({ where: { ownerId }, _sum: { totalViews: true } }),
      db.listing.count({ where: { ownerId } }),
      db.lead.count({ where: { listing: { ownerId } } }),
    ]);
    const totalViews = viewAgg._sum.totalViews ?? 0;

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
          views: totalViews,
          leads30: totalLeadsLast30,
          totalListings,
          conversion: totalViews > 0 ? Math.round((totalLeadsAllTime / totalViews) * 100) : 0
        }
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
