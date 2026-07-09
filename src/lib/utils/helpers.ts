/**
 * Get review _id from reactionId
 * Example: "reaction_like_1751517217530_k0h5o0v5"
 */

import { ReactionType } from "../../../sanity.types";
import {
  PendingReactionMutation,
  ReviewMetrics,
  ReviewView,
} from "../../../types/sanityTypes";

export function getReviewIdFromReactionId(reactionId: string) {
  return reactionId
    .replace(/^reaction_/, "")
    .split("_")
    .slice(0, -1)
    .join("_");
}

/**
 * =========================================================
 * Check if mutation is fully confirmed (both reaction and metrics)
 * =========================================================
 */

export function shouldRemoveMutation(
  mutation: PendingReactionMutation,
): boolean {
  return mutation.reactionConfirmed;
}

/**
 * =========================================================
 * Expected Metrics Helper
 * =========================================================
 */

export function getExpectedMetrics(
  metrics: ReviewMetrics,
  confirmedReaction: ReactionType | null,
  optimisticReaction: ReactionType | null,
) {
  let likesDelta = 0;
  let dislikesDelta = 0;

  if (confirmedReaction === "like") likesDelta--;
  if (confirmedReaction === "dislike") dislikesDelta--;

  if (optimisticReaction === "like") likesDelta++;
  if (optimisticReaction === "dislike") dislikesDelta++;

  return {
    likesCount: metrics.likesCount + likesDelta,
    dislikesCount: metrics.dislikesCount + dislikesDelta,
  };
}

/**
 * =========================================================
 * Prune expired mutations
 * =========================================================
 */

export function pruneExpiredMutations(mutations: PendingReactionMutation[]) {
  const MUTATION_TIMEOUT_MS = 15000;

  return mutations.filter(
    (m) => Date.now() - m.startedAt < MUTATION_TIMEOUT_MS,
  );
}

/**
 * =========================================================
 * Reaction Delta
 * =========================================================
 */
export function applyReactionDelta(
  likes: number,
  dislikes: number,
  from: ReactionType | null,
  to: ReactionType | null,
) {
  let likesDelta = 0;
  let dislikesDelta = 0;

  /**
   * Remove previous confirmed
   */
  if (from === "like") likesDelta--;
  if (from === "dislike") dislikesDelta--;

  /**
   * Apply optimistic target
   */
  if (to === "like") likesDelta++;
  if (to === "dislike") dislikesDelta++;

  return {
    likes: Math.max(0, likes + likesDelta),
    dislikes: Math.max(0, dislikes + dislikesDelta),
  };
}

/**
 * =========================================================
 * Optimistic Metrics Satisfied Helper
 * =========================================================
 */
export function optimisticMetricsSatisfied(
  metrics: ReviewMetrics,
  confirmedReaction: ReactionType | null,
  optimisticReaction: ReactionType | null,
) {
  const expected = getExpectedMetrics(
    metrics,
    confirmedReaction,
    optimisticReaction,
  );

  return (
    metrics.likesCount === expected.likesCount &&
    metrics.dislikesCount === expected.dislikesCount
  );
}

/**
 * =========================================================
 * Is Mutation Reconciled Helper
 * =========================================================
 */
export function isMutationReconciled(
  view: ReviewView,
  mutation: PendingReactionMutation,
): boolean {
  /**
   * Server reaction must match optimistic reaction
   */
  const reactionMatch = view.confirmedReaction === mutation.optimisticReaction;

  if (!reactionMatch) {
    return false;
  }

  /**
   * Wait for the metrics to catch up too before pruning!
   * This prevents the UI from flashing old counts.
   */
  return optimisticMetricsSatisfied(
    view.metrics,
    view.confirmedReaction,
    mutation.optimisticReaction,
  );
}

/**
 * =========================================================
 * Prune resolved mutations
 * =========================================================
 */
export function pruneResolvedMutations(
  view: ReviewView,
): PendingReactionMutation[] {
  return view.pendingMutations.filter(
    (mutation) => !isMutationReconciled(view, mutation),
  );
}
