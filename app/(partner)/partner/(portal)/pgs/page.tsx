import Link from "next/link";
import { Building2, Plus, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { requirePartner } from "@/lib/partner-auth";
import { db } from "@/lib/db";
import { PgFilters } from "@/components/partner/PgFilters";

export const metadata = { title: "My PGs — Partner | PGSathi" };

const PAGE_SIZE = 10;

const statusStyle: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
  PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  INACTIVE: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  REJECTED: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

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

  // Scoped by partnerId from the session — always.
  const where: any = { partnerId: ctx.partnerId };
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { pincode: { contains: q } },
    ];
  }

  const [total, listings] = await Promise.all([
    db.listing.count({ where }),
    db.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, title: true, status: true, priceMin: true, priceMax: true,
        genderAllowed: true, ownerId: true, createdAt: true,
        city: { select: { name: true } },
        owner: { select: { name: true } },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const ownerIds = [...new Set(listings.map((l) => l.ownerId))];
  const paidOwners = new Set(
    ownerIds.length
      ? (
          await db.subscription.findMany({
            where: {
              userId: { in: ownerIds },
              status: { in: ["ACTIVE", "TRIAL"] },
              endDate: { gt: new Date() },
              plan: { price: { gt: 0 } },
            },
            select: { userId: true },
          })
        ).map((s) => s.userId)
      : []
  );

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">My PGs</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{total} PG registered</p>
        </div>
        <Link
          href="/partner/pgs/new"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5"
        >
          <Plus size={17} /> PG Register
        </Link>
      </div>

      <PgFilters q={q} status={status} />

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 grid place-items-center mx-auto mb-3">
            <Building2 className="text-neutral-400" size={22} />
          </div>
          <p className="font-semibold text-neutral-700 dark:text-neutral-300">
            {q || status ? "Koi PG match nahi hua" : "Abhi koi PG register nahi kiya"}
          </p>
          {!q && !status && (
            <Link href="/partner/pgs/new" className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline">
              <Plus size={15} /> Register your first PG
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50">
                  <th className="px-5 py-3 font-bold">PG</th>
                  <th className="px-3 py-3 font-bold">Owner</th>
                  <th className="px-3 py-3 font-bold">Rent</th>
                  <th className="px-3 py-3 font-bold">Plan</th>
                  <th className="px-5 py-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/partner/pgs/${l.id}`} className="font-semibold text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 block truncate max-w-[240px]">
                        {l.title}
                      </Link>
                      <span className="text-xs text-neutral-400 flex items-center gap-1"><MapPin size={11} /> {l.city?.name ?? "—"}</span>
                    </td>
                    <td className="px-3 py-3 text-neutral-600 dark:text-neutral-300">{l.owner?.name ?? "—"}</td>
                    <td className="px-3 py-3 text-neutral-600 dark:text-neutral-300">₹{l.priceMin}{l.priceMax > l.priceMin ? `–${l.priceMax}` : ""}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${paidOwners.has(l.ownerId) ? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"}`}>
                        {paidOwners.has(l.ownerId) ? "PAID" : "FREE"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${statusStyle[l.status] ?? statusStyle.INACTIVE}`}>{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {listings.map((l) => (
              <Link key={l.id} href={`/partner/pgs/${l.id}`} className="block rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-semibold text-neutral-900 dark:text-white">{l.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md shrink-0 ${statusStyle[l.status] ?? statusStyle.INACTIVE}`}>{l.status}</span>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 flex flex-wrap gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1"><MapPin size={11} /> {l.city?.name ?? "—"}</span>
                  <span>Owner: {l.owner?.name ?? "—"}</span>
                  <span>₹{l.priceMin}</span>
                  <span className={paidOwners.has(l.ownerId) ? "text-green-600 dark:text-green-400 font-semibold" : ""}>{paidOwners.has(l.ownerId) ? "PAID" : "FREE"}</span>
                </div>
              </Link>
            ))}
          </div>

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
        </>
      )}
    </div>
  );
}
