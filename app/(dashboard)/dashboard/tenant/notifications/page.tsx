import { Bell } from "lucide-react";
import { NotificationsFeed } from "@/components/common/NotificationsFeed";

export const metadata = { title: "Notifications - Tenant Dashboard" };

export default function TenantNotificationsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
          <Bell className="text-violet-600" /> Notifications
        </h1>
        <p className="text-sm text-neutral-500 mt-1">Your rent bills, payment receipts and complaint updates.</p>
      </div>
      <NotificationsFeed />
    </div>
  );
}
