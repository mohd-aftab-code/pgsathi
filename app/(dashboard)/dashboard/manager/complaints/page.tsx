/**
 * app/(main)/dashboard/manager/complaints/page.tsx
 */
import { Wrench } from "lucide-react";
import { db } from "@/lib/db";
import { requireManagerAccess, listingScope } from "@/lib/manager-auth";
import { StatusBadge } from "@/components/manage/StatusBadge";
import { EmptyState } from "@/components/manage/EmptyState";
import { formatDate } from "@/lib/manage-utils";
import { ComplaintActions, ComplaintStatusSelect } from "./ComplaintActions";

export const metadata = { title: "Complaints — PG Manager" };

export default async function ComplaintsPage({
  searchParams,
}: { searchParams: Promise<{ status?: string; listingId?: string }> }) {
  const sp    = await searchParams;
  const { userId, allowedListingIds } = await requireManagerAccess();
  const status   = sp.status ?? "";
  const listingId = sp.listingId ? parseInt(sp.listingId) : undefined;

  const where: any = { ownerId: userId };
  if (status)    where.status    = status;
  if (listingId) where.listingId = listingId;

  const [complaints, listings] = await Promise.all([
    db.pgComplaint.findMany({
      where, orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
      include: {
        listing: { select: { id: true, title: true } },
        tenant:  { select: { id: true, name: true } },
      },
    }),
    db.listing.findMany({ where: { ownerId: userId, ...listingScope({ allowedListingIds }, "id") }, select: { id: true, title: true } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Complaints</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">{complaints.length} total</p>
        </div>
        <ComplaintActions listings={listings} />
      </div>

      <form className="mb-5 flex flex-wrap gap-2 sm:gap-3">
        <select name="status" defaultValue={status} className="input-base flex-1 min-w-[130px] sm:max-w-[160px] bg-white/60 backdrop-blur-md shadow-sm rounded-xl text-xs font-bold py-2">
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select name="listingId" defaultValue={listingId ?? ""} className="input-base flex-1 min-w-[150px] sm:max-w-[200px] bg-white/60 backdrop-blur-md shadow-sm rounded-xl text-xs font-bold py-2">
          <option value="">All Properties</option>
          {listings.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        <button type="submit" className="btn-primary text-xs font-bold px-5 py-2 rounded-xl shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">Filter</button>
      </form>

      {complaints.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-md p-12 sm:p-16 rounded-2xl shadow-sm border border-neutral-200/60 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-50/30 pointer-events-none"></div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-violet-100/80 rounded-full flex items-center justify-center mx-auto mb-5 text-violet-600 relative z-10 shadow-sm border border-violet-200/60">
            <Wrench size={32} />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mb-2 relative z-10 tracking-tight">No issues found</h3>
          <p className="text-neutral-500 max-w-md mx-auto text-xs sm:text-sm font-medium relative z-10">Everything is running smoothly! Or try changing your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white/70 backdrop-blur-md p-3.5 sm:p-5 rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-violet-200/60 hover:bg-white/80 transition-all duration-300 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  <StatusBadge status={c.priority} />
                  <StatusBadge status={c.status}   />
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{c.category}</span>
                </div>
                <div className="font-black text-neutral-900 text-sm tracking-tight">{c.title}</div>
                {c.description && <div className="mt-1 text-[11px] font-medium text-neutral-500 line-clamp-2">{c.description}</div>}
                <div className="mt-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex flex-wrap gap-1">
                  <span>{c.listing.title}</span>
                  {c.tenant && <span>· {c.tenant.name}</span>}
                  <span>· {formatDate(c.createdAt)}</span>
                  {c.resolvedAt && <span className="text-emerald-600">· Resolved: {formatDate(c.resolvedAt)}</span>}
                </div>
              </div>
              <div className="pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 flex items-center justify-end">
                <ComplaintStatusSelect complaintId={c.id} currentStatus={c.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
