import Link from "next/link";
import { LogOut } from "lucide-react";
import { requirePartner } from "@/lib/partner-auth";
import { db } from "@/lib/db";
import { whatsappConfigured } from "@/lib/partner-notify";
import { SettingsForm } from "@/components/partner/ProfileForms";

export const metadata = { title: "Settings — Partner | PGSathi" };

export default async function PartnerSettingsPage() {
  const ctx = await requirePartner();
  const settings = await db.partnerSetting.findUnique({
    where: { partnerId: ctx.partnerId },
    select: { notifyInApp: true, notifyEmail: true, notifyWhatsapp: true, language: true },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Notification preferences and account.</p>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-4">Notifications</h2>
        <SettingsForm
          initial={{
            notifyInApp: settings?.notifyInApp ?? true,
            notifyEmail: settings?.notifyEmail ?? true,
            notifyWhatsapp: settings?.notifyWhatsapp ?? false,
            language: settings?.language ?? "HINGLISH",
          }}
          // Told the truth rather than labelled "coming soon" indefinitely: the
          // toggle is only offered when the server can actually deliver.
          whatsappAvailable={whatsappConfigured()}
        />
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">Account</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          Password kabhi bhi yahan se badal sakte hain — logout karne ki zaroorat nahi.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/change-password"
            className="inline-flex items-center gap-1.5 h-11 px-5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 font-bold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Password badlein
          </Link>
          <Link
            href="/api/auth/signout"
            className="inline-flex items-center gap-1.5 h-11 px-5 rounded-xl border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <LogOut size={15} /> Logout
          </Link>
        </div>
      </div>
    </div>
  );
}
