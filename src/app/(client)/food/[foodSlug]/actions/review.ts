"use server";

import { client } from "@/sanity/lib/client";
import auth from "../../../../../../auth";
import { revalidateTag } from "next/cache";
import { z } from "zod";
interface UpsertReviewInput {
  foodId: string;
  rating: number;
  comment: string;
  type: "create" | "edit";
  transactionId?: string;
}

interface DeleteReviewInput {
  foodId: string;
  transactionId?: string;
}

/**
 * ========================================
 * Bayesian weighted score
 * ========================================
 */

function calculateWeightedRating({
  average,
  count,
  globalAverage = 4.2,
  minimumReviews = 10,
}: {
  average: number;
  count: number;
  globalAverage?: number;
  minimumReviews?: number;
}) {
  return (
    (count / (count + minimumReviews)) * average +
    (minimumReviews / (count + minimumReviews)) * globalAverage
  );
}

/**
 * ========================================
 * Compute food metrics
 * ========================================
 */

function computeFoodMetrics({
  ratingSum,
  ratingCount,
}: {
  ratingSum: number;
  ratingCount: number;
}) {
  const ratingAverage = ratingCount === 0 ? 0 : ratingSum / ratingCount;

  const weightedRating = calculateWeightedRating({
    average: ratingAverage,
    count: ratingCount,
  });

  return {
    ratingAverage,
    weightedRating,
  };
}

/**
 * ========================================
 * Review ID
 * ========================================
 */

function getReviewId(foodId: string, userId: string) {
  return `review_${foodId}_${userId}`;
}

/**
 * ========================================
 * Create / Edit
 * ========================================
 */

export async function upsertReview({
  foodId,
  rating,
  comment,
  type,
  transactionId = crypto.randomUUID(),
}: UpsertReviewInput) {
  const reviewSchema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().min(10).max(1000),
  });

  const result = reviewSchema.safeParse({
    rating,
    comment,
  });

  if (!result.success) {
    console.error(result.error);
    return {
      success: false,
      message: "Invalid review data",
      error: String(result.error),
    };
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized: Please login");
  }
  const reviewId = getReviewId(foodId, userId);

  /**
   * ==============================
   * Existing review
   * ==============================
   */

  const existing = await client.fetch<{ _id: string; rating: number }>(
    `
  *[_type == 'review' && _id == $reviewId][0] {
    _id,
    rating
  }
  `,
    { reviewId },
  );

  if (type == "edit" && !existing) {
    return { success: false, message: "Review not found" };
  }
  if (type == "create" && existing) {
    return {
      success: false,
      message: "Review already exists",
    };
  }

  const previousRating = existing?.rating ?? 0;

  const isNew = !existing;

  /**
   * ==============================
   * Food aggregate snapshot
   * ==============================
   */

  const food = await client.fetch<{
    ratingSum: number;
    ratingCount: number;
    slug: string;
  }>(
    `
   *[_id == $foodId][0]
   {
    ratingSum,
    ratingCount,
    "slug": slug.current
   }
   `,
    { foodId },
  );

  if (!food) {
    return { success: false, message: "Food not found" };
  }

  /**
   * ==============================
   * Transaction
   * ==============================
   */

  const tx = client.transaction();

  const updatePayload = {
    _id: reviewId,

    _type: "review",

    food: {
      _type: "reference",
      _ref: foodId,
    },

    user: {
      _type: "reference",
      _ref: userId,
    },
    rating,
    comment,
  };

  if (isNew) {
    tx.create(updatePayload);
  } else {
    tx.patch(reviewId, {
      set: {
        rating,
        comment,
      },
    });
  }

  /**
   * ==============================
   * Aggregate Delta
   * ==============================
   */

  const currentRatingSum = food.ratingSum ?? 0;
  const currentRatingCount = food.ratingCount ?? 0;

  if (type === "create") {
    const ratingDelta = rating;
    const countDelta = 1;

    const { ratingAverage, weightedRating } = computeFoodMetrics({
      ratingSum: currentRatingSum + ratingDelta,
      ratingCount: currentRatingCount + countDelta,
    });
    tx.patch(foodId, {
      setIfMissing: {
        ratingSum: 0,
        ratingCount: 0,
      },
      inc: {
        ratingSum: ratingDelta,
        ratingCount: countDelta,
      },
      set: {
        ratingAverage,
        weightedRating,
      },
    });
  } else {
    const ratingDelta = Math.max(0, rating - previousRating);

    const { ratingAverage, weightedRating } = computeFoodMetrics({
      ratingSum: currentRatingSum + ratingDelta,
      ratingCount: currentRatingCount,
    });
    tx.patch(foodId, {
      setIfMissing: {
        ratingSum: 0,
        ratingCount: 0,
      },
      inc: {
        ratingSum: ratingDelta,
      },
      set: {
        ratingAverage,
        weightedRating,
      },
    });
  }

  try {
    const result = await tx.commit({ transactionId });
    revalidateTag(`reviews:${foodId}`, "max");
    revalidateTag(`food:${food?.slug}`, "max");
    return { success: true, transactionId: result.transactionId };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to upsert review",
      error: String(error),
    };
  }
}

/**
 * ========================================
 * Delete review
 * ========================================
 */

export async function deleteReview({
  foodId,
  transactionId = crypto.randomUUID(),
}: DeleteReviewInput) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized: Please login");
  }
  const reviewId = getReviewId(foodId, userId);

  const existing = await client.fetch<{ rating: number }>(
    `
    *[_id == $reviewId][0]
    {
        rating
    }
    `,
    { reviewId },
  );

  if (!existing) {
    return { success: false, message: "Review not found" };
  }

  const { rating: previousRating } = existing;

  const food = await client.fetch<{
    ratingSum: number;
    ratingCount: number;
    slug: string;
  }>(
    `
    *[_id == $foodId][0]
    {
        "slug": slug.current,
        ratingSum,
        ratingCount,
    }
    `,
    { foodId },
  );

  const reactionIds = await client.fetch<string[]>(
    `
   *[
    _type == "reviewReaction"
    && review._ref == $reviewId
   ]._id
    `,
    { reviewId },
  );

  if (!food) {
    return { success: false, message: "Food not found" };
  }

  const safeRatingSum = Math.max(0, food.ratingSum - previousRating);
  const safeRatingCount = Math.max(0, food.ratingCount - 1);

  const { ratingAverage, weightedRating } = computeFoodMetrics({
    ratingSum: safeRatingSum,
    ratingCount: safeRatingCount,
  });

  const metricsId = `metrics_${reviewId}`;
  const tx = client.transaction();

  reactionIds.forEach((id) => {
    tx.delete(id);
  });

  tx.delete(metricsId);
  tx.delete(reviewId);

  tx.patch(foodId, {
    set: {
      ratingSum: safeRatingSum,
      ratingCount: safeRatingCount,
      ratingAverage,
      weightedRating,
    },
  });

  try {
    const result = await tx.commit({ transactionId });
    revalidateTag(`reviews:${foodId}`, "max");
    revalidateTag(`food:${food?.slug}`, "max");
    return { success: true, transactionId: result.transactionId };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to delete review",
      error: String(error),
    };
  }
}
