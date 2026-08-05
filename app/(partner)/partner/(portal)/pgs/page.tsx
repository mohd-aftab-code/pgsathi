import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { requirePartner } from "@/lib/partner-auth";
import { db } from "@/lib/db";
import { PgFilters } from "@/components/partner/PgFilters";
import { UnifiedPgList, UnifiedOwner } from "@/components/partner/UnifiedPgList";

export const metadata = { title: "My PGs — Partner | PGSathi" };

const PAGE_SIZE = 10;

export default async function PartnerPgsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const ctx = await requirePartner();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const status = sp.status ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1"));

  // Base query: fetch Owners under this partner.
  const where: any = { partnerId: ctx.partnerId, role: "OWNER" };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { listings: { some: { title: { contains: q, mode: "insensitive" } } } },
    ];
  }

  // If status is provided, we only want owners who have at least one PG with that status.
  if (status) {
    where.listings = { some: { status: status as any } };
  }

  const [total, rawOwners] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, name: true, phone: true, email: true, createdAt: true,
        listings: {
          where: status ? { status: status as any } : undefined,
          orderBy: { createdAt: "desc" },
          select: {
            id: true, title: true, status: true,
            city: { select: { name: true } },
            createdAt: true,
          }
        },
        subscriptions: {
          where: { status: { in: ["ACTIVE", "TRIAL"] }, endDate: { gt: new Date() } },
          orderBy: { endDate: "desc" },
          take: 1,
          select: { amount: true, billingCycle: true, endDate: true, plan: { select: { name: true } } },
        },
      }
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const ownerIds = rawOwners.map((o) => o.id);

  // Fetch earnings separately and aggregate them by owner
  const earnings = ownerIds.length
    ? await db.partnerEarning.findMany({
        where: { ownerId: { in: ownerIds }, partnerId: ctx.partnerId },
        select: { ownerId: true, amount: true },
      })
    : [];

  const earningMap = new Map<number, number>();
  for (const e of earnings) {
    if (e.ownerId) {
      earningMap.set(e.ownerId, (earningMap.get(e.ownerId) || 0) + e.amount);
    }
  }

  const owners: UnifiedOwner[] = rawOwners.map((o) => ({
    id: o.id,
    name: o.name,
    phone: o.phone,
    email: o.email,
    createdAt: o.createdAt,
    plan: o.subscriptions[0]
      ? {
          name: o.subscriptions[0].plan.name,
          amount: o.subscriptions[0].amount,
          billingCycle: o.subscriptions[0].billingCycle,
          endDate: o.subscriptions[0].endDate,
        }
      : null,
    earnings: earningMap.get(o.id) || 0,
    listings: o.listings.map((l) => ({
      id: l.id,
      title: l.title,
      status: l.status,
      city: l.city,
      createdAt: l.createdAt,
    })),
  }));

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/partner/pgs?${qs}` : "/partner/pgs";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">My PGs</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            View all properties listed by owners under your referral.
          </p>
        </div>
        <Link
          href="/partner/pgs/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-bold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
        >
          <Plus size={18} /> List New PG
        </Link>
      </div>

      <PgFilters q={q} status={status} />

      <UnifiedPgList owners={owners} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Link
              href={buildHref(page - 1)}
              aria-disabled={page <= 1}
              className={`inline-flex items-center gap-1 h-9 px-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 text-sm font-semibold ${page <= 1 ? "opacity-40 pointer-events-none" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"} text-neutral-600 dark:text-neutral-300`}
            >
              <ChevronLeft size={15} /> Prev
            </Link>
            <Link
              href={buildHref(page + 1)}
              aria-disabled={page >= totalPages}
              className={`inline-flex items-center gap-1 h-9 px-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 text-sm font-semibold ${page >= totalPages ? "opacity-40 pointer-events-none" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"} text-neutral-600 dark:text-neutral-300`}
            >
              Next <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
