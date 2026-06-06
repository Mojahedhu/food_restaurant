"use client";

import { useCallback } from "react";
import { useReviewDispatch, useReviewView } from "./useReviewsState";
import { ReactionType } from "../../../../sanity.types";
import { getActiveReaction } from "../selector";
import { toggleReaction } from "@/app/(client)/food/[foodSlug]/actions/reactions";

/**
 * =========================================================
 * Toggle reaction mutation hook
 * =========================================================
 */

interface useToggleReactionOptions {
  reviewId: string;
}

export function useToggleReaction({ reviewId }: useToggleReactionOptions) {
  const dispatch = useReviewDispatch();

  const reviewView = useReviewView(reviewId);

  /**
   * =====================================================
   * Prevent rapid duplicate clicks
   * =====================================================
   */

  const isPending = reviewView ? reviewView.pendingMutations.length > 0 : false;

  /**
   * ===============================================
   * Current active derived reaction
   * ===============================================
   */

  const activeReaction = reviewView ? getActiveReaction(reviewView) : null;

  const toggle = useCallback(
    async (nextReaction: ReactionType | null) => {
      if (!reviewView) {
        return;
      }

      /**
       * ===============================================
       * Toggle behavior
       * ===============================================
       */

      const optimisticReaction =
        activeReaction === nextReaction ? null : nextReaction;

      /**
       * ===============================================
       * Deterministic mutation id
       * ===============================================
       */

      const mutationId = crypto.randomUUID();

      /**
       * ===============================================
       * Optimistic lifecycle event
       * ===============================================
       */

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
        /**
         * ===========================================
         * Server mutation
         * ===========================================
         */

        const result = await toggleReaction({
          reviewId,
          reaction: optimisticReaction,
          mutationId,
          foodId: reviewView.review.food._ref,
        });

        if (!result?.success) {
          throw new Error(result?.message);
        }
      } catch (error) {
        /**
         * ===========================================
         * Rollback
         * ===========================================
         */

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
