import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const cities = await db.city.findMany({
      orderBy: { priority: "desc" },
    });

    return NextResponse.json({ success: true, data: cities });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { cityId, metaTitle, metaDesc } = await req.json();

    await db.city.update({
      where: { id: parseInt(cityId) },
      data: { metaTitle, metaDesc }
    });

    return NextResponse.json({ success: true, message: "SEO updated successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
