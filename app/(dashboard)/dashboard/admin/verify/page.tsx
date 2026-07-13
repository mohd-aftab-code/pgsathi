import { db } from "@/lib/db";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import AdminListingActions from "./AdminListingActions";

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

  const whereClause: any = { status: statusFilter };
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
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Manage Listings</h1>
          <p className="text-neutral-500 mt-1">Review, approve, edit, and delete PGs across the platform.</p>
        </div>
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
        {listings.length > 0 ? (
          <>
            <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-xs uppercase tracking-wider font-bold text-neutral-700">
                  <th className="py-5 px-6">PG Details</th>
                  <th className="py-5 px-6">Owner Info</th>
                  <th className="py-5 px-6">Location</th>
                  <th className="py-5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {listings.map((listing) => (
                  <tr key={listing.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-neutral-900 mb-1 text-base">{listing.title}</div>
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
                        <span className="bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200">{listing.roomTypes?.map((r: string) => r.replace("_", " ")).join(", ")}</span>
                        <span className="bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200">{listing.genderAllowed}</span>
                        <span className="text-primary-700 font-bold">₹{listing.priceMin}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                          {listing.owner?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900">{listing.owner?.name || "Unknown"}</div>
                          <div className="text-xs text-neutral-500">{listing.owner?.phone || "No phone"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-neutral-600 font-medium">
                      {[listing.locality?.name, listing.city?.name].filter(Boolean).join(", ")}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/pg/${listing.slug}`} 
                          target="_blank"
                          className="cursor-pointer p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
                          title="Preview"
                        >
                          <Eye size={18} />
                        </Link>
                        <AdminListingActions listingId={listing.id} currentStatus={listing.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
            {listings.map((listing) => (
              <div key={`mob-${listing.id}`} className="bg-white border border-neutral-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                <div>
                  <div className="font-extrabold text-neutral-900 mb-1 text-base">{listing.title}</div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-neutral-700">
                    <span className="bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200">{listing.roomTypes?.map((r: string) => r.replace("_", " ")).join(", ")}</span>
                    <span className="bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200">{listing.genderAllowed}</span>
                    <span className="text-primary-700 font-bold">₹{listing.priceMin}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2 border-y border-neutral-50">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                    {listing.owner?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900 text-sm">{listing.owner?.name || "Unknown"}</div>
                    <div className="text-xs text-neutral-500">{listing.owner?.phone || "No phone"}</div>
                  </div>
                </div>
                <div className="text-sm text-neutral-600 font-medium">
                  {[listing.locality?.name, listing.city?.name].filter(Boolean).join(", ")}
                </div>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <Link 
                    href={`/pg/${listing.slug}`} 
                    target="_blank"
                    className="cursor-pointer p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
                    title="Preview"
                  >
                    <Eye size={18} />
                  </Link>
                  <AdminListingActions listingId={listing.id} currentStatus={listing.status} />
                </div>
              </div>
            ))}
          </div>
          </>
        ) : (
          <div className="p-16 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mb-6 text-neutral-400 shadow-inner border border-neutral-100">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-extrabold text-neutral-900 mb-2">No Listings Found</h3>
            <p className="text-neutral-500 max-w-sm">There are no listings in the '{currentTab}' category.</p>
          </div>
        )}
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
