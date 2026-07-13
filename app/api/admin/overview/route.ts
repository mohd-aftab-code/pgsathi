/**
 * app/api/admin/overview/route.ts
 * Super Admin API to get platform statistics and users.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    // In production, ensure session.user.role === "ADMIN"
    // For now we just check if it's the specific admin email or if role is ADMIN
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    // Validate Admin Role
    const user = await db.user.findUnique({ where: { id: parseInt(session.user.id) } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden: Not an admin" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = Number(searchParams.get("page")) || 1;
    const query = searchParams.get("query") || "";
    const pageSize = 10;

    // 1. Get total stats
    const [totalUsers, totalListings, totalLeads, totalTenants] = await Promise.all([
      db.user.count({ where: { role: "OWNER" } }), // total PG owners
      db.listing.count(), // total PGs listed
      db.lead.count(),    // total leads generated across platform
      db.pgTenant.count({ where: { status: "ACTIVE" } }), // total active tenants in CRM
    ]);

    const ownersWhere: any = { role: "OWNER" };
    if (query) {
      ownersWhere.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
      ];
    }

    // 2. Get owners list with their CRM status (for Trial Management)
    const [owners, filteredOwnersCount] = await Promise.all([
      db.user.findMany({
        where: ownersWhere,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { listings: true, pgTenantsOwned: true, leads: true }
        },
        subscriptions: {
          where: { status: "ACTIVE" },
          orderBy: { endDate: "desc" },
          take: 1,
          select: { endDate: true, planId: true }
        }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    db.user.count({ where: ownersWhere })
  ]);

    const ownersData = owners.map(o => {
      // Calculate trial status (15 days from creation)
      const trialDays = 15;
      const trialEndDate = new Date(o.createdAt);
      trialEndDate.setDate(trialEndDate.getDate() + trialDays);
      const isTrialActive = new Date() < trialEndDate;
      const hasSubscription = o.subscriptions.length > 0;
      
      let status = "FREE_TRIAL";
      if (hasSubscription) status = "PREMIUM";
      else if (!isTrialActive) status = "EXPIRED";

      return {
        id: o.id,
        name: o.name,
        email: o.email,
        phone: o.phone,
        createdAt: o.createdAt,
        pgCount: o._count.listings,
        tenantCount: o._count.pgTenantsOwned,
        leadCount: o._count.leads,
        status,
        trialEndDate: trialEndDate.toISOString(),
        subscriptionEnd: hasSubscription ? o.subscriptions[0].endDate : null
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: { totalUsers, totalListings, totalLeads, totalTenants },
        owners: ownersData,
        pagination: {
          totalCount: filteredOwnersCount,
          totalPages: Math.ceil(filteredOwnersCount / pageSize),
          currentPage: page,
        }
      }
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
