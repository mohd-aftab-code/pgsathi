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
    whereClause.title = { contains: query };
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
      <div className="mb-5 bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <h1 className="text-2xl font-extrabold mb-1">Manage Listings</h1>
        <p className="text-neutral-300 text-sm">Review, approve, edit, and delete PGs across the platform.</p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-neutral-200 pb-4">
        <div className="flex gap-4 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <Link 
            href={`?tab=pending&query=${query}`} 
            className={`pb-2 px-4 font-bold transition-colors border-b-2 ${currentTab === "pending" ? "border-primary-600 text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}
          >
            Pending Review
          </Link>
          <Link
            href={`?tab=active&query=${query}`}
            className={`pb-2 px-4 font-bold transition-colors border-b-2 ${currentTab === "active" ? "border-primary-600 text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}
          >
            Active PGs
          </Link>
          <Link
            href={`?tab=updated&query=${query}`}
            className={`pb-2 px-4 font-bold transition-colors border-b-2 ${currentTab === "updated" ? "border-primary-600 text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}
          >
            Updated Since Verified
          </Link>
          <Link
            href={`?tab=inactive&query=${query}`} 
            className={`pb-2 px-4 font-bold transition-colors border-b-2 ${currentTab === "inactive" ? "border-primary-600 text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}
          >
            Inactive / Deleted
          </Link>
        </div>
        <form method="GET" className="flex items-center gap-2 w-full md:w-auto">
          <input type="hidden" name="tab" value={currentTab} />
          <input 
            type="text" 
            name="query" 
            defaultValue={query} 
            placeholder="Search PGs..." 
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button type="submit" className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 cursor-pointer">
            Search
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
        <AdminListingsTableWrapper listings={listings} currentTab={currentTab} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-neutral-500">
            Showing <span className="font-bold">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-bold">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-bold">{totalCount}</span> PGs
          </div>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={`?tab=${currentTab}&query=${query}&page=${currentPage - 1}`} className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-semibold hover:bg-neutral-50">
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link href={`?tab=${currentTab}&query=${query}&page=${currentPage + 1}`} className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-semibold hover:bg-neutral-50">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
