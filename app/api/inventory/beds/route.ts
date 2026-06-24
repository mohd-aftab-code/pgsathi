import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bedId, isOccupied } = await req.json();

    const bed = await prisma.bed.update({
      where: { id: parseInt(bedId) },
      data: { isOccupied }
    });

    return NextResponse.json(bed);
  } catch (error) {
    console.error("Error updating bed:", error);
    return NextResponse.json({ error: "Failed to update bed" }, { status: 500 });
  }
}
