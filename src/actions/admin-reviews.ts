"use server";

import { assertAdmin, checkAdmin } from "@/lib/auth-guard";
import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import {
  ReviewSummary,
  ReviewMetricsSummary,
  ReviewMetrics,
  ReviewTotal,
} from "@/types/admin";
import { groq } from "next-sanity";
import { revalidateTag } from "next/cache";
import { z } from "zod";

// Input Validation Schemas
const ApproveReviewSchema = z.object({
  reviewId: z.string().min(1),
});

const RejectReviewSchema = z.object({
  reviewId: z.string().min(1),
});

const DeleteReviewSchema = z.object({
  reviewId: z.string().min(1),
});

const ReplyReviewSchema = z.object({
  reviewId: z.string().min(1),
  replyText: z
    .string()
    .min(1, "Reply comment cannot be empty")
    .max(1000, "Reply cannot exceed 1000 characters"),
});

interface FetchReviewsParams {
  page: number;
  pageSize: number;
  search?: string;
  rating?: string; // "all" or "1"-"5"
  status?: string; // "all", "approved", "pending"
}

/**
 * Fetch paged, filtered, and searched reviews from Sanity
 */
export async function fetchAdminReviewsPaged({
  page,
  pageSize,
  search = "",
  rating = "all",
  status = "all",
}: FetchReviewsParams): Promise<{ reviews: ReviewSummary[]; total: number }> {
  await checkAdmin();
  try {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    let filterClauses = `_type == "review"`;
    const params: Record<string, string | number> = { start, end };

    // Apply Approval Status filter
    if (status === "approved") {
      filterClauses += ` && approved == true`;
    } else if (status === "pending") {
      filterClauses += ` && approved == false`;
    }

    // Apply Rating filter
    if (rating !== "all") {
      const ratingValue = parseInt(rating, 10);
      if (!isNaN(ratingValue)) {
        filterClauses += ` && rating == $ratingVal`;
        params.ratingVal = ratingValue;
      }
    }

    // Apply Search filter (User Name, Food Name, Comment Text)
    if (search.trim()) {
      filterClauses += ` && (user->name match $search || food->name match $search || comment match $search)`;
      params.search = `*${search.trim()}*`;
    }

    const query = groq`{
      "reviews": *[${filterClauses}] | order(_createdAt desc)[$start...$end] {
        _id,
        _createdAt,
        rating,
        comment,
        approved,
        adminReply,
        food->{
          _id,
          name,
          images
        },
        user->{
          _id,
          name,
          email,
          image
        }
      },
      "total": count(*[${filterClauses}])
    }`;

    const { data } = await sanityFetch({
      query,
      params,
      tags: ["reviews"],
    });

    const res = data as ReviewTotal;
    return {
      reviews: (res.reviews || []) as ReviewSummary[],
      total: res.total || 0,
    };
  } catch (error) {
    console.error("Failed to fetch admin reviews:", error);
    return { reviews: [], total: 0 };
  }
}

/**
 * Fetch aggregated statistics and ratings distribution
 */
export async function fetchAdminReviewMetrics(): Promise<ReviewMetricsSummary> {
  await checkAdmin();
  try {
    const query = groq`{
      "totalReviews": count(*[_type == "review"]),
      "pendingReviews": count(*[_type == "review" && approved == false]),
      "averageRating": coalesce(math::avg(*[_type == "review"].rating), 0),
      "fiveStar": count(*[_type == "review" && rating == 5]),
      "fourStar": count(*[_type == "review" && rating == 4]),
      "threeStar": count(*[_type == "review" && rating == 3]),
      "twoStar": count(*[_type == "review" && rating == 2]),
      "oneStar": count(*[_type == "review" && rating == 1])
    }`;

    const { data } = await sanityFetch({
      query,
      params: {},
      tags: ["reviews"],
    });

    const res = data as ReviewMetrics;
    const total = res.totalReviews || 0;
    const distribution = [
      { stars: 5, count: res.fiveStar || 0 },
      { stars: 4, count: res.fourStar || 0 },
      { stars: 3, count: res.threeStar || 0 },
      { stars: 2, count: res.twoStar || 0 },
      { stars: 1, count: res.oneStar || 0 },
    ].map((item) => ({
      ...item,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
    }));

    return {
      totalReviews: total,
      pendingReviews: res.pendingReviews || 0,
      averageRating: Math.round(res.averageRating * 10) / 10,
      distribution,
    };
  } catch (error) {
    console.error("Failed to fetch review metrics:", error);
    return {
      totalReviews: 0,
      pendingReviews: 0,
      averageRating: 0,
      distribution: [
        { stars: 5, count: 0, percentage: 0 },
        { stars: 4, count: 0, percentage: 0 },
        { stars: 3, count: 0, percentage: 0 },
        { stars: 2, count: 0, percentage: 0 },
        { stars: 1, count: 0, percentage: 0 },
      ],
    };
  }
}

/**
 * Approve a review to publish it on the main site
 */
export async function approveReviewAction(
  rawInput: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  const result = ApproveReviewSchema.safeParse(rawInput);
  if (!result.success) {
    return { success: false, error: "Invalid review parameters." };
  }

  const { reviewId } = result.data;
  try {
    await client.patch(reviewId).set({ approved: true }).commit();

    revalidateTag("reviews", "max");
    return { success: true };
  } catch (error) {
    console.error(`Failed to approve review ${reviewId}:`, error);
    return { success: false, error: "Database transaction failed." };
  }
}

/**
 * Reject or retract approval of a review
 */
export async function rejectReviewAction(
  rawInput: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  const result = RejectReviewSchema.safeParse(rawInput);
  if (!result.success) {
    return { success: false, error: "Invalid review parameters." };
  }

  const { reviewId } = result.data;
  try {
    await client.patch(reviewId).set({ approved: false }).commit();

    revalidateTag("reviews", "max");
    return { success: true };
  } catch (error) {
    console.error(`Failed to reject review ${reviewId}:`, error);
    return { success: false, error: "Database transaction failed." };
  }
}

/**
 * Submit or update admin reply to a review
 */
export async function replyToReviewAction(
  rawInput: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  const result = ReplyReviewSchema.safeParse(rawInput);
  if (!result.success) {
    const errorMsg = result.error.message || "Invalid input";
    return { success: false, error: errorMsg };
  }

  const { reviewId, replyText } = result.data;
  try {
    await client.patch(reviewId).set({ adminReply: replyText }).commit();

    revalidateTag("reviews", "max");
    return { success: true };
  } catch (error) {
    console.error(`Failed to reply to review ${reviewId}:`, error);
    return { success: false, error: "Database transaction failed." };
  }
}

/**
 * Permanently delete a review
 */
export async function deleteReviewAction(
  rawInput: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  const result = DeleteReviewSchema.safeParse(rawInput);
  if (!result.success) {
    return { success: false, error: "Invalid parameters." };
  }

  const { reviewId } = result.data;
  try {
    // 1. Query for all documents that reference this review (e.g. metrics, reactions)
    const referencingDocIds = await client.fetch<string[]>(
      `*[references($reviewId)]._id`,
      { reviewId },
    );

    // 2. Perform a transaction to delete all referencing documents and the review itself
    let transaction = client.transaction();
    for (const docId of referencingDocIds) {
      transaction = transaction.delete(docId);
    }
    transaction = transaction.delete(reviewId);

    await transaction.commit();

    revalidateTag("reviews", "max");
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete review ${reviewId}:`, error);
    return {
      success: false,
      error: "Database deletion failed due to dependency constraints.",
    };
  }
}
