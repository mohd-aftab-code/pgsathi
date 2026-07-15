import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId, name, type, bedCount, floor, price } = await req.json();

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

    const parsedPrice = parseInt(price) || 0;

    const newRoom = await prisma.room.create({
      data: {
        listingId: parseInt(listingId),
        name,
        type,
        floor,
        price: parsedPrice,
        beds: {
          create: bedsData
        }
      },
      include: {
        beds: true
      }
    });

    // Auto-calculate listing priceMin and priceMax based on all rooms
    const allRooms = await prisma.room.findMany({
      where: { listingId: parseInt(listingId) },
      select: { price: true }
    });

    if (allRooms.length > 0) {
      const prices = allRooms.map(r => r.price).filter(p => p > 0);
      if (prices.length > 0) {
        const priceMin = Math.min(...prices);
        const priceMax = Math.max(...prices);
        
        await prisma.listing.update({
          where: { id: parseInt(listingId) },
          data: { priceMin, priceMax }
        });
      }
    }

    return NextResponse.json(newRoom);
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
