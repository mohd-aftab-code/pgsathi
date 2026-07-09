/**
 * app/(main)/dashboard/manager/reminders/page.tsx
 * Rent Reminders — shows who hasn't paid this month with WhatsApp links.
 */
import { db } from "@/lib/db";
import { requireManagerAccess } from "@/lib/manager-auth";
import { formatINR, formatMonth, currentMonth, initials } from "@/lib/manage-utils";
import { buildRentReminderLink } from "@/lib/whatsapp-reminder";
import { EmptyState } from "@/components/manage/EmptyState";
import { BellRing, MessageCircle } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Rent Reminders — PG Manager" };

export default async function RemindersPage({
  searchParams,
}: { searchParams: Promise<{ month?: string }> }) {
  const sp     = await searchParams;
  const { userId, name: ownerName } = await requireManagerAccess();
  const month  = sp.month ?? currentMonth();

  const activeTenants = await db.pgTenant.findMany({
    where: { ownerId: userId, status: "ACTIVE", deletedAt: null, monthlyRent: { gt: 0 } },
    include: {
      listing: { select: { id: true, title: true } },
      payments: { where: { type: "RENT", forMonth: month, voided: false }, select: { amount: true } },
    },
  });

  const pending = activeTenants
    .map((t) => {
      const paid = t.payments.reduce((s, p) => s + p.amount, 0);
      return { ...t, paid, due: Math.max(0, t.monthlyRent - paid) };
    })
    .filter((t) => t.due > 0)
    .sort((a, b) => b.due - a.due);

  const totalDue = pending.reduce((s, t) => s + t.due, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Rent Reminders</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {pending.length} tenants pending · Total: <strong>{formatINR(totalDue)}</strong>
          </p>
        </div>
        <form>
          <input type="month" name="month" defaultValue={month} className="input-base max-w-[170px]" onChange={(e) => e.currentTarget.form?.requestSubmit()} />
        </form>
      </div>

      {pending.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={BellRing}
            title={`Sab ne pay kar diya! 🎉`}
            description={`${formatMonth(month)} ke liye koi pending rent nahi.`}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Bulk reminder note */}
          <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-sm text-green-800 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span>Har tenant ke saamne <strong>WA button</strong> hai — click karein to open WhatsApp with pre-filled message.</span>
          </div>

          {pending.map(({ id, name, phone, listing, monthlyRent, paid, due }) => (
            <div key={id} className="card p-4 flex items-center justify-between gap-4 hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                  {initials(name)}
                </div>
                <div>
                  <Link href={`/dashboard/manager/tenants/${id}`} className="font-semibold text-neutral-900 hover:underline">
                    {name}
                  </Link>
                  <div className="text-xs text-neutral-400">{listing.title} · {phone}</div>
                  {paid > 0 && (
                    <div className="text-xs text-amber-600">Partial: {formatINR(paid)} of {formatINR(monthlyRent)} paid</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="font-extrabold text-red-600">{formatINR(due)}</div>
                  <div className="text-xs text-neutral-400">pending</div>
                </div>
                <a
                  href={buildRentReminderLink({
                    phone, tenantName: name, ownerName,
                    propertyName: listing.title,
                    amount: due, month,
                  })}
                  target="_blank" rel="noreferrer"
                  className="btn-whatsapp text-xs px-3 py-2"
                >
                  WA
                </a>
                <Link
                  href={`/dashboard/manager/payments/new?tenantId=${id}`}
                  className="text-xs font-semibold text-primary-700 hover:underline hidden sm:inline"
                >
                  Record →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
