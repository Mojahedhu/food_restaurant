# Action Layer Refactor Blueprint

Here is the complete code to cleanly remove the dead code and properly link your React hooks to the newly created Zod-validated Server Actions.

You can copy and paste these directly into your workspace.

---

### 1. The Cleaned Action File

#### `src/actions/client-reviews.ts`

_This file has been stripped of the 600+ lines of old, duplicated functions. It now only exports the modern, safe action wrappers._

```typescript
"use server";

import { client } from "@/sanity/lib/client";
import auth from "../../auth";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { ReactionType } from "../../sanity.types";
import { computeFoodMetrics, getReviewId } from "@/lib/utils/review-helpers";
import { getDislikesCount, getLikesCount } from "@/lib/data/review";
import { getMetricsId, getReactionId } from "@/lib/utils/review-helpers";

// Validation Schemas
const ReviewInputSchema = z.object({
  foodId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(10, "Comment must be at least 10 characters")
    .max(1000),
  type: z.enum(["create", "edit"]),
  transactionId: z.uuid().optional(),
});

const ToggleReactionSchema = z.object({
  reviewId: z.string().min(1),
  foodId: z.string().min(1),
  reaction: z.enum(["like", "dislike"]).nullable(),
  mutationId: z.uuid().optional(),
});

export async function upsertReviewAction(payload: unknown) {
  try {
    const parsed = ReviewInputSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid input data",
      };
    }

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized: Please sign in to submit a review",
      };
    }

    const {
      foodId,
      rating,
      comment,
      type,
      transactionId = crypto.randomUUID(),
    } = parsed.data;
    const reviewId = getReviewId(foodId, userId);

    // Fetch existing review
    const existing = await client.fetch<{ _id: string; rating: number }>(
      `*[_type == "review" && _id == $reviewId][0] { _id, rating }`,
      { reviewId },
    );

    if (type === "edit" && !existing)
      return { success: false, error: "Review not found" };
    if (type === "create" && existing)
      return { success: false, error: "You have already reviewed this dish" };

    const food = await client.fetch<{
      ratingSum: number;
      ratingCount: number;
      slug: string;
    }>(
      `*[_id == $foodId][0] { ratingSum, ratingCount, "slug": slug.current }`,
      { foodId },
    );
    if (!food) return { success: false, error: "Food item not found" };

    const previousRating = existing?.rating ?? 0;
    const tx = client.transaction();

    // Upsert Review
    const reviewData = {
      _id: reviewId,
      _type: "review",
      food: { _type: "reference", _ref: foodId },
      user: { _type: "reference", _ref: userId },
      rating,
      comment,
      approved: true, // Auto-approve reviews
    };

    if (!existing) {
      tx.create(reviewData);
    } else {
      tx.patch(reviewId, { set: { rating, comment } });
    }

    // Apply Deltas to Parent Product document using pure helpers
    const currentRatingSum = food.ratingSum ?? 0;
    const currentRatingCount = food.ratingCount ?? 0;

    if (type === "create") {
      const { ratingAverage, weightedRating } = computeFoodMetrics(
        currentRatingSum + rating,
        currentRatingCount + 1,
      );
      tx.patch(foodId, {
        setIfMissing: { ratingSum: 0, ratingCount: 0 },
        inc: { ratingSum: rating, ratingCount: 1 },
        set: { ratingAverage, weightedRating },
      });
    } else {
      const ratingDelta = rating - previousRating;
      const { ratingAverage, weightedRating } = computeFoodMetrics(
        currentRatingSum + ratingDelta,
        currentRatingCount,
      );
      tx.patch(foodId, {
        setIfMissing: { ratingSum: 0, ratingCount: 0 },
        inc: { ratingSum: ratingDelta },
        set: { ratingAverage, weightedRating },
      });
    }

    await tx.commit({ transactionId });
    revalidateTag(`reviews:${foodId}`, "max");
    revalidateTag(`food:${food.slug}`, "max");

    return { success: true, transactionId };
  } catch (error) {
    console.error("Failed to upsert review:", error);
    return { success: false, error: "Database transaction failed" };
  }
}

export async function deleteReviewAction(payload: unknown) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized" };

    const parsed = z.object({ foodId: z.string().min(1) }).safeParse(payload);
    if (!parsed.success) return { success: false, error: "Invalid parameters" };

    const { foodId } = parsed.data;
    const reviewId = getReviewId(foodId, userId);

    const [existing, food, reactionIds] = await Promise.all([
      client.fetch<{ rating: number }>(`*[_id == $reviewId][0] { rating }`, {
        reviewId,
      }),
      client.fetch<{ ratingSum: number; ratingCount: number; slug: string }>(
        `*[_id == $foodId][0] { ratingSum, ratingCount, "slug": slug.current }`,
        { foodId },
      ),
      client.fetch<string[]>(
        `*[_type == "reviewReaction" && review._ref == $reviewId]._id`,
        { reviewId },
      ),
    ]);

    if (!existing || !food)
      return { success: false, error: "Record not found" };

    const safeRatingSum = Math.max(0, (food.ratingSum ?? 0) - existing.rating);
    const safeRatingCount = Math.max(0, (food.ratingCount ?? 0) - 1);
    const { ratingAverage, weightedRating } = computeFoodMetrics(
      safeRatingSum,
      safeRatingCount,
    );

    const tx = client.transaction();
    reactionIds.forEach((id) => tx.delete(id));
    tx.delete(`metrics_${reviewId}`);
    tx.delete(reviewId);
    tx.patch(foodId, {
      set: {
        ratingSum: safeRatingSum,
        ratingCount: safeRatingCount,
        ratingAverage,
        weightedRating,
      },
    });

    await tx.commit();
    revalidateTag(`reviews:${foodId}`, "max");
    revalidateTag(`food:${food.slug}`, "max");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete review:", error);
    return { success: false, error: "Deletion failed" };
  }
}

export async function toggleReactionAction(payload: unknown) {
  try {
    const parsed = ToggleReactionSchema.safeParse(payload);
    if (!parsed.success)
      return { success: false, error: "Invalid reaction inputs" };

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized" };

    const {
      reviewId,
      foodId,
      reaction,
      mutationId = crypto.randomUUID(),
    } = parsed.data;
    const reactionId = `reaction_${reviewId}_${userId}`;
    const metricsId = `metrics_${reviewId}`;

    const existing = await client.fetch<{ type: ReactionType }>(
      `*[_id == $reactionId][0] { type }`,
      { reactionId },
    );

    const tx = client.transaction();

    if (!reaction) {
      if (existing) {
        tx.delete(reactionId);
        const decField =
          existing.type === "like" ? "likesCount" : "dislikesCount";
        tx.patch(metricsId, { dec: { [decField]: 1 } });
      }
    } else {
      const isNew = !existing;
      if (isNew) {
        tx.create({
          _id: reactionId,
          _type: "reviewReaction",
          review: { _type: "reference", _ref: reviewId },
          food: { _type: "reference", _ref: foodId },
          user: { _type: "reference", _ref: userId },
          type: reaction,
        });
        const incField = reaction === "like" ? "likesCount" : "dislikesCount";
        tx.patch(metricsId, {
          setIfMissing: { likesCount: 0, dislikesCount: 0 },
          inc: { [incField]: 1 },
        });
      } else if (existing.type !== reaction) {
        tx.patch(reactionId, { set: { type: reaction } });
        const incField = reaction === "like" ? "likesCount" : "dislikesCount";
        const decField = reaction === "like" ? "dislikesCount" : "likesCount";
        tx.patch(metricsId, {
          setIfMissing: { likesCount: 0, dislikesCount: 0 },
          inc: { [incField]: 1 },
          dec: { [decField]: 1 },
        });
      }
    }

    await tx.commit({ transactionId: mutationId });
    revalidateTag(`reviews:${foodId}`, "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle reaction:", error);
    return { success: false, error: "Reaction transaction failed" };
  }
}
```

