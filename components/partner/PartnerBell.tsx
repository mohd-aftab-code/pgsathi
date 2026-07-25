"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

/**
 * Unread-notification indicator in the portal header.
 *
 * Polls the shared /api/notifications endpoint (already scoped to the signed-in
 * user) and re-checks on navigation, so the badge clears right after the partner
 * opens the notifications page.
 */
export function PartnerBell() {
  const [unread, setUnread] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const d = await fetch("/api/notifications?limit=1").then((r) => r.json());
        if (alive && d?.success) setUnread(d.unreadCount ?? 0);
      } catch {
        // a failed poll shouldn't surface an error in the header
      }
    };
    load();
    const t = setInterval(load, 60000); // 1 min is plenty for this
    return () => { alive = false; clearInterval(t); };
  }, [pathname]);

  return (
    <Link
      href="/partner/notifications"
      aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
      className="relative w-9 h-9 grid place-items-center rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      <Bell size={16} />
      {unread > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-red-500 text-white text-[10px] font-bold">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
