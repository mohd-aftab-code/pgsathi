import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updatedPlan = await db.plan.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        slug: body.slug,
        price: body.price !== undefined ? parseInt(body.price) : undefined,
        yearlyPrice: body.yearlyPrice !== undefined ? parseInt(body.yearlyPrice) : undefined,
        maxListings: body.maxListings !== undefined ? parseInt(body.maxListings) : undefined,
        maxPhotos: body.maxPhotos !== undefined ? parseInt(body.maxPhotos) : undefined,
        features: body.features !== undefined ? body.features : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      }
    });

    return NextResponse.json({ success: true, data: updatedPlan });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error updating plan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    // We hard delete plans for simplicity since it's just pricing
    await db.plan.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true, message: "Plan deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error deleting plan. Make sure no users are actively subscribed." }, { status: 500 });
  }
}