---

### 2. The Hook that Connects to Action

#### `src/hooks/useReviewMutations.ts`

```typescript
import { useState } from "react";

import { ReviewView } from "../../types/sanityTypes";
import { useReviewDispatch } from "@/stores/review/hooks/useReviewsState";
import {
  deleteReviewAction,
  upsertReviewAction,
} from "@/actions/client-reviews";

export interface CreateInput {
  foodId: string;
  rating: number;
  comment: string;
  optimisticReview: ReviewView;
}

export interface UpdateInput {
  reviewId: string;
  foodId: string;
  rating: number;
  comment: string;
}

export interface DeleteInput {
  reviewId: string;
  foodId: string;
}

export type ReviewResult =
  | {
      success: boolean;
      message: string;
      error: string;
      transactionId?: undefined;
    }
  | {
      success: boolean;
      message: string;
      error?: undefined;
      transactionId?: undefined;
    }
  | {
      success: boolean;
      transactionId: string;
      message?: undefined;
      error?: undefined;
    };

export function useReviewMutations() {
  const dispatch = useReviewDispatch();
  const [isPending, setIsPending] = useState(false);

  /**
   * Create Review
   */

  async function createReview({
    foodId,
    rating,
    comment,
    optimisticReview,
  }: CreateInput) {
    setIsPending(true);
    const transactionId = crypto.randomUUID();
    dispatch({
      type: "review_create_optimistic",
      payload: {
        review: optimisticReview,
        operationId: transactionId,
      },
    });
    try {
      // Calls the new Server Action safely via Zod payload
      return await upsertReviewAction({
        foodId,
        rating,
        comment,
        type: "create",
        transactionId,
      });
    } catch (error) {
      console.log(error);
      dispatch({
        type: "review_operation_field",
        payload: {
          reviewId: optimisticReview.review._id,
        },
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }

  /**
   * Update Review
   */
  async function updateReview({
    reviewId,
    foodId,
    rating,
    comment,
  }: UpdateInput) {
    const transactionId = crypto.randomUUID();
    setIsPending(true);
    dispatch({
      type: "review_update_optimistic",
      payload: {
        reviewId,
        rating,
        comment,
        operationId: transactionId,
      },
    });

    try {
      // Calls the new Server Action safely via Zod payload
      return await upsertReviewAction({
        foodId,
        rating,
        comment,
        type: "edit",
        transactionId,
      });
    } catch (error) {
      console.log(error);
      dispatch({
        type: "review_operation_field",
        payload: {
          reviewId,
        },
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }

  /**
   * Delete Review
   */

  async function removeReview({ reviewId, foodId }: DeleteInput) {
    setIsPending(true);
    const transactionId = crypto.randomUUID();
    dispatch({
      type: "review_delete_optimistic",
      payload: {
        reviewId,
        operationId: transactionId,
      },
    });

    try {
      // Calls the new Server Action safely via Zod payload
      return await deleteReviewAction({
        foodId,
      });
    } catch (error) {
      console.error("Failed to delete review:", error);
      dispatch({
        type: "review_operation_field",
        payload: {
          reviewId,
        },
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }

  return {
    createReview,
    updateReview,
    removeReview,
    isPending,
  };
}
```

