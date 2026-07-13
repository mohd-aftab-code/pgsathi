import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const listings = await db.listing.findMany({
      where: { isActive: true },
      select: { id: true, title: true, isFeatured: true, featuredUntil: true, owner: { select: { name: true, phone: true } }, city: { select: { name: true } } },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 100
    });

    return NextResponse.json({ success: true, data: listings });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { listingId, isFeatured, days } = await req.json();

    let featuredUntil = null;
    if (isFeatured && days) {
      featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + parseInt(days));
    }

    await db.listing.update({
      where: { id: parseInt(listingId) },
      data: { isFeatured, featuredUntil }
    });

    return NextResponse.json({ success: true, message: isFeatured ? "Listing is now sponsored" : "Sponsorship removed" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
