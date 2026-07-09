import { applyReactionDelta } from "@/lib/utils/helpers";
import { ReactionType } from "@/../sanity.types";
import {
  PendingReactionMutation,
  ReviewDisplayState,
  ReviewState,
  ReviewView,
} from "@/../types/sanityTypes";

/**
 * =======================================================
 * Helper functions
 * Safe Extractors & Memoized Getters
 * =========================================================
 */
function getLatestPendingMutation(
  view?: ReviewView,
): PendingReactionMutation | undefined {
  if (!view?.pendingMutations?.length) return undefined;

  return view.pendingMutations.reduce(
    (latest, current) =>
      !latest || current.startedAt > latest.startedAt ? current : latest,
    undefined as PendingReactionMutation | undefined,
  );
}

/**
 * =========================================================
 * Resolve active reaction
 * =========================================================
 */

export function getActiveReaction(view?: ReviewView): ReactionType | null {
  if (!view) return null;
  const latest = getLatestPendingMutation(view);

  // If there is a pending mutation, explicitly return its optimistic state
  if (latest) {
    return latest.optimisticReaction;
  }

  // Otherwise, fall back to the server's confirmed reaction
  return view.confirmedReaction ?? null;
}

/**
 * =========================================================
 * Determine pending state
 * =========================================================
 */

export function isReactionPending(view?: ReviewView): boolean {
  return (view?.pendingMutations?.length ?? 0) > 0;
}

/**
 * =========================================================
 * get Optimistic count
 * =========================================================
 */

export function getOptimisticCount(view?: ReviewView): {
  likes: number;
  dislikes: number;
} {
  // Fallbacks per Rule 4: Total Optional Chaining & Default State Assurances
  const baseLikes = view?.metrics?.likesCount ?? 0;
  const baseDislikes = view?.metrics?.dislikesCount ?? 0;
  if (!view) {
    return { likes: baseLikes, dislikes: baseDislikes };
  }
  const latest = getLatestPendingMutation(view);
  if (!latest) {
    return { likes: baseLikes, dislikes: baseDislikes };
  }
  // Removed unsafe '!' non-null assertions
  const previous = view.confirmedReaction ?? null;
  const currentOptimistic = latest.optimisticReaction ?? null;
  return applyReactionDelta(
    baseLikes,
    baseDislikes,
    previous,
    currentOptimistic,
  );
}

/**
 * =========================================================
 * Full UI projection ==========
 * =========================================================
 */

export function getReviewDisplayState(
  view?: ReviewView,
): ReviewDisplayState | undefined {
  if (!view?.review) return undefined;

  const activeReaction = getActiveReaction(view);
  const { likes, dislikes } = getOptimisticCount(view);

  return {
    review: view.review,

    /**
     * Metrics are server authoritative,
     * but pending mutations are projected
     * optimistically on top.
     */

    likesCount: likes ?? 0,
    dislikesCount: dislikes ?? 0,

    activeReaction,

    isLiked: activeReaction === "like",
    isDisliked: activeReaction === "dislike",

    pending: isReactionPending(view),
  };
}
