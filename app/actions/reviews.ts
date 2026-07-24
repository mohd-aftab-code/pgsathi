"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notify } from "@/lib/notifications";
import { updateTag } from "next/cache";

export async function submitReviewAction(listingId: number, rating: number, comment: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to submit a review." };
    }

    const userId = parseInt(session.user.id);

    const targetListing = await db.listing.findUnique({
      where: { id: listingId },
      select: { ownerId: true, title: true, slug: true, reviewsEnabled: true }
    });

    if (!targetListing) {
      return { error: "Listing not found." };
    }

    if (!targetListing.reviewsEnabled) {
      return { error: "Reviews are turned off for this PG." };
    }

    // Check if user already reviewed
    const existing = await db.review.findUnique({
      where: {
        listingId_userId: { listingId, userId }
      }
    });

    if (existing) {
      return { error: "You have already reviewed this PG." };
    }

    // Check if user is a verified tenant (exists in PgTenant for this listing)
    const isTenant = await db.pgTenant.findFirst({
      where: {
        userId: userId,
        listingId: listingId,
        status: { in: ["ACTIVE", "NOTICE", "VACATED"] }
      }
    });

    const isVerified = !!isTenant;
    // Auto approve verified tenants, otherwise require moderation
    const isApproved = isVerified;

    await db.review.create({
      data: {
        listingId,
        userId,
        rating,
        comment,
        isVerified,
        isApproved
      }
    });

    // Notify the owner of the new review
    await notify({
      userId: targetListing.ownerId,
      type: "REVIEW",
      title: `New ${rating}★ review on ${targetListing.title}`,
      message: comment ? `"${comment.slice(0, 100)}"` : null,
      link: "/dashboard/owner/reviews",
    });

    // Update listing stats if approved
    if (isApproved) {
      const allApproved = await db.review.findMany({
        where: { listingId, isApproved: true },
        select: { rating: true }
      });
      
      const totalReviews = allApproved.length;
      const sum = allApproved.reduce((acc, curr) => acc + curr.rating, 0);
      const avgRating = totalReviews > 0 ? (sum / totalReviews).toFixed(2) : 0;

      await db.listing.update({
        where: { id: listingId },
        data: {
          totalReviews,
          avgRating: parseFloat(avgRating as string)
        }
      });
    }

    updateTag(`listing-${targetListing.slug}`);
    return { success: true, message: isApproved ? "Review submitted successfully!" : "Review submitted and is pending approval." };
  } catch (error: any) {
    console.error("Submit review error:", error);
    return { error: "Failed to submit review. Please try again." };
  }
}
