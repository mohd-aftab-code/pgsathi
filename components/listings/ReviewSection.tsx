"use client";

import { useState } from "react";
import { Star, ShieldCheck, User } from "lucide-react";
import ReviewForm from "./ReviewForm";
import { formatDistanceToNow } from "date-fns";

type ReviewData = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  isVerified: boolean;
  user: { name: string; avatar: string | null };
};

export default function ReviewSection({
  listingId,
  reviews,
  avgRating,
  totalReviews,
  isLoggedIn
}: {
  listingId: number;
  reviews: ReviewData[];
  avgRating: number;
  totalReviews: number;
  isLoggedIn: boolean;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mt-12 bg-white rounded-3xl border border-neutral-200 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-neutral-900 flex items-center gap-2">
            <Star className="text-amber-400 fill-amber-400" size={28} />
            {avgRating > 0 ? avgRating.toFixed(1) : "No Ratings Yet"}
          </h2>
          <p className="text-neutral-500 font-medium mt-1">
            {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"} from tenants
          </p>
        </div>
        
        {isLoggedIn ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary py-2.5 px-5 rounded-xl font-bold text-sm shadow-sm whitespace-nowrap"
          >
            {showForm ? "Cancel Review" : "Write a Review"}
          </button>
        ) : (
          <a href={`/login?callbackUrl=/pg/review/${listingId}`} className="btn-secondary py-2.5 px-5 rounded-xl font-bold text-sm text-center">
            Login to Review
          </a>
        )}
      </div>

      {showForm && (
        <ReviewForm 
          listingId={listingId} 
          onCancel={() => setShowForm(false)} 
          onSuccess={() => setShowForm(false)} 
        />
      )}

      <div className="space-y-6 mt-6">
        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
            <p className="text-neutral-500 font-medium">Be the first to review this PG!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
                      {review.user.avatar ? (
                        <img src={review.user.avatar} alt={review.user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        review.user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                        {review.user.name}
                        {review.isVerified && (
                          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                            <ShieldCheck size={10} /> Verified
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 font-medium">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < review.rating ? "fill-amber-400" : "text-neutral-300"} />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-neutral-600 text-sm leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
