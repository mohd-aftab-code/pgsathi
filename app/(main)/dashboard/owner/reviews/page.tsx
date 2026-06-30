import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Star, MessageSquare } from "lucide-react";

export default async function OwnerReviewsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Fetch reviews for this owner's listings
  const reviews = await db.review.findMany({
    where: {
      listing: {
        ownerId: Number(session.user.id)
      }
    },
    include: {
      user: {
        select: { name: true, avatar: true }
      },
      listing: {
        select: { title: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Tenant Reviews</h1>
        <p className="text-neutral-500">See what tenants are saying about your properties.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16 px-4 bg-neutral-50 rounded-xl border border-neutral-100">
          <div className="w-16 h-16 bg-neutral-200 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-1">No reviews yet</h3>
          <p className="text-neutral-500">When tenants review your PGs, they will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 rounded-xl border border-neutral-200 hover:border-primary-200 transition-colors bg-white">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                    {review.user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">{review.user?.name || "Anonymous User"}</div>
                    <div className="text-xs text-neutral-500">for {review.listing.title}</div>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "transparent"} className={i < review.rating ? "text-amber-400" : "text-neutral-300"} />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-neutral-600 text-sm italic bg-neutral-50 p-3 rounded-lg border border-neutral-100">"{review.comment}"</p>
              )}
              <div className="mt-3 text-xs text-neutral-400 text-right">
                {new Date(review.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric", month: "short", day: "numeric"
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
