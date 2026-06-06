import { useState } from "react";
import {
  upsertReview,
  deleteReview,
} from "@/app/(client)/food/[foodSlug]/actions/review";
import { ReviewView } from "../../types/sanityTypes";
import { useReviewDispatch } from "@/stores/review/hooks/useReviewsState";

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
    dispatch({
      type: "review_create_optimistic",
      payload: {
        review: optimisticReview,
        operationId: transactionId,
      },
    });
    try {
      return await upsertReview({
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
      return await upsertReview({
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
    /**
     * Optimistic delete first
     */
    const transactionId = crypto.randomUUID();
    dispatch({
      type: "review_delete_optimistic",
      payload: {
        reviewId,
        operationId: transactionId,
      },
    });

    try {
      return await deleteReview({
        foodId,
      });
    } catch (error) {
      console.error("Failed to delete review:", error);

      /**
       * Optional rollback later
       */
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
