import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId, name, type, bedCount } = await req.json();

    // Verify owner
    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(listingId) }
    });

    if (!listing || listing.ownerId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bedsData = Array.from({ length: parseInt(bedCount) }).map((_, i) => ({
      name: `Bed ${i + 1}`,
      isOccupied: false
    }));

    const newRoom = await prisma.room.create({
      data: {
        listingId: parseInt(listingId),
        name,
        type,
        beds: {
          create: bedsData
        }
      },
      include: {
        beds: true
      }
    });

    return NextResponse.json(newRoom);
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
