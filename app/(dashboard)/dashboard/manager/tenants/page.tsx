/**
 * app/(main)/dashboard/manager/tenants/page.tsx
 * Tenants list page with search, status filter, and pagination.
 */
import Link from "next/link";
import { Plus, Users, Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireManagerAccess } from "@/lib/manager-auth";
import { StatusBadge } from "@/components/manage/StatusBadge";
import { EmptyState } from "@/components/manage/EmptyState";
import { formatINR, formatDate, initials, currentMonth } from "@/lib/manage-utils";

export const metadata = { title: "Tenants — PG Manager" };

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; listingId?: string; page?: string }>;
}) {
  const { userId } = await requireManagerAccess();
  const sp         = await searchParams;
  const q          = sp.q ?? "";
  const status     = sp.status ?? "";
  const listingId  = sp.listingId ? parseInt(sp.listingId) : undefined;
  const page       = parseInt(sp.page ?? "1");
  const limit      = 20;
  const month      = currentMonth();

  const where: any = { ownerId: userId, deletedAt: null };
  if (status) where.status = status;
  if (listingId) where.listingId = listingId;
  if (q) where.OR = [
    { name:  { contains: q, mode: "insensitive" } },
    { phone: { contains: q } },
  ];

  const [tenants, total, listings] = await Promise.all([
    db.pgTenant.findMany({
      where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { id: true, title: true } },
        room:    { select: { name: true } },
        payments:{ where: { type: "RENT", forMonth: month, voided: false }, select: { amount: true } },
      },
    }),
    db.pgTenant.count({ where }),
    db.listing.findMany({ where: { ownerId: userId }, select: { id: true, title: true } }),
  ]);

  const pages = Math.ceil(total / limit);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Tenants</h1>
          <p className="text-sm text-neutral-500 mt-1">{total} total tenants</p>
        </div>
        <Link href="/dashboard/manager/tenants/new" id="add-tenant-btn" className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Add Tenant
        </Link>
      </div>

      {/* Filters */}
      <form className="mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            name="q" defaultValue={q}
            placeholder="Search by name or phone…"
            className="input-base pl-9"
          />
        </div>
        <select name="status" defaultValue={status} className="input-base max-w-[150px]">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="NOTICE">Notice</option>
          <option value="VACATED">Vacated</option>
        </select>
        <select name="listingId" defaultValue={listingId ?? ""} className="input-base max-w-[200px]">
          <option value="">All Properties</option>
          {listings.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        <button type="submit" className="btn-primary text-sm px-5">Filter</button>
      </form>

      {/* Table */}
      {tenants.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="Koi tenant nahi mila"
            description="Naya tenant add karein ya filter change karein."
            actionLabel="Add Tenant"
            actionHref="/dashboard/manager/tenants/new"
          />
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Tenant</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">PG / Room</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">Rent</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden lg:table-cell">Check-in</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">This Month</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {tenants.map((t) => {
                    const paid = t.payments.reduce((s, p) => s + p.amount, 0);
                    const due  = Math.max(0, t.monthlyRent - paid);
                    return (
                      <tr key={t.id} className="hover:bg-neutral-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                              {initials(t.name)}
                            </div>
                            <div>
                              <div className="font-semibold text-neutral-900">{t.name}</div>
                              <div className="text-xs text-neutral-400">{t.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="text-neutral-900 font-medium text-xs">{t.listing.title}</div>
                          {t.room && <div className="text-xs text-neutral-400">Room {t.room.name}</div>}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell font-semibold text-neutral-900">
                          {formatINR(t.monthlyRent)}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-neutral-500 text-xs">
                          {formatDate(t.checkInDate)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {due > 0 ? (
                            <span className="text-red-600 font-semibold text-xs">{formatINR(due)} due</span>
                          ) : (
                            <span className="text-green-600 font-semibold text-xs">Paid ✓</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/dashboard/manager/tenants/${t.id}`} className="text-xs font-semibold text-primary-700 hover:underline">
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`?q=${q}&status=${status}&page=${p}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    p === page ? "bg-primary-600 text-white" : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
