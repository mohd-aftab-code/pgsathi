import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Star, ShieldCheck, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Reviews | PGSathi Owner Dashboard",
};

export default async function OwnerReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = parseInt(session.user.id);

  // Get all reviews for PGs owned by this user
  const reviews = await db.review.findMany({
    where: {
      listing: { ownerId: userId }
    },
    include: {
      user: { select: { name: true, avatar: true } },
      listing: { select: { title: true, slug: true, city: { select: { slug: true } }, locality: { select: { slug: true } } } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Guest Reviews</h1>
          <p className="text-neutral-500 mt-1">See what your tenants are saying about your PGs.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-16 text-center">
            <Star size={48} className="mx-auto text-neutral-200 mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No reviews yet</h3>
            <p className="text-neutral-500">Your PG reviews will appear here once tenants start reviewing.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 md:p-8 hover:bg-neutral-50 transition-colors">
                <div className="flex flex-col md:flex-row gap-6">
                  
                  {/* Left Column - Tenant Info */}
                  <div className="w-full md:w-64 shrink-0 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-lg overflow-hidden shrink-0">
                      {review.user.avatar ? (
                        <img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover" />
                      ) : (
                        review.user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{review.user.name}</p>
                      {review.isVerified && (
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-green-700 bg-green-100 px-1.5 py-0.5 rounded mt-1 w-max">
                          <ShieldCheck size={10} /> Verified Tenant
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-neutral-400 mt-2 font-medium">
                        <Clock size={12} /> {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={18} className={i < review.rating ? "fill-amber-400" : "text-neutral-200"} />
                        ))}
                      </div>
                      <a 
                        href={`/pg/${review.listing.city?.slug}/${review.listing.locality?.slug || "all"}/${review.listing.slug}`}
                        target="_blank"
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        {review.listing.title}
                      </a>
                    </div>
                    
                    {review.comment ? (
                      <p className="text-neutral-700 leading-relaxed text-sm">{review.comment}</p>
                    ) : (
                      <p className="text-neutral-400 italic text-sm">No written feedback provided.</p>
                    )}
                    
                    {!review.isApproved && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-xs font-semibold text-amber-800">
                          This review is pending moderation as the user is not a verified tenant for this PG.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
