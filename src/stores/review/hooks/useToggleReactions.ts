"use client";

import { useCallback, useTransition } from "react";
import { ReactionType } from "@/../sanity.types";
import { toggleReactionAction } from "@/actions/client-reviews";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useReviewActions, useReviewDisplay } from "../useReviewSelectors";

/**
 * =========================================================
 * Toggle reaction mutation hook
 * =========================================================
 */

interface useToggleReactionOptions {
  reviewId?: string;
  userId?: string;
}

/**
 * ============================================================================
 * Hook: useToggleReaction
 * Enforces Rule 1 (Auth Delegation) and Rule 4 (Optional Chaining/Safety)
 * ============================================================================
 */
export function useToggleReaction({
  reviewId,
  userId,
}: useToggleReactionOptions) {
  // 1. Hook into our stable Zustand actions
  const actions = useReviewActions();
  // 2. Safely read this specific review's state
  const reviewView = useReviewDisplay(reviewId || "");

  const router = useRouter();
  const pathname = usePathname();

  // 1. Safe Extraction & Total Optional Chaining (Rule 4)
  const foodId = reviewView?.review?.food?._ref;

  /**
   * =====================================================
   * Prevent rapid duplicate clicks
   * =====================================================
   */

  // Rule 5: Calculate debouncing/pending state based on queue length
  const isPendingReducer = reviewView?.pending || false;

  /**
   * ===============================================
   * Current active derived reaction
   * ===============================================
   */

  // Rule 4: Derive active state with safety fallbacks
  const activeReaction = reviewView?.activeReaction || null;

  // 2. Next.js Server Action Transition Wrapping
  const [isPendingAction, startTransition] = useTransition();

  const toggle = useCallback(
    async (nextReaction: ReactionType | null) => {
      // Rule 1 & 7: Auth routing logic extracted from the UI component
      if (!userId) {
        const params = new URLSearchParams({ callbackUrl: pathname });
        router.push(`/auth/signin?${params.toString()}`, { scroll: false });
        return;
      }

      // Rule 4: Defensive guard against unhydrated or corrupt state
      if (!reviewId || !foodId) {
        toast.error("Unable to process reaction: Missing data.");
        return;
      }

      /**
       * Toggle behavior
       */

      const optimisticReaction =
        activeReaction === nextReaction ? null : nextReaction;

      /**
       * Deterministic mutation id
       */

      const mutationId = crypto.randomUUID();

      /**
       * ===============================================
       * Optimistic lifecycle event
       * ===============================================
       */

      // Trigger Zustand action
      actions.reactionMutationStarted(reviewId, {
        mutationId,
        optimisticReaction,
        startedAt: Date.now(),
        reactionConfirmed: false,
      });

      // Execute network request non-blockingly
      // startTransition(async () => {
      // });
      try {
        /**
         * ===========================================
         * Server mutation
         * ===========================================
         */
        // Calls the new Server Action safely via Zod payload
        const result = await toggleReactionAction({
          reviewId,
          reaction: optimisticReaction,
          mutationId,
          foodId,
        });

        // Rule 3: Error Handling boundary
        if (!result?.success) {
          throw new Error(result?.error || "Mutation failed");
        }
      } catch (error) {
        // Rule 3: Handle failures gracefully, revert UI, and log to console
        console.error("[useToggleReaction] Reaction mutation failed:", error);
        toast.error("Failed to save reaction. Please try again.");
        /**
         * ===========================================
         * Rollback
         * ===========================================
         */

        // Rollback via Zustand action
        actions.reactionMutationFailed(reviewId, mutationId);
      }
    },
    // The dependency array is perfectly stable now thanks to useShallow in our actions!
    [foodId, activeReaction, actions, reviewId, userId, pathname, router],
  );

  return {
    toggle,
    isPending: isPendingReducer,
    activeReaction,
  };
}
