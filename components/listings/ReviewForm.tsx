"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { submitReviewAction } from "@/app/actions/reviews";
import toast from "react-hot-toast";

export default function ReviewForm({ listingId, onCancel, onSuccess }: { listingId: number, onCancel: () => void, onSuccess: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }
    
    setLoading(true);
    const res = await submitReviewAction(listingId, rating, comment);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message || "Review submitted!");
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 mt-4">
      <h4 className="font-bold text-neutral-900 mb-4">Write a Review</h4>
      
      <div className="mb-4">
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={(hoverRating || rating) >= star ? "text-amber-400 fill-amber-400" : "text-neutral-300"}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Your Experience (Optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others what you liked or disliked..."
          className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none h-24"
          maxLength={500}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          disabled={loading || rating === 0}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
