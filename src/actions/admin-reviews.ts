"use server";

import { assertAdmin, checkAdmin } from "@/lib/auth-guard";
import { ReviewSummary, ReviewMetricsSummary } from "@/types/admin";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { ServiceError } from "@/lib/services/errors";
import {
  fetchAdminReviewsPagedService,
  fetchAdminReviewMetricsService,
  approveReviewService,
  rejectReviewService,
  replyToReviewService,
  deleteReviewService,
} from "@/lib/services/admin.review.service";

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

export async function fetchAdminReviewsPaged(params: FetchReviewsParams): Promise<{ reviews: ReviewSummary[]; total: number }> {
  await checkAdmin();
  try {
    return await fetchAdminReviewsPagedService(params);
  } catch (error) {
    console.error("Failed to fetch admin reviews:", error);
    return { reviews: [], total: 0 };
  }
}

export async function fetchAdminReviewMetrics(): Promise<ReviewMetricsSummary> {
  await checkAdmin();
  try {
    return await fetchAdminReviewMetricsService();
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
    await approveReviewService(reviewId);

    // @ts-ignore
    revalidateTag("reviews", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error(`Failed to approve review ${reviewId}:`, error);
    return { success: false, error: "Database transaction failed." };
  }
}

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
    await rejectReviewService(reviewId);

    // @ts-ignore
    revalidateTag("reviews", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error(`Failed to reject review ${reviewId}:`, error);
    return { success: false, error: "Database transaction failed." };
  }
}

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
    await replyToReviewService(reviewId, replyText);

    // @ts-ignore
    revalidateTag("reviews", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error(`Failed to add admin reply to review ${reviewId}:`, error);
    return { success: false, error: "Database transaction failed." };
  }
}

export async function deleteReviewAction(
  rawInput: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  
  const result = DeleteReviewSchema.safeParse(rawInput);
  if (!result.success) {
    return { success: false, error: "Invalid review parameters." };
  }

  const { reviewId } = result.data;
  
  try {
    await deleteReviewService(reviewId);

    // @ts-ignore
    revalidateTag("reviews", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error(`Failed to delete review ${reviewId}:`, error);
    return { success: false, error: "Database deletion failed." };
  }
}
