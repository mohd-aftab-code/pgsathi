import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "OWNER" && session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const ownerId = parseInt(session.user.id!);

    // Fetch active tenants
    const tenants = await db.pgTenant.findMany({
      where: { ownerId, status: "ACTIVE", deletedAt: null },
      include: {
        listing: { select: { title: true } },
        bed: {
          select: {
            name: true,
            room: { select: { name: true } }
          }
        },
        payments: {
          select: { amount: true, type: true, forMonth: true, paidOn: true },
          where: { voided: false },
          orderBy: { paidOn: 'desc' }
        }
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: tenants });
  } catch (error: any) {
    console.error("Manager fetch tenants error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch tenants" }, { status: 500 });
  }
}
