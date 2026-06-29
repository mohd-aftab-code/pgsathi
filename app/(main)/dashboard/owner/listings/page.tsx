import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { PlusCircle, Building2, MapPin, MessageSquare, Eye } from "lucide-react";
import { redirect } from "next/navigation";
import ListingActions from "@/components/listings/ListingActions";

export const metadata = {
  title: "My Listings - Owner Dashboard",
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
      photos: {
        take: 1,
        orderBy: { sortOrder: "asc" }
      },
      _count: {
        select: { leads: true }
      }
    },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">My Listings</h1>
          <p className="text-neutral-500 mt-1">Manage your properties, edit details, and track performance.</p>
        </div>
        <Link 
          href="/dashboard/owner/listings/new" 
          className="bg-neutral-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <PlusCircle size={20} /> Add New PG
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
        {listings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-xs uppercase tracking-wider font-bold text-neutral-500">
                  <th className="py-5 px-6">Property Details</th>
                  <th className="py-5 px-6">Status & Type</th>
                  <th className="py-5 px-6">Performance</th>
                  <th className="py-5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {listings.map((listing) => (
                  <tr key={listing.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors group">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-neutral-100 rounded-xl overflow-hidden shrink-0 border border-neutral-200">
                          {listing.photos && listing.photos.length > 0 ? (
                            <img src={listing.photos[0].url} alt={listing.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                              <Building2 size={24} />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link href={`/pg/${listing.slug}`} className="font-extrabold text-neutral-900 text-base hover:text-primary-600 transition-colors line-clamp-1">
                            {listing.title}
                          </Link>
                          <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                            <MapPin size={12} /> {[listing.locality?.name, listing.city?.name].filter(Boolean).join(", ")}
                          </div>
                          <div className="text-xs font-bold text-neutral-900 mt-1.5">
                            ₹{listing.priceMin.toLocaleString("en-IN")} - ₹{listing.priceMax.toLocaleString("en-IN")} <span className="text-neutral-500 font-medium">/mo</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col items-start gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                          listing.status === "ACTIVE" ? "bg-green-100 text-green-700 border border-green-200" :
                          listing.status === "PENDING" ? "bg-orange-100 text-orange-700 border border-orange-200" :
                          "bg-neutral-100 text-neutral-700 border border-neutral-200"
                        }`}>
                          {listing.status === "ACTIVE" ? "● Live" : "● " + listing.status}
                        </span>
                        <div className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200 inline-block">
                          <span className="capitalize">{listing.pgType.replace("_", " ").toLowerCase()}</span> • {listing.genderAllowed}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-black text-neutral-900 flex items-center gap-1">
                            {listing._count.leads} <MessageSquare size={14} className="text-green-500" />
                          </span>
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Leads</span>
                        </div>
                        <div className="w-px h-8 bg-neutral-200"></div>
                        <div className="flex flex-col items-center opacity-50">
                          <span className="text-lg font-black text-neutral-900 flex items-center gap-1">
                            -- <Eye size={14} className="text-purple-500" />
                          </span>
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Views</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <ListingActions
                        listingId={listing.id}
                        listingSlug={listing.slug}
                        status={listing.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400">
              <Building2 size={36} />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">No listings yet</h3>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto text-lg">You haven't added any properties yet. Create your first listing to start getting leads.</p>
            <Link 
              href="/dashboard/owner/listings/new" 
              className="bg-neutral-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              <PlusCircle size={20} /> Create Your First Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
