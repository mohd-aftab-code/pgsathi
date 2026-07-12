import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST — fire-and-forget view ping from the PG detail page (client-side),
// kept separate from the page's data fetch so that fetch can be cached
// without silently freezing the view counter.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listingId = parseInt(id);
  if (!listingId || isNaN(listingId)) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  db.listing.update({ where: { id: listingId }, data: { totalViews: { increment: 1 } } }).catch(() => {});

  return NextResponse.json({ success: true });
}
