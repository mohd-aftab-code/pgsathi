import { Bell } from "lucide-react";
import { NotificationsFeed } from "@/components/common/NotificationsFeed";

export const metadata = { title: "Notifications - PG Manager" };

export default function ManagerNotificationsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase flex items-center gap-2">
          <Bell className="text-violet-600" /> Notifications
        </h1>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">New leads, visits, payments and complaints — all in one place.</p>
      </div>
      <NotificationsFeed />
    </div>
  );
}
