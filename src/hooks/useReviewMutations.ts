import { useState } from "react";

import { ReviewView } from "../../types/sanityTypes";

import {
  deleteReviewAction,
  upsertReviewAction,
} from "@/actions/client-reviews";
import { useReviewActions } from "@/stores/review/useReviewSelectors";

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
      error: string;
      transactionId?: undefined;
    }
  | {
      success: boolean;
      transactionId: string;
      error?: undefined;
    };

export type ReviewDeleteResult =
  | {
      success: boolean;
      error: string;
    }
  | {
      success: boolean;
      error?: undefined;
    };

export function useReviewMutations() {
  const actions = useReviewActions();
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
    /**
     * Optional optimistic insertion:
     *
     * Usually unnecessary because
     * realtime listener will sync it.
     *
     * But we can still insert immediately
     * for instant UX.
     */
    setIsPending(true);
    const transactionId = crypto.randomUUID();
    actions.reviewCreateOptimistic(optimisticReview, transactionId);
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

      /**
       * Realtime bootstrap will reconcile.
       * Optional rollback can be added.
       */

      actions.reviewOperationField(optimisticReview.review._id);
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
    /**
     * Optional optimistic update:
     *
     * Usually unnecessary because
     * realtime listener will sync it.
     *
     * But we can still update immediately
     * for instant UX.
     */

    const transactionId = crypto.randomUUID();
    setIsPending(true);
    actions.reviewUpdateOptimistic(reviewId, rating, comment, transactionId);

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

      actions.reviewOperationField(reviewId);
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
    /**
     * Optimistic delete first
     */
    const transactionId = crypto.randomUUID();
    actions.reviewDeleteOptimistic(reviewId, transactionId);

    try {
      // Calls the new Server Action safely via Zod payload
      return await deleteReviewAction({
        foodId,
      });
    } catch (error) {
      console.error("Failed to delete review:", error);

      /**
       * Optional rollback later
       */
      actions.reviewOperationField(reviewId);
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
