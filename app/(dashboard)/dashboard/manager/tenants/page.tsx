/**
 * app/(main)/dashboard/manager/tenants/page.tsx
 * Tenants list page with search, status filter, and pagination.
 */
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { db } from "@/lib/db";
import { requireManagerAccess, listingScope } from "@/lib/manager-auth";
import { StatusBadge } from "@/components/manage/StatusBadge";
import { EmptyState } from "@/components/manage/EmptyState";
import { formatINR, formatDate, initials, currentMonth } from "@/lib/manage-utils";
import { ExportCsvButton } from "@/components/common/ExportCsvButton";
import { ImportCsvButton } from "@/components/common/ImportCsvButton";
import { TenantFilters } from "@/components/manage/TenantFilters";

export const metadata = { title: "Tenants — PG Manager" };

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; listingId?: string; page?: string }>;
}) {
  const { userId, capabilities, allowedListingIds } = await requireManagerAccess();
  const sp         = await searchParams;
  const q          = sp.q ?? "";
  const status     = sp.status ?? "";
  const listingId  = sp.listingId ? parseInt(sp.listingId) : undefined;
  const page       = parseInt(sp.page ?? "1");
  const limit      = 20;
  const month      = currentMonth();

  // A tenant who leaves is soft-deleted, never removed — `?status=PAST` is how
  // that history is read back. Everything else shows only current tenants.
  const showingPast = status === "PAST";
  const where: any = { ownerId: userId, deletedAt: showingPast ? { not: null } : null };
  if (status && !showingPast) where.status = status;
  // A manager restricted to certain PGs must not see tenants from the others.
  Object.assign(where, listingScope({ allowedListingIds }));
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
    db.listing.findMany({ where: { ownerId: userId, ...listingScope({ allowedListingIds }, "id") }, select: { id: true, title: true } }),
  ]);

  const pages = Math.ceil(total / limit);

  // Pagination must keep the active filters (the old links dropped listingId)
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (listingId) params.set("listingId", String(listingId));
    params.set("page", String(p));
    return `?${params.toString()}`;
  };

  // Map tenants for CSV export
  const exportData = tenants.map(t => ({
    "Name": t.name,
    "Phone": t.phone,
    "Email": t.email || "",
    "Status": t.status,
    "Property": t.listing.title,
    "Room": t.room?.name || "",
    "Monthly Rent": t.monthlyRent,
    "Check-in Date": t.checkInDate ? new Date(t.checkInDate).toLocaleDateString() : "",
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral-200/60">
        <div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight flex items-center gap-2 uppercase">
            <Users className="text-violet-600" size={20} />
            Tenant Directory
          </h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">
            {showingPast
              ? `${total} past tenants — inka record safe hai`
              : `${total} total tenants across all properties`}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <TenantFilters q={q} status={status} listingId={listingId} listings={listings} />
          <div className="w-px h-6 bg-neutral-200/60 hidden md:block"></div>
          <ImportCsvButton listings={listings} canImport={capabilities.csvImport} />
          <ExportCsvButton data={exportData} filename="Tenants_Export" canExport={capabilities.csvExport} />
          <Link href="/dashboard/manager/tenants/new" id="add-tenant-btn" className="btn-primary py-1.5 px-3 text-[10px] uppercase tracking-wider font-bold rounded-xl shadow-sm whitespace-nowrap flex items-center gap-1 hover:-translate-y-0.5 transition-transform">
            <Plus className="h-4 w-4" /> Add Tenant
          </Link>
        </div>
      </div>

      {/* Table */}
      {tenants.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
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
        <div className="mt-4 bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto pb-8 md:px-1 md:-mx-1">
            <table className="w-full text-sm text-left border-separate border-spacing-y-2 hidden md:table">
              <thead className="bg-white/40 border-b border-neutral-200/60">
                <tr className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">
                  <th className="px-6 py-3">Tenant</th>
                  <th className="px-6 py-3">PG / Room</th>
                  <th className="px-6 py-3">Rent</th>
                  <th className="px-6 py-3 hidden lg:table-cell">Check-in</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">This Month</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60">
                  {tenants.map((t) => {
                    const paid = t.payments.reduce((s, p) => s + p.amount, 0);
                    const due  = Math.max(0, t.monthlyRent - paid);
                    return (
                      <tr key={t.id} className="hover:bg-white/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-100/80 text-[10px] font-black text-violet-700 shadow-sm border border-violet-200/60">
                              {initials(t.name)}
                            </div>
                            <div>
                              <div className="font-black text-neutral-900 tracking-tight">{t.name}</div>
                              <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{t.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-neutral-900 font-black text-xs tracking-tight">{t.listing.title}</div>
                          {t.room && <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">Room {t.room.name}</div>}
                        </td>
                        <td className="px-6 py-4 font-black text-emerald-700">
                          {formatINR(t.monthlyRent)}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          {formatDate(t.checkInDate)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="px-6 py-4">
                          {due > 0 ? (
                            <span className="text-red-600 font-black text-xs">{formatINR(due)} <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">due</span></span>
                          ) : (
                            <span className="text-emerald-600 font-black text-xs">Paid ✓</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/dashboard/manager/tenants/${t.id}`} className="text-[10px] font-bold text-violet-700 uppercase tracking-wider hover:underline">
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="md:hidden flex flex-col space-y-4 p-4">
                {tenants.map((t) => {
                  const paid = t.payments.reduce((s, p) => s + p.amount, 0);
                  const due  = Math.max(0, t.monthlyRent - paid);
                  return (
                    <Link key={t.id} href={`/dashboard/manager/tenants/${t.id}`} className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-neutral-200/60 shadow-sm flex flex-col gap-3 hover:bg-white/80 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-100/80 text-[10px] font-black text-violet-700 shadow-sm border border-violet-200/60">
                            {initials(t.name)}
                          </div>
                          <div>
                            <div className="font-black text-neutral-900 tracking-tight">{t.name}</div>
                            <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">{t.phone}</div>
                          </div>
                        </div>
                        <StatusBadge status={t.status} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wider bg-white/40 p-3 rounded-xl border border-neutral-200/60">
                        <div>
                          <span className="font-bold text-neutral-400 block mb-1">Property</span>
                          <span className="font-black text-neutral-900 block truncate">{t.listing.title}</span>
                          {t.room && <span className="font-bold text-neutral-500 mt-0.5 block">Room {t.room.name}</span>}
                        </div>
                        <div>
                          <span className="font-bold text-neutral-400 block mb-1">Rent</span>
                          <span className="font-black text-emerald-700 block">{formatINR(t.monthlyRent)}</span>
                          {due > 0 ? (
                            <span className="text-[9px] text-red-600 font-black mt-0.5 block">{formatINR(due)} due</span>
                          ) : (
                            <span className="text-[9px] text-emerald-600 font-black mt-0.5 block">Paid ✓</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={pageHref(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-black transition-colors ${
                    p === page ? "bg-violet-600 text-white shadow-sm" : "bg-white/60 backdrop-blur-md border border-neutral-200/60 text-neutral-700 hover:bg-white/80"
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
