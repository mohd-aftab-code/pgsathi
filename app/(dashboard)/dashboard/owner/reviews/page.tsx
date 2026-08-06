import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Star, ShieldCheck, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { moderateReviewAction } from "@/app/actions/reviews";

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

      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-12 text-center bg-white/40">
            <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4 text-violet-400">
              <Star size={24} />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-2">No reviews yet</h3>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider max-w-sm mx-auto">Your PG reviews will appear here once tenants start reviewing.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100/60">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 md:p-6 hover:bg-white/40 transition-colors">
                <div className="flex flex-col md:flex-row gap-4">
                  
                  {/* Left Column - Tenant Info */}
                  <div className="w-full md:w-56 shrink-0 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center font-bold text-violet-700 text-sm overflow-hidden shrink-0 border border-violet-200">
                      {review.user.avatar ? (
                        <img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover" />
                      ) : (
                        review.user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 text-xs">{review.user.name}</p>
                      {review.isVerified && (
                        <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded mt-0.5 w-max">
                          <ShieldCheck size={10} /> Verified
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-neutral-500 mt-1 font-bold">
                        <Clock size={10} /> {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? "fill-amber-400" : "text-neutral-200"} />
                        ))}
                      </div>
                      <a 
                        href={`/pg/${review.listing.city?.slug}/${review.listing.locality?.slug || "all"}/${review.listing.slug}`}
                        target="_blank"
                        className="text-[10px] font-bold text-violet-600 hover:text-violet-700 hover:underline uppercase tracking-wider"
                      >
                        {review.listing.title}
                      </a>
                    </div>
                    
                    {review.comment ? (
                      <p className="text-neutral-700 leading-relaxed text-[10px] font-bold uppercase tracking-wider">{review.comment}</p>
                    ) : (
                      <p className="text-neutral-400 italic text-[10px] font-bold uppercase tracking-wider">No written feedback provided.</p>
                    )}
                    
                    {!review.isApproved && (
                      <div className="mt-3 p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl">
                        <p className="text-[10px] font-bold text-amber-800 mb-2 uppercase tracking-wider">
                          Pending Moderation
                        </p>
                        <div className="flex items-center gap-2">
                          <form action={async () => { "use server"; await moderateReviewAction(review.id, "APPROVE"); }}>
                            <button type="submit" className="cursor-pointer px-2.5 py-1.5 rounded-2xl text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 hover:bg-emerald-200 transition-colors uppercase tracking-wider">
                              Approve
                            </button>
                          </form>
                          <form action={async () => { "use server"; await moderateReviewAction(review.id, "REJECT"); }}>
                            <button type="submit" className="cursor-pointer px-2.5 py-1.5 rounded-2xl text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-200 hover:bg-rose-200 transition-colors uppercase tracking-wider">
                              Reject
                            </button>
                          </form>
                        </div>
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
