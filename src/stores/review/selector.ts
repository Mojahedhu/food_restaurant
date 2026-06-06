import { applyReactionDelta } from "@/lib/utils/helpers";
import { ReactionType } from "../../../sanity.types";
import {
  PendingReactionMutation,
  ReviewDisplayState,
  ReviewState,
  ReviewView,
} from "../../../types/sanityTypes";

/**
 * =======================================================
 * Helper functions
 * =========================================================
 */
function getLatestPendingMutation(view: ReviewView) {
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

export function getActiveReaction(view: ReviewView): ReactionType | null {
  const latest = getLatestPendingMutation(view);

  return latest ? latest.optimisticReaction : view.confirmedReaction;
}

/**
 * =========================================================
 * Determine pending state
 * =========================================================
 */

export function isReactionPending(view: ReviewView): boolean {
  return view.pendingMutations.length > 0;
}

/**
 * =========================================================
 * Full UI projection ==========
 * =========================================================
 */

export function getReviewDisplayState(view: ReviewView): ReviewDisplayState {
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
 * Get single review view
 * =========================================================
 */

export function selectReviewView(
  state: ReviewState,
  reviewId: string,
): ReviewView | undefined {
  return state.reviews[reviewId];
}

/**
 * =========================================================
 * Get display-ready review
 * =========================================================
 */

export function reviewDisplayState(
  state: ReviewState,
  reviewId: string,
): ReviewDisplayState | undefined {
  const view = selectReviewView(state, reviewId);

  if (!view) return undefined;

  return getReviewDisplayState(view);
}

/**
 * =========================================================
 * Stable sorted review list
 * =========================================================
 */

export function selectReviewList(state: ReviewState): ReviewDisplayState[] {
  return Object.values(state.reviews)
    .sort((a, b) => {
      return (
        new Date(b.review._createdAt).getTime() -
        new Date(a.review._createdAt).getTime()
      );
    })
    .map(getReviewDisplayState);
}

/**
 * =========================================================
 * get Optimistic count
 * =========================================================
 */

export function getOptimisticCount(view: ReviewView) {
  const latest = getLatestPendingMutation(view);

  if (!latest) {
    return {
      likes: view.metrics.likesCount,
      dislikes: view.metrics.dislikesCount,
    };
  }

  // const previous =
  //   view.pendingMutations.length > 1
  //     ? view.pendingMutations.at(-2)?.optimisticReaction
  //     : view.confirmedReaction;
  // const currentOptimistic = view.pendingMutations.at(-1)?.optimisticReaction;
  const previous = view.confirmedReaction;
  const currentOptimistic = latest.optimisticReaction;

  return applyReactionDelta(
    view.metrics.likesCount,
    view.metrics.dislikesCount,
    previous!,
    currentOptimistic!,
  );
}
