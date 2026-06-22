import { db } from "@/lib/db";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import AdminListingActions from "./AdminListingActions";

export default async function AdminListingsPage() {
  // Fetch pending listings by default
  const pendingListings = await db.listing.findMany({
    where: { status: "PENDING" },
    include: {
      owner: { select: { name: true, phone: true } },
      city: true,
      locality: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Verify Listings</h1>
        <p className="text-neutral-500">Review and approve newly submitted PGs.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        {pendingListings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-sm text-neutral-500">
                  <th className="py-4 px-6 font-semibold">PG Details</th>
                  <th className="py-4 px-6 font-semibold">Owner Info</th>
                  <th className="py-4 px-6 font-semibold">Location</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {pendingListings.map((listing) => (
                  <tr key={listing.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-4 px-6">
                      <div className="font-bold text-neutral-900 mb-1">{listing.title}</div>
                      <div className="text-xs text-neutral-500">
                        {listing.pgType?.replace("_", " ")} • {listing.genderAllowed} • ₹{listing.priceMin}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-neutral-600">
                      <div className="font-medium text-neutral-900">{listing.owner?.name || "Unknown"}</div>
                      <div className="text-xs text-neutral-500">{listing.owner?.phone || "No phone"}</div>
                    </td>
                    <td className="py-4 px-6 text-neutral-600">
                      {listing.locality?.name}, {listing.city?.name}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/pg/${listing.slug}`} 
                          target="_blank"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Preview"
                        >
                          <Eye size={18} />
                        </Link>
                        {/* Client Component for Actions */}
                        <AdminListingActions listingId={listing.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">All Caught Up!</h3>
            <p className="text-neutral-500">There are no pending listings to review right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
