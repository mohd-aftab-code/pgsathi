import { db } from "@/lib/db";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import AdminListingActions from "./AdminListingActions";
import AdminListingsTableWrapper from "./AdminListingsTableWrapper";

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string, page?: string, query?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab || "pending";
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const query = resolvedSearchParams.query || "";
  const pageSize = 10;
  
  // Map tab to status
  let statusFilter: any = "PENDING";
  if (currentTab === "active") statusFilter = "ACTIVE";
  if (currentTab === "inactive") statusFilter = "INACTIVE";

  const whereClause: any = currentTab === "updated"
    ? { status: "ACTIVE", hasPendingChanges: true }
    : { status: statusFilter };
  if (query) {
    whereClause.title = { contains: query, mode: "insensitive" };
  }

  const [listings, totalCount] = await Promise.all([
    db.listing.findMany({
      where: whereClause,
      include: {
        owner: { select: { name: true, phone: true } },
        city: true,
        locality: true,
        // Who brought this PG in — the admin should know a listing is
        // partner-sourced before approving it.
        partner: { select: { id: true, partnerCode: true, user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    db.listing.count({ where: whereClause })
  ]);
  
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Manage Listings</h1>
          <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">Review, approve, edit, and delete PGs across the platform.</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex gap-1 overflow-x-auto pb-1 hide-scrollbar">
          {[
            { id: "pending", label: "Pending Review" },
            { id: "active", label: "Active PGs" },
            { id: "updated", label: "Updated" },
            { id: "inactive", label: "Inactive" },
          ].map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`?tab=${tab.id}&query=${query}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all shadow-2xs ${
                  isActive
                    ? "bg-violet-600 text-white shadow-xs"
                    : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <form method="GET" className="flex items-center gap-2 w-full md:w-auto">
          <input type="hidden" name="tab" value={currentTab} />
          <input 
            type="text" 
            name="query" 
            defaultValue={query} 
            placeholder="Search PGs by name..." 
            className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold placeholder:text-slate-400 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-2xs"
          />
          <button type="submit" className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs uppercase tracking-wider font-bold hover:bg-slate-800 transition-colors cursor-pointer shadow-xs shrink-0">
            Search
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <AdminListingsTableWrapper listings={listings} currentTab={currentTab} />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Showing <span className="font-black text-slate-900">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-black text-slate-900">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-black text-slate-900">{totalCount}</span> PGs
          </div>
          <div className="flex gap-1">
            {currentPage > 1 && (
              <Link href={`?tab=${currentTab}&query=${query}&page=${currentPage - 1}`} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-violet-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg transition-all uppercase tracking-wider shadow-2xs">
                Prev
              </Link>
            )}
            {currentPage < totalPages && (
              <Link href={`?tab=${currentTab}&query=${query}&page=${currentPage + 1}`} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-violet-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg transition-all uppercase tracking-wider shadow-2xs">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
