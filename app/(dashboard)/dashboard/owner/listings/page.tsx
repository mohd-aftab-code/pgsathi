import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { PlusCircle, Building2, MapPin, MessageSquare, Eye } from "lucide-react";
import { redirect } from "next/navigation";
import ListingActions from "@/components/listings/ListingActions";
import ListingReviewsToggle from "@/components/listings/ListingReviewsToggle";

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
          className="bg-neutral-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <PlusCircle size={20} /> Add New PG
        </Link>
      </div>

      <div className="mt-6">
        {listings.length > 0 ? (
          <div className="pb-10">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto px-1 -mx-1">
              <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-xs uppercase tracking-widest font-extrabold text-neutral-400">
                  <th className="pb-2 px-6">Property Details</th>
                  <th className="pb-2 px-6">Status & Type</th>
                  <th className="pb-2 px-6">Performance</th>
                  <th className="pb-2 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {listings.map((listing) => (
                  <tr key={listing.id} className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                    <td className="py-5 px-6 rounded-l-2xl border-y border-l border-neutral-100">
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
                    <td className="py-5 px-6 border-y border-neutral-100">
                      <div className="flex flex-col items-start gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                          listing.status === "ACTIVE" ? "bg-green-100 text-green-700 border border-green-200" :
                          listing.status === "PENDING" ? "bg-orange-100 text-orange-700 border border-orange-200" :
                          "bg-neutral-100 text-neutral-700 border border-neutral-200"
                        }`}>
                          {listing.status === "ACTIVE" ? "● Live" : "● " + listing.status}
                        </span>
                        <div className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200 inline-block">
                          <span className="capitalize">{listing.roomTypes?.map((r: string) => r.replace("_", " ")).join(", ").toLowerCase()}</span> • {listing.genderAllowed}
                        </div>
                        <ListingReviewsToggle listingId={listing.id} initialEnabled={listing.reviewsEnabled} />
                      </div>
                    </td>
                    <td className="py-5 px-6 border-y border-neutral-100">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-black text-neutral-900 flex items-center gap-1">
                            {listing._count.leads} <MessageSquare size={14} className="text-green-500" />
                          </span>
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Leads</span>
                        </div>
                        <div className="w-px h-8 bg-neutral-200"></div>
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-black text-neutral-900 flex items-center gap-1">
                            {listing.totalViews} <Eye size={14} className="text-purple-500" />
                          </span>
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Views</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 rounded-r-2xl border-y border-r border-neutral-100 text-right">
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

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-neutral-100 rounded-xl overflow-hidden shrink-0 border border-neutral-200">
                      {listing.photos && listing.photos.length > 0 ? (
                        <img src={listing.photos[0].url} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <Building2 size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/pg/${listing.slug}`} className="font-extrabold text-neutral-900 text-base hover:text-primary-600 transition-colors line-clamp-1">
                        {listing.title}
                      </Link>
                      <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1 line-clamp-1">
                        <MapPin size={12} className="shrink-0" /> {[listing.locality?.name, listing.city?.name].filter(Boolean).join(", ")}
                      </div>
                      <div className="text-xs font-bold text-neutral-900 mt-1.5">
                        ₹{listing.priceMin.toLocaleString("en-IN")} - ₹{listing.priceMax.toLocaleString("en-IN")} <span className="text-neutral-500 font-medium">/mo</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                      listing.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                      listing.status === "PENDING" ? "bg-orange-100 text-orange-700" :
                      "bg-neutral-100 text-neutral-700"
                    }`}>
                      {listing.status === "ACTIVE" ? "Live" : listing.status}
                    </span>
                    <div className="text-[10px] font-semibold text-neutral-600 bg-neutral-50 px-2 py-1 rounded-md border border-neutral-200">
                      <span className="capitalize">{listing.roomTypes?.map((r: string) => r.replace("_", " ")).join(", ").toLowerCase()}</span> • {listing.genderAllowed}
                    </div>
                    <ListingReviewsToggle listingId={listing.id} initialEnabled={listing.reviewsEnabled} />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} className="text-green-500" />
                        <span className="text-sm font-black text-neutral-900">{listing._count.leads}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={14} className="text-purple-500" />
                        <span className="text-sm font-black text-neutral-900">{listing.totalViews}</span>
                      </div>
                    </div>
                    <ListingActions
                      listingId={listing.id}
                      listingSlug={listing.slug}
                      status={listing.status}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-50/50 pointer-events-none"></div>
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-500 shadow-inner relative z-10">
              <Building2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-neutral-900 mb-3 relative z-10">No listings yet</h3>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto text-base font-medium relative z-10">You haven't added any properties yet. Create your first listing to start getting leads and maximizing occupancy.</p>
            <Link 
              href="/dashboard/owner/listings/new" 
              className="bg-neutral-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2 relative z-10"
            >
              <PlusCircle size={20} /> Create Your First Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
