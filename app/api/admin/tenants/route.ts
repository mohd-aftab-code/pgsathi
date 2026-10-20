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
    const statusFilter = searchParams.get("status") || "ALL";
    const pageSize = 20;

    // 1. Get total stats
    const [totalTenants, activeTenants, inactiveTenants, checkingOut, totalRegisteredUsers] = await Promise.all([
      db.pgTenant.count({ where: { deletedAt: null } }),
      db.pgTenant.count({ where: { status: "ACTIVE", deletedAt: null } }),
      db.pgTenant.count({ where: { status: { in: ["INACTIVE", "EVICTED"] }, deletedAt: null } }),
      db.pgTenant.count({ where: { status: "CHECKING_OUT", deletedAt: null } }),
      db.user.count({ where: { role: "TENANT" } }),
    ]);

    const where: any = { deletedAt: null };
    if (statusFilter && statusFilter !== "ALL") {
      if (statusFilter === "INACTIVE_OR_EVICTED") {
        where.status = { in: ["INACTIVE", "EVICTED"] };
      } else {
        where.status = statusFilter;
      }
    }
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
        { idNumber: { contains: query } },
      ];
    }

    // 2. Get paginated tenants with rich details
    const [tenants, filteredCount] = await Promise.all([
      db.pgTenant.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          gender: true,
          bloodGroup: true,
          status: true,
          monthlyRent: true,
          securityDeposit: true,
          rentDueDay: true,
          checkInDate: true,
          checkOutDate: true,
          noticeDate: true,
          expectedVacate: true,
          createdAt: true,
          updatedAt: true,
          idType: true,
          idNumber: true,
          guardianName: true,
          guardianPhone: true,
          guardianRelation: true,
          permanentAddress: true,
          occupation: true,
          workplace: true,
          workplaceAddress: true,
          policeVerificationStatus: true,
          policeVerificationRef: true,
          vehicleType: true,
          vehicleNumber: true,
          notes: true,
          listing: {
            select: {
              id: true,
              title: true,
              address: true,
              city: { select: { name: true } },
            },
          },
          room: { select: { id: true, name: true } },
          bed: { select: { id: true, name: true } },
          owner: { select: { id: true, name: true, phone: true, email: true } },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true,
              isVerified: true,
              lastLoginAt: true,
            },
          },
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
        stats: {
          totalTenants,
          activeTenants,
          inactiveTenants,
          checkingOut,
          totalRegisteredUsers,
        },
        tenants,
        pagination: {
          total: filteredCount,
          pages: Math.ceil(filteredCount / pageSize),
          current: page,
        },
      },
    });

  } catch (error) {
    console.error("Admin Tenants Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
