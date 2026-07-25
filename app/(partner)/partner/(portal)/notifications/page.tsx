import { requirePartner } from "@/lib/partner-auth";
import { db } from "@/lib/db";
import { PartnerNotificationsFeed } from "@/components/partner/PartnerNotificationsFeed";

export const metadata = { title: "Notifications — Partner | PGSathi" };

export default async function PartnerNotificationsPage() {
  const ctx = await requirePartner();

  // Scoped to this partner's own user id.
  const notifications = await db.notification.findMany({
    where: { userId: ctx.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, type: true, title: true, message: true, link: true, isRead: true, createdAt: true },
  });
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Notifications</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          {unread > 0 ? `${unread} unread` : "Sab padh liya ✓"}
        </p>
      </div>
      <PartnerNotificationsFeed
        initial={notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
        initialUnread={unread}
      />
    </div>
  );
}
