import { db } from "@/lib/db";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import AdminListingActions from "./AdminListingActions";

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab || "pending";
  
  // Map tab to status
  let statusFilter: any = "PENDING";
  if (currentTab === "active") statusFilter = "ACTIVE";
  if (currentTab === "inactive") statusFilter = "INACTIVE";

  const listings = await db.listing.findMany({
    where: { status: statusFilter },
    include: {
      owner: { select: { name: true, phone: true } },
      city: true,
      locality: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 bg-gradient-to-r from-primary-950 to-primary-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <h1 className="text-3xl font-extrabold mb-2 relative z-10">Manage Listings</h1>
        <p className="text-primary-200 relative z-10">Review, approve, edit, and delete PGs across the platform.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-neutral-200 pb-2">
        <Link 
          href="?tab=pending" 
          className={`pb-2 px-4 font-bold transition-colors border-b-2 ${currentTab === "pending" ? "border-primary-600 text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}
        >
          Pending Review
        </Link>
        <Link 
          href="?tab=active" 
          className={`pb-2 px-4 font-bold transition-colors border-b-2 ${currentTab === "active" ? "border-primary-600 text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}
        >
          Active PGs
        </Link>
        <Link 
          href="?tab=inactive" 
          className={`pb-2 px-4 font-bold transition-colors border-b-2 ${currentTab === "inactive" ? "border-primary-600 text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}
        >
          Inactive / Deleted
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
        {listings.length > 0 ? (
          <div className="overflow-x-auto">
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
                        <span className="bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200">{listing.pgType?.replace("_", " ")}</span>
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
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
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
    </div>
  );
}
