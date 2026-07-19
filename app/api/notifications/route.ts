/**
 * app/api/notifications/route.ts
 * GET   — the current user's notifications + unread count
 * PATCH — mark one ({ id }) or all notifications as read
 * Recipient resolution: managers see their owner's notifications; everyone else their own.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

async function recipientId() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const isManager = (session.user as any).isManager;
  return isManager ? ((session.user as any).ownerId as number) : parseInt(session.user.id);
}

export async function GET(req: NextRequest) {
  try {
    const uid = await recipientId();
    if (!uid) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "15")));

    const [items, unreadCount] = await Promise.all([
      db.notification.findMany({ where: { userId: uid }, orderBy: { createdAt: "desc" }, take: limit }),
      db.notification.count({ where: { userId: uid, isRead: false } }),
    ]);

    return NextResponse.json({ success: true, items, unreadCount });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const uid = await recipientId();
    if (!uid) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));

    if (body.id) {
      // Scope to the recipient so no one can flip another user's notification.
      await db.notification.updateMany({
        where: { id: parseInt(body.id), userId: uid },
        data: { isRead: true },
      });
    } else {
      await db.notification.updateMany({ where: { userId: uid, isRead: false }, data: { isRead: true } });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
