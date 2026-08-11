import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
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
    const pageSize = 20; // Show slightly more rows on admin table

    // 1. Get total stats
    const [totalTenants, activeTenants, inactiveTenants, checkingOut] = await Promise.all([
      db.pgTenant.count({ where: { deletedAt: null } }),
      db.pgTenant.count({ where: { status: "ACTIVE", deletedAt: null } }),
      db.pgTenant.count({ where: { status: { in: ["INACTIVE", "EVICTED"] }, deletedAt: null } }),
      db.pgTenant.count({ where: { status: "CHECKING_OUT", deletedAt: null } }),
    ]);

    const where: any = { deletedAt: null };
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
      ];
    }

    // 2. Get paginated tenants
    const [tenants, filteredCount] = await Promise.all([
      db.pgTenant.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          monthlyRent: true,
          checkInDate: true,
          listing: { select: { id: true, title: true } },
          owner: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.pgTenant.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: { totalTenants, activeTenants, inactiveTenants, checkingOut },
        tenants,
        pagination: {
          total: filteredCount,
          pages: Math.ceil(filteredCount / pageSize),
          current: page,
        }
      }
    });

  } catch (error) {
    console.error("Admin Tenants Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
