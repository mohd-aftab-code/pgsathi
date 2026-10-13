import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const status = searchParams.get("status") || "ALL";
    const search = (searchParams.get("search") || "").trim();
    const unreadOnly = searchParams.get("unread") === "true";

    const where: any = {};

    if (status !== "ALL") {
      where.status = status;
    }

    if (unreadOnly) {
      where.isRead = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [enquiries, total, unreadCount, pendingCount, resolvedCount] = await Promise.all([
      db.contactEnquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.contactEnquiry.count({ where }),
      db.contactEnquiry.count({ where: { isRead: false } }),
      db.contactEnquiry.count({ where: { status: "PENDING" } }),
      db.contactEnquiry.count({ where: { status: "RESOLVED" } }),
    ]);

    return NextResponse.json({
      success: true,
      enquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      counts: {
        total,
        unread: unreadCount,
        pending: pendingCount,
        resolved: resolvedCount,
      },
    });
  } catch (error: any) {
    console.error("[Admin Enquiries GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}
