import { createStore } from "zustand";
import {
  ReviewState, // Directly consuming your exact state definition!
  ReviewView,
  SanityReview,
  PendingReactionMutation,
} from "@/../types/sanityTypes";
import { ReactionType } from "@/../sanity.types";
import {
  pruneExpiredMutations,
  pruneResolvedMutations,
} from "@/lib/utils/helpers";
/**
 * We map your exact reducer action payloads to Zustand store methods.
 */
export interface ReviewActions {
  // Initialization
  bootstrapReviews: (reviews: ReviewView[]) => void;
  setHasHydrated: (state: boolean) => void; // <--- Add this

  // Optimistic CRUD
  reviewCreateOptimistic: (review: ReviewView, operationId: string) => void;
  reviewUpdateOptimistic: (
    reviewId: string,
    rating: number,
    comment: string,
    operationId: string,
  ) => void;
  reviewDeleteOptimistic: (reviewId: string, operationId: string) => void;

  // Real-time Projections (Server Sync)
  reviewProjectionReceived: (review: SanityReview) => void;
  reviewProjectionRemoved: (reviewId: string) => void;
  metricsProjectionReceived: (
    reviewId: string,
    likesCount: number,
    dislikesCount: number,
  ) => void;

  // Reactions
  reactionProjectionReceived: (
    reviewId: string,
    reaction: ReactionType | null,
  ) => void;
  reactionMutationStarted: (
    reviewId: string,
    mutation: PendingReactionMutation,
  ) => void;
  reactionMutationFailed: (reviewId: string, mutationId: string) => void;
  // Operation Cleanup
  reviewOperationFailed: (reviewId: string) => void;
}
// The store is the exact combination of your Sanity types + our Actions
export type ReviewStore = ReviewState &
  ReviewActions & { isInitialized: boolean; hasHydrated: boolean };
/**
 * STORE FACTORY for Next.js Context Injection
 */
