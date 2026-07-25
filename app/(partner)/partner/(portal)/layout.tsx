import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, XCircle, Ban, Handshake, LogOut } from "lucide-react";
import { getPartnerContext } from "@/lib/partner-auth";
import { db } from "@/lib/db";
import { PartnerShell } from "@/components/partner/PartnerShell";
import { themeInitScript } from "@/components/partner/ThemeToggle";

/**
 * Guard for every authenticated Partner Portal page.
 *
 * This is a route-group layout — the public pages (/partner, /partner/login,
 * /partner/signup, /partner/forgot-password) sit OUTSIDE this group and are
 * therefore never guarded, which avoids a redirect loop at the login page.
 *
 * A non-approved partner is allowed to sign in but sees a status screen and no
 * data: the dashboard is simply never rendered for them.
 */
export default async function PartnerPortalLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getPartnerContext();

  // Not signed in, or signed in as something other than a partner.
  if (!ctx) redirect("/partner/login");

  if (ctx.status !== "APPROVED") {
    const profile = await db.partnerProfile.findUnique({
      where: { id: ctx.partnerId },
      select: { rejectReason: true },
    });
    return (
      <StatusScreen status={ctx.status} name={ctx.name} code={ctx.partnerCode} reason={profile?.rejectReason ?? null} />
    );
  }

  return (
    <>
      {/* Applies the saved theme before paint so there is no light/dark flash. */}
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <PartnerShell name={ctx.name} partnerCode={ctx.partnerCode}>
        {children}
      </PartnerShell>
    </>
  );
}

function StatusScreen({
  status,
  name,
  code,
  reason,
}: {
  status: string;
  name: string;
  code: string;
  reason: string | null;
}) {
  const view =
    status === "PENDING"
      ? {
          Icon: Clock,
          tone: "amber",
          title: "Approval pending",
          body: "Aapka partner account review mein hai. Admin approve karte hi aapko poora dashboard mil jayega — usually 24 ghante ke andar.",
        }
      : status === "REJECTED"
      ? {
          Icon: XCircle,
          tone: "red",
          title: "Application reject ho gayi",
          body: reason || "Aapki application approve nahi ho payi. Zyada jaankari ke liye support se sampark karein.",
        }
      : {
          Icon: Ban,
          tone: "red",
          title: "Account suspended",
          body: "Aapka partner account abhi suspend hai. Support se sampark karein.",
        };

  const toneCls =
    view.tone === "amber"
      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
      : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-violet-50 via-white to-violet-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-primary-500 grid place-items-center shadow-lg shadow-primary-500/25">
            <Handshake className="text-white" size={22} />
          </div>
          <div className="text-left">
            <div className="font-extrabold text-neutral-900 dark:text-white leading-tight">PGSathi</div>
            <div className="text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Partner Portal</div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl p-8 text-center">
          <div className={`w-16 h-16 rounded-2xl grid place-items-center mx-auto mb-5 ${toneCls}`}>
            <view.Icon size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-2">{view.title}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">{view.body}</p>

          <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-4 py-3 mb-6 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">Partner</span>
              <span className="font-semibold text-neutral-900 dark:text-white">{name}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1.5">
              <span className="text-neutral-500 dark:text-neutral-400">Code</span>
              <span className="font-bold tracking-widest text-primary-600 dark:text-primary-400">{code}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1.5">
              <span className="text-neutral-500 dark:text-neutral-400">Status</span>
              <span className="font-bold text-neutral-900 dark:text-white">{status}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/contact"
              className="flex-1 h-11 leading-[2.75rem] rounded-xl border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
            >
              Support
            </Link>
            <Link
              href="/api/auth/signout"
              className="flex-1 h-11 leading-[2.75rem] rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-sm hover:opacity-90 transition inline-flex items-center justify-center gap-1.5"
            >
              <LogOut size={15} /> Logout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
