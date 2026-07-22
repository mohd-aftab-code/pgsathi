/**
 * app/(main)/dashboard/manager/tenants/page.tsx
 * Tenants list page with search, status filter, and pagination.
 */
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { db } from "@/lib/db";
import { requireManagerAccess } from "@/lib/manager-auth";
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
  const { userId, tier } = await requireManagerAccess();
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
      <div className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Users className="text-violet-600" size={20} />
            Tenant Directory
          </h1>
          <p className="text-xs text-neutral-500 mt-1 font-medium">{total} total tenants across all properties</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <TenantFilters q={q} status={status} listingId={listingId} listings={listings} />
          <div className="w-px h-6 bg-neutral-200 hidden md:block"></div>
          <ImportCsvButton listings={listings} canImport={tier === "PRO" || tier === "SCALE" || tier === "ENTERPRISE"} />
          <ExportCsvButton data={exportData} filename="Tenants_Export" tier={tier} />
          <Link href="/dashboard/manager/tenants/new" id="add-tenant-btn" className="btn-primary py-1.5 px-3 text-sm font-semibold rounded-lg shadow-sm whitespace-nowrap flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Tenant
          </Link>
        </div>
      </div>

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
        <div className="mt-4">
          <div className="overflow-x-auto pb-8 md:px-1 md:-mx-1">
            <table className="w-full text-sm text-left border-separate border-spacing-y-3 hidden md:table">
              <thead>
                <tr className="text-xs uppercase tracking-widest font-extrabold text-neutral-400">
                  <th className="px-6 py-3">Tenant</th>
                  <th className="px-6 py-3">PG / Room</th>
                  <th className="px-6 py-3">Rent</th>
                  <th className="px-6 py-3 hidden lg:table-cell">Check-in</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">This Month</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                  {tenants.map((t) => {
                    const paid = t.payments.reduce((s, p) => s + p.amount, 0);
                    const due  = Math.max(0, t.monthlyRent - paid);
                    return (
                      <tr key={t.id} className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 group">
                        <td className="px-6 py-4 rounded-l-2xl border-y border-l border-neutral-100">
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
                        <td className="px-6 py-4 border-y border-neutral-100">
                          <div className="text-neutral-900 font-medium text-xs">{t.listing.title}</div>
                          {t.room && <div className="text-xs text-neutral-400">Room {t.room.name}</div>}
                        </td>
                        <td className="px-6 py-4 font-semibold text-neutral-900 border-y border-neutral-100">
                          {formatINR(t.monthlyRent)}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-neutral-500 text-xs border-y border-neutral-100">
                          {formatDate(t.checkInDate)}
                        </td>
                        <td className="px-6 py-4 border-y border-neutral-100">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="px-6 py-4 border-y border-neutral-100">
                          {due > 0 ? (
                            <span className="text-red-600 font-semibold text-xs">{formatINR(due)} due</span>
                          ) : (
                            <span className="text-green-600 font-semibold text-xs">Paid ✓</span>
                          )}
                        </td>
                        <td className="px-6 py-4 rounded-r-2xl border-y border-r border-neutral-100 text-right">
                          <Link href={`/dashboard/manager/tenants/${t.id}`} className="text-xs font-semibold text-primary-700 hover:underline">
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="md:hidden flex flex-col space-y-4">
                {tenants.map((t) => {
                  const paid = t.payments.reduce((s, p) => s + p.amount, 0);
                  const due  = Math.max(0, t.monthlyRent - paid);
                  return (
                    <Link key={t.id} href={`/dashboard/manager/tenants/${t.id}`} className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                            {initials(t.name)}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900">{t.name}</div>
                            <div className="text-xs text-neutral-500">{t.phone}</div>
                          </div>
                        </div>
                        <StatusBadge status={t.status} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <div>
                          <span className="text-xs text-neutral-400 block mb-0.5">Property</span>
                          <span className="font-semibold text-neutral-700 block truncate">{t.listing.title}</span>
                          {t.room && <span className="text-xs text-neutral-500">Room {t.room.name}</span>}
                        </div>
                        <div>
                          <span className="text-xs text-neutral-400 block mb-0.5">Rent</span>
                          <span className="font-semibold text-neutral-900 block">{formatINR(t.monthlyRent)}</span>
                          {due > 0 ? (
                            <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 rounded">{formatINR(due)} due</span>
                          ) : (
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 rounded">Paid ✓</span>
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
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    p === page ? "bg-primary-500 text-white" : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
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