export const createReviewStore = (
  initialState: ReviewState = { reviews: {}, pendingReviewOperations: {} },
) => {
  return createStore<ReviewStore>()((set) => ({
    ...initialState,
    isInitialized: false,
    hasHydrated: false,

    setHasHydrated: (state: boolean) => set({ hasHydrated: state }),

    bootstrapReviews: (reviews) =>
      set(() => {
        const reviewMap: Record<string, ReviewView> = {};
        reviews.forEach((review) => {
          if (review.review?._id) reviewMap[review.review._id] = review;
        });
        return { reviews: reviewMap, isInitialized: true };
      }),
    // ======================================================
    // OPTIMISTIC CRUD (Consuming PendingReviewOperation)
    // ======================================================
    // Create review optimistically
    reviewCreateOptimistic: (review, operationId) =>
      set((state) => ({
        reviews: { ...state.reviews, [review.review._id]: review },
        pendingReviewOperations: {
          ...state.pendingReviewOperations,
          [review.review._id]: {
            operationId,
            type: "create",
            startedAt: Date.now(),
          },
        },
      })),
    // Update review optimistically
    reviewUpdateOptimistic: (reviewId, rating, comment, operationId) =>
      set((state) => {
        const existing = state.reviews[reviewId];
        if (!existing) return state;
        return {
          reviews: {
            ...state.reviews,
            [reviewId]: {
              ...existing,
              review: { ...existing.review, rating, comment },
            },
          },
          pendingReviewOperations: {
            ...state.pendingReviewOperations,
            [reviewId]: {
              operationId,
              type: "update",
              snapshot: structuredClone(existing), // Safe clone from ReviewView
              startedAt: Date.now(),
            },
          },
        };
      }),
    // Delete review optimistically
    reviewDeleteOptimistic: (reviewId, operationId) =>
      set((state) => {
        const existing = state.reviews[reviewId];
        if (!existing) return state;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [reviewId]: _, ...nextReviews } = state.reviews;
        return {
          reviews: nextReviews,
          pendingReviewOperations: {
            ...state.pendingReviewOperations,
            [reviewId]: {
              operationId,
              type: "delete",
              snapshot: structuredClone(existing),
              startedAt: Date.now(),
            },
          },
        };
      }),
    // Handle review operation field
    // If ReviewOperationFailedError is thrown from Sanity, this function will be called.
    reviewOperationFailed: (reviewId) =>
      set((state) => {
        const operation = state.pendingReviewOperations[reviewId];
        if (!operation) return state;
        const nextPending = { ...state.pendingReviewOperations };
        delete nextPending[reviewId];
        if (operation.type === "create") {
          const nextReviews = { ...state.reviews };
          delete nextReviews[reviewId];
          return { reviews: nextReviews, pendingReviewOperations: nextPending };
        }
        if (!operation.snapshot) return state;
        return {
          reviews: { ...state.reviews, [reviewId]: operation.snapshot },
          pendingReviewOperations: nextPending,
        };
      }),
    // ======================================================
    // REACTIONS & MUTATIONS
    // ======================================================
    // Reaction started
    reactionMutationStarted: (reviewId, mutation) =>
      set((state) => {
        const existing = state.reviews[reviewId];
        if (!existing) return state;
        return {
          reviews: {
            ...state.reviews,
            [reviewId]: {
              ...existing,
              pendingMutations: [
                ...existing.pendingMutations,
                { ...mutation, reactionConfirmed: false },
              ],
            },
          },
        };
      }),
    // Reaction received
    reactionProjectionReceived: (reviewId, reaction) =>
      set((state) => {
        const existing = state.reviews[reviewId];
        if (!existing) return state;
        const nextView = {
          ...existing,
          confirmedReaction: reaction,
        };

        // Use your exact utility functions!
        nextView.pendingMutations = pruneResolvedMutations(nextView);
        nextView.pendingMutations = pruneExpiredMutations(
          nextView.pendingMutations,
        );
        return { reviews: { ...state.reviews, [reviewId]: nextView } };
      }),
    // Reaction failed
    reactionMutationFailed: (reviewId, mutationId) =>
      set((state) => {
        const existing = state.reviews[reviewId];
        if (!existing) return state;
        return {
          reviews: {
            ...state.reviews,
            [reviewId]: {
              ...existing,
              pendingMutations: existing.pendingMutations.filter(
                (m) => m.mutationId !== mutationId,
              ),
            },
          },
        };
      }),
    // ======================================================
    // PROJECTIONS (Server Sync)
    // ======================================================
    // Review received from server
    reviewProjectionReceived: (incomingReview) =>
      set((state) => {
        const existing = state.reviews[incomingReview._id];
        const nextPending = { ...state.pendingReviewOperations };
        delete nextPending[incomingReview._id];
        if (!existing) {
          return {
            reviews: {
              ...state.reviews,
              [incomingReview._id]: {
                review: { ...incomingReview },
                metrics: {
                  reviewId: incomingReview._id,
                  likesCount: 0,
                  dislikesCount: 0,
                },
                confirmedReaction: null,
                pendingMutations: [],
              },
            },
            pendingReviewOperations: nextPending,
          };
        }
        if (incomingReview._rev === existing.review._rev) return state;
        return {
          reviews: {
            ...state.reviews,
            [incomingReview._id]: {
              ...existing,
              review: {
                ...existing.review,
                ...incomingReview,
                foodName: existing.review?.foodName,
                user: existing.review?.user,
              },
            },
          },
          pendingReviewOperations: nextPending,
        };
      }),
    // Metrics received from server
    metricsProjectionReceived: (reviewId, likesCount, dislikesCount) =>
      set((state) => {
        const existing = state.reviews[reviewId];
        if (!existing) return state;
        if (
          existing.metrics.likesCount === likesCount &&
          existing.metrics.dislikesCount === dislikesCount
        )
          return state;
        const nextView = {
          ...existing,
          metrics: { reviewId, likesCount, dislikesCount },
        };

        nextView.pendingMutations = pruneResolvedMutations(nextView);
        nextView.pendingMutations = pruneExpiredMutations(
          nextView.pendingMutations,
        );
        return { reviews: { ...state.reviews, [reviewId]: nextView } };
      }),
    // Review removed from server
    // If reviewProjectionError is thrown from Sanity, this function will be called.
    reviewProjectionRemoved: (reviewId) =>
      set((state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [reviewId]: _, ...nextReviews } = state.reviews;
        return { reviews: nextReviews };
      }),
  }));
};
