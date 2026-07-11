import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ saved: false });
    
    const saved = await db.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: parseInt(session.user.id),
          listingId: parseInt(id)
        }
      }
    });

    return NextResponse.json({ saved: !!saved });
  } catch (err: any) {
    return NextResponse.json({ saved: false });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const listingId = parseInt(id);

    const existing = await db.savedListing.findUnique({
      where: { userId_listingId: { userId, listingId } }
    });

    if (existing) {
      // Toggle off
      await db.savedListing.delete({
        where: { userId_listingId: { userId, listingId } }
      });
      return NextResponse.json({ success: true, saved: false });
    } else {
      // Toggle on
      await db.savedListing.create({
        data: { userId, listingId }
      });
      return NextResponse.json({ success: true, saved: true });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
