import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { PlusCircle, Edit, Eye, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Listings - PGSathi",
};

export default async function OwnerListingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const listings = await db.listing.findMany({
    where: { ownerId: parseInt(session.user.id!) },
    orderBy: { createdAt: "desc" },
    include: {
      city: true,
      locality: true,
    },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Listings</h1>
          <p className="text-neutral-500">Manage all your properties from here.</p>
        </div>
        <Link 
          href="/dashboard/owner/listings/new" 
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle size={20} /> Add New PG
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        {listings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-sm text-neutral-500">
                  <th className="py-4 px-6 font-semibold">Property</th>
                  <th className="py-4 px-6 font-semibold">Location</th>
                  <th className="py-4 px-6 font-semibold">Type</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {listings.map((listing) => (
                  <tr key={listing.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-4 px-6">
                      <div className="font-bold text-neutral-900">{listing.title}</div>
                      <div className="text-xs text-neutral-500 mt-1">₹{listing.priceMin} - ₹{listing.priceMax}/mo</div>
                    </td>
                    <td className="py-4 px-6 text-neutral-600">
                      {listing.locality?.name}, {listing.city?.name}
                    </td>
                    <td className="py-4 px-6 text-neutral-600">
                      <span className="capitalize">{listing.pgType.replace("_", " ").toLowerCase()}</span>
                      <div className="text-xs mt-1 bg-neutral-100 inline-block px-2 py-0.5 rounded text-neutral-600">
                        {listing.genderAllowed}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        listing.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                        listing.status === "PENDING" ? "bg-orange-100 text-orange-700" :
                        "bg-neutral-100 text-neutral-700"
                      }`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/pg/${listing.slug}`} className="text-neutral-400 hover:text-primary-600 transition-colors" title="View">
                          <Eye size={18} />
                        </Link>
                        <Link href={`/dashboard/owner/listings/${listing.id}/edit`} className="text-neutral-400 hover:text-blue-600 transition-colors" title="Edit">
                          <Edit size={18} />
                        </Link>
                        <button className="text-neutral-400 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <Building2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">No listings yet</h3>
            <p className="text-neutral-500 mb-6">You haven't added any properties yet.</p>
            <Link 
              href="/dashboard/owner/listings/new" 
              className="bg-primary-50 text-primary-700 px-6 py-2.5 rounded-xl font-bold transition-colors inline-flex items-center gap-2 hover:bg-primary-100"
            >
              <PlusCircle size={20} /> Create Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Temporary placeholder since Building2 wasn't imported initially
import { Building2 } from "lucide-react";