---

### 3. The Hook for Toggle Reactions

#### `src/stores/review/hooks/useToggleReactions.ts`

```typescript
"use client";

import { useCallback } from "react";
import { useReviewDispatch, useReviewView } from "./useReviewsState";
import { ReactionType } from "@/../sanity.types";
import { getActiveReaction } from "../selector";
import { toggleReactionAction } from "@/actions/client-reviews";

interface useToggleReactionOptions {
  reviewId: string;
}

export function useToggleReaction({ reviewId }: useToggleReactionOptions) {
  const dispatch = useReviewDispatch();
  const reviewView = useReviewView(reviewId);

  const isPending = reviewView ? reviewView.pendingMutations.length > 0 : false;
  const activeReaction = reviewView ? getActiveReaction(reviewView) : null;

  const toggle = useCallback(
    async (nextReaction: ReactionType | null) => {
      if (!reviewView) {
        return;
      }

      const optimisticReaction =
        activeReaction === nextReaction ? null : nextReaction;

      const mutationId = crypto.randomUUID();

      dispatch({
        type: "reaction_mutation_started",
        payload: {
          reviewId,
          mutation: {
            mutationId,
            optimisticReaction,
            startedAt: Date.now(),
            reactionConfirmed: false,
          },
        },
      });

      try {
        // Calls the new Server Action safely via Zod payload
        const result = await toggleReactionAction({
          reviewId,
          reaction: optimisticReaction,
          mutationId,
          foodId: reviewView.review.food._ref,
        });

        if (!result?.success) {
          throw new Error(result?.error || "Mutation failed");
        }
      } catch (error) {
        dispatch({
          type: "reaction_mutation_failed",
          payload: {
            reviewId,
            mutationId,
          },
        });
        console.error("Reaction mutation failed", error);
      }
    },
    [activeReaction, dispatch, reviewId, reviewView],
  );

  return {
    toggle,
    isPending,
    activeReaction,
  };
}
```
