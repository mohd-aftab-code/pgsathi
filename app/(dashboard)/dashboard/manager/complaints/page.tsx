/**
 * app/(main)/dashboard/manager/complaints/page.tsx
 */
import Link from "next/link";
import { Wrench, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireManagerAccess } from "@/lib/manager-auth";
import { StatusBadge } from "@/components/manage/StatusBadge";
import { EmptyState } from "@/components/manage/EmptyState";
import { formatDate } from "@/lib/manage-utils";
import { ComplaintActions } from "./ComplaintActions";

export const metadata = { title: "Complaints — PG Manager" };

export default async function ComplaintsPage({
  searchParams,
}: { searchParams: Promise<{ status?: string; listingId?: string }> }) {
  const sp    = await searchParams;
  const { userId } = await requireManagerAccess();
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
    db.listing.findMany({ where: { ownerId: userId }, select: { id: true, title: true } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Complaints</h1>
          <p className="text-sm text-neutral-500 mt-1">{complaints.length} total</p>
        </div>
        <ComplaintActions listings={listings} />
      </div>

      <form className="mb-5 flex flex-wrap gap-3">
        <select name="status" defaultValue={status} className="input-base max-w-[160px]">
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select name="listingId" defaultValue={listingId ?? ""} className="input-base max-w-[200px]">
          <option value="">All Properties</option>
          {listings.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        <button type="submit" className="btn-primary text-sm px-5">Filter</button>
      </form>

      {complaints.length === 0 ? (
        <div className="card">
          <EmptyState icon={Wrench} title="Koi complaint nahi" description="Sab theek chal raha hai! Ya filter change karein." />
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c.id} className="card p-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <StatusBadge status={c.priority} />
                  <StatusBadge status={c.status}   />
                  <span className="text-xs text-neutral-400">{c.category}</span>
                </div>
                <div className="font-semibold text-neutral-900">{c.title}</div>
                {c.description && <div className="mt-1 text-sm text-neutral-500 line-clamp-2">{c.description}</div>}
                <div className="mt-1 text-xs text-neutral-400">
                  {c.listing.title}{c.tenant && ` · ${c.tenant.name}`} · {formatDate(c.createdAt)}
                  {c.resolvedAt && ` · Resolved: ${formatDate(c.resolvedAt)}`}
                </div>
              </div>
              <ComplaintStatusUpdate complaintId={c.id} currentStatus={c.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ComplaintStatusUpdate({ complaintId, currentStatus }: { complaintId: number; currentStatus: string }) {
  // This is a server component placeholder — actual updates done via ComplaintActions
  return (
    <Link
      href={`?action=update&id=${complaintId}`}
      className="shrink-0"
    >
      {/* Quick update done via ComplaintActions client component */}
    </Link>
  );
}
