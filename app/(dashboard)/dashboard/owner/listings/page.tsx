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

export default async function OwnerListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const page = Math.max(1, parseInt(typeof sp.page === 'string' ? sp.page : "1"));
  const pageSize = 10;
  
  const ownerId = parseInt(session.user.id!);

  const [totalListings, listings] = await Promise.all([
    db.listing.count({ where: { ownerId } }),
    db.listing.findMany({
      where: { ownerId },
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
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
  ]);

  const totalPages = Math.max(1, Math.ceil(totalListings / pageSize));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">My Listings</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Manage your properties, edit details, and track performance.</p>
        </div>
        <Link 
          href="/dashboard/owner/listings/new" 
          className="bg-violet-600 hover:bg-violet-700 text-white h-8 px-4 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1.5 shrink-0"
        >
          <PlusCircle size={14} /> Add New PG
        </Link>
      </div>

      <div className="mt-4">
        {listings.length > 0 ? (
          <div className="pb-8">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto px-1 -mx-1">
              <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[9px] uppercase tracking-widest font-black text-neutral-400 bg-neutral-50/40">
                  <th className="py-2.5 px-4 rounded-l-lg border-y border-l border-neutral-100/60">Property Details</th>
                  <th className="py-2.5 px-4 border-y border-neutral-100/60">Status & Type</th>
                  <th className="py-2.5 px-4 border-y border-neutral-100/60">Performance</th>
                  <th className="py-2.5 px-4 text-right rounded-r-lg border-y border-r border-neutral-100/60">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {listings.map((listing) => (
                  <tr key={listing.id} className="bg-white/60 backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                    <td className="py-3 px-4 rounded-l-xl border-y border-l border-neutral-200/60">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-neutral-100 rounded-2xl overflow-hidden shrink-0 border border-neutral-200/60">
                          {listing.photos && listing.photos.length > 0 ? (
                            <img src={listing.photos[0].url} alt={listing.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                              <Building2 size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link href={`/pg/${listing.slug}`} className="font-bold text-neutral-900 text-[13px] hover:text-violet-700 transition-colors line-clamp-1">
                            {listing.title}
                          </Link>
                          <div className="text-[10px] text-neutral-500 mt-0.5 flex items-center gap-1 uppercase tracking-wider font-bold">
                            <MapPin size={10} /> {[listing.locality?.name, listing.city?.name].filter(Boolean).join(", ")}
                          </div>
                          <div className="text-[11px] font-black text-neutral-900 mt-1">
                            ₹{listing.priceMin.toLocaleString("en-IN")} - ₹{listing.priceMax.toLocaleString("en-IN")} <span className="text-neutral-500 font-medium">/mo</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-y border-neutral-200/60">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className={`px-2 py-0.5 rounded-xl text-[9px] uppercase tracking-wider font-bold ${
                          listing.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" :
                          listing.status === "PENDING" ? "bg-amber-50 text-amber-700 border border-amber-200/60" :
                          "bg-neutral-50 text-neutral-600 border border-neutral-200/60"
                        }`}>
                          {listing.status === "ACTIVE" ? "● Live" : "● " + listing.status}
                        </span>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-600 bg-white/60 backdrop-blur-md border border-neutral-200/80 px-2 py-0.5 rounded-xl inline-block">
                          <span className="capitalize">{listing.roomTypes?.map((r: string) => r.replace("_", " ")).join(", ").toLowerCase()}</span> • {listing.genderAllowed}
                        </div>
                        <ListingReviewsToggle listingId={listing.id} initialEnabled={listing.reviewsEnabled} />
                      </div>
                    </td>
                    <td className="py-3 px-4 border-y border-neutral-200/60">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-black text-neutral-900 flex items-center gap-1">
                            {listing._count.leads} <MessageSquare size={12} className="text-emerald-500" />
                          </span>
                          <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Leads</span>
                        </div>
                        <div className="w-px h-6 bg-neutral-200/80"></div>
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-black text-neutral-900 flex items-center gap-1">
                            {listing.totalViews} <Eye size={12} className="text-violet-500" />
                          </span>
                          <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Views</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 rounded-r-xl border-y border-r border-neutral-200/60 text-right">
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
            <div className="md:hidden space-y-3">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-neutral-200/60 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-neutral-100 rounded-2xl overflow-hidden shrink-0 border border-neutral-200/60">
                      {listing.photos && listing.photos.length > 0 ? (
                        <img src={listing.photos[0].url} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <Building2 size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/pg/${listing.slug}`} className="font-bold text-neutral-900 text-sm hover:text-violet-700 transition-colors line-clamp-1">
                        {listing.title}
                      </Link>
                      <div className="text-[10px] text-neutral-500 mt-0.5 flex items-center gap-1 uppercase tracking-wider font-bold line-clamp-1">
                        <MapPin size={10} className="shrink-0" /> {[listing.locality?.name, listing.city?.name].filter(Boolean).join(", ")}
                      </div>
                      <div className="text-[11px] font-black text-neutral-900 mt-1">
                        ₹{listing.priceMin.toLocaleString("en-IN")} - ₹{listing.priceMax.toLocaleString("en-IN")} <span className="text-neutral-500 font-medium">/mo</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`px-2 py-0.5 rounded-xl text-[9px] uppercase tracking-wider font-bold ${
                      listing.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" :
                      listing.status === "PENDING" ? "bg-amber-50 text-amber-700 border border-amber-200/60" :
                      "bg-neutral-50 text-neutral-600 border border-neutral-200/60"
                    }`}>
                      {listing.status === "ACTIVE" ? "Live" : listing.status}
                    </span>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-600 bg-white/60 backdrop-blur-md border border-neutral-200/80 px-2 py-0.5 rounded-xl inline-block">
                      <span className="capitalize">{listing.roomTypes?.map((r: string) => r.replace("_", " ")).join(", ").toLowerCase()}</span> • {listing.genderAllowed}
                    </div>
                    <ListingReviewsToggle listingId={listing.id} initialEnabled={listing.reviewsEnabled} />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100/60">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={12} className="text-emerald-500" />
                        <span className="text-xs font-black text-neutral-900">{listing._count.leads}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={12} className="text-violet-500" />
                        <span className="text-xs font-black text-neutral-900">{listing.totalViews}</span>
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-2">
                <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span></span>
                <div className="flex gap-1">
                  <Link
                    href={`/dashboard/owner/listings?page=${page - 1}`}
                    aria-disabled={page <= 1}
                    className={`flex items-center gap-1 text-[10px] font-bold border border-neutral-200/60 px-2.5 py-1.5 rounded-xl transition-all uppercase tracking-wider ${page <= 1 ? "opacity-40 pointer-events-none text-neutral-400 bg-neutral-50/50" : "text-neutral-600 hover:text-violet-700 bg-white/60 backdrop-blur-md"}`}
                  >
                    Prev
                  </Link>
                  <Link
                    href={`/dashboard/owner/listings?page=${page + 1}`}
                    aria-disabled={page >= totalPages}
                    className={`flex items-center gap-1 text-[10px] font-bold border border-neutral-200/60 px-2.5 py-1.5 rounded-xl transition-all uppercase tracking-wider ${page >= totalPages ? "opacity-40 pointer-events-none text-neutral-400 bg-neutral-50/50" : "text-neutral-600 hover:text-violet-700 bg-white/60 backdrop-blur-md"}`}
                  >
                    Next
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-neutral-200/60 p-12 text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4 text-violet-400 relative z-10">
              <Building2 size={24} />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-2 relative z-10">No listings yet</h3>
            <p className="text-neutral-500 mb-6 max-w-sm mx-auto text-[10px] font-bold uppercase tracking-wider relative z-10">You haven't added any properties yet. Create your first listing to start getting leads and maximizing occupancy.</p>
            <Link 
              href="/dashboard/owner/listings/new" 
              className="bg-violet-600 hover:bg-violet-700 text-white h-9 px-6 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors shadow-sm inline-flex items-center gap-2 relative z-10"
            >
              <PlusCircle size={14} /> Create Your First Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
