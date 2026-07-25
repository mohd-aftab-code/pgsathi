import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail, User, BadgeCheck, CircleDashed, CalendarClock, IndianRupee } from "lucide-react";
import { requirePartner } from "@/lib/partner-auth";
import { can, PERMISSIONS } from "@/lib/permissions";
import { db } from "@/lib/db";
import { EditPgForm } from "@/components/partner/EditPgForm";

const statusStyle: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
  PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  INACTIVE: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  REJECTED: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

const fmtDate = (d: Date) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default async function PartnerPgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePartner();
  const { id } = await params;
  const listingId = parseInt(id);
  if (Number.isNaN(listingId)) notFound();

  // partnerId in the query — cannot read another partner's PG.
  const listing = await db.listing.findFirst({
    where: { id: listingId, partnerId: ctx.partnerId },
    include: {
      city: { select: { name: true, state: true } },
      owner: { select: { name: true, phone: true, email: true } },
    },
  });
  if (!listing) notFound();

  const showContact = await can("PARTNER", PERMISSIONS.OWNER_CONTACT_VIEW);

  // ── Subscription / plan status (Phase 7) — derived from the OWNER's plan ──
  const sub = await db.subscription.findFirst({
    where: {
      userId: listing.ownerId,
      status: { in: ["ACTIVE", "TRIAL"] },
      endDate: { gt: new Date() },
      plan: { price: { gt: 0 } },
    },
    include: { plan: { select: { name: true, price: true } } },
    orderBy: { endDate: "desc" },
  });
  // Latest paid invoice for a "payment status" line.
  const lastInvoice = sub
    ? await db.invoice.findFirst({
        where: { subscription: { userId: listing.ownerId }, status: "PAID" },
        orderBy: { paidAt: "desc" },
        select: { paidAt: true, amount: true },
      })
    : null;

  const earning = await db.partnerEarning.findFirst({
    where: { partnerId: ctx.partnerId, listingId },
    select: { amount: true, status: true },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link href="/partner/pgs" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
        <ArrowLeft size={16} /> My PGs
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">{listing.title}</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5">
              <MapPin size={14} /> {listing.areaLocality ? `${listing.areaLocality}, ` : ""}{listing.city?.name ?? "—"}{listing.city?.state ? `, ${listing.city.state}` : ""} · {listing.pincode}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${statusStyle[listing.status] ?? statusStyle.INACTIVE}`}>{listing.status}</span>
            <EditPgForm
              id={listing.id}
              initial={{
                title: listing.title,
                description: listing.description ?? "",
                landmark: listing.landmark ?? "",
                areaLocality: listing.areaLocality ?? "",
                genderAllowed: listing.genderAllowed,
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { k: "Rent", v: `₹${listing.priceMin}${listing.priceMax > listing.priceMin ? `–${listing.priceMax}` : ""}` },
            { k: "For", v: listing.genderAllowed },
            { k: "Registered", v: fmtDate(listing.createdAt) },
            { k: "Room types", v: (listing.roomTypes as string[]).length.toString() },
          ].map((s) => (
            <div key={s.k} className="rounded-xl bg-neutral-50 dark:bg-neutral-800 px-3 py-2.5">
              <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">{s.k}</div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white truncate">{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan / subscription status */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-4">Plan &amp; Subscription</h2>
        {sub ? (
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-3 py-1.5 rounded-lg">
              <BadgeCheck size={16} /> Paid — {sub.plan.name}
            </span>
            <div className="text-sm text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
              <CalendarClock size={15} className="text-neutral-400" /> Renews {fmtDate(sub.endDate)}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
              <IndianRupee size={15} className="text-neutral-400" />
              {lastInvoice ? `Paid ₹${lastInvoice.amount}${lastInvoice.paidAt ? ` on ${fmtDate(lastInvoice.paidAt)}` : ""}` : `₹${sub.plan.price}/mo`}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <CircleDashed size={16} /> Free plan — owner ne abhi koi paid plan nahi liya. Paid hone par aapki earning ban jayegi.
          </div>
        )}
        {earning && (
          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Is PG par aapki earning: </span>
            <span className="font-bold text-neutral-900 dark:text-white">₹{earning.amount}</span>
            <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300">{earning.status}</span>
          </div>
        )}
      </div>

      {/* Owner */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-4">Owner</h2>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300"><User size={15} className="text-neutral-400" /> {listing.owner.name}</div>
          {showContact ? (
            <>
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300"><Phone size={15} className="text-neutral-400" /> {listing.owner.phone ?? "—"}</div>
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300"><Mail size={15} className="text-neutral-400" /> {listing.owner.email}</div>
            </>
          ) : (
            <div className="text-xs text-neutral-400">Contact details aapke plan mein available nahi hain.</div>
          )}
        </div>
      </div>

      {listing.description && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-2">Description</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{listing.description}</p>
        </div>
      )}
    </div>
  );
}
