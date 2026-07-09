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

  // return latest?.optimisticReaction ?? view.confirmedReaction ?? null;

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

/**
 * =========================================================
 * Root State Selectors
 * =========================================================
 */

// Get single review view

export function selectReviewView(
  state?: ReviewState,
  reviewId?: string,
): ReviewView | undefined {
  if (!state?.reviews || !reviewId) return undefined;
  return state.reviews[reviewId];
}

// Get display-ready review

export function selectReviewDisplayState(
  state?: ReviewState,
  reviewId?: string,
): ReviewDisplayState | undefined {
  const view = selectReviewView(state, reviewId);

  return getReviewDisplayState(view);
}

/**
 * =========================================================
 * Stable sorted review list
 * =========================================================
 */

export function selectReviewList(state?: ReviewState): ReviewDisplayState[] {
  if (!state?.reviews) return [];

  return (
    Object.values(state.reviews)
      // 1. Type guard against corrupted views
      .filter((view): view is ReviewView => Boolean(view?.review?._createdAt))
      // 2. Safe Date parsing to prevent NaN sorting logic exceptions
      .sort((a, b) => {
        const timeA = new Date(a.review._createdAt).getTime() || 0;
        const timeB = new Date(b.review._createdAt).getTime() || 0;
        return timeB - timeA;
      })
      // 3. Map to UI state
      .map((view) => getReviewDisplayState(view))
      // 4. Prune any undefined results cleanly
      .filter((display): display is ReviewDisplayState => Boolean(display))
  );
}
