import {
  pruneExpiredMutations,
  pruneResolvedMutations,
} from "@/lib/utils/helpers";
import { ReactionType } from "../../../sanity.types";
import {
  PendingReactionMutation,
  ReviewState,
  ReviewView,
  SanityReview,
} from "../../../types/sanityTypes";

/**
 * =========================================================
 * Reducer Events
 * =========================================================
 */
export type ReviewAction =
  | {
      type: "bootstrap_reviews";
      payload: ReviewView[];
    }
  | {
      type: "review_create_optimistic";
      payload: {
        review: ReviewView;
        operationId: string;
      };
    }
  | {
      type: "review_update_optimistic";
      payload: {
        reviewId: string;
        rating: number;
        comment: string;
        operationId: string;
      };
    }
  | {
      type: "review_delete_optimistic";
      payload: {
        reviewId: string;
        operationId: string;
      };
    }
  | {
      type: "review_operation_field";
      payload: {
        reviewId: string;
      };
    }
  | {
      type: "review_projection_received";
      payload: {
        review: SanityReview;
      };
    }
  | {
      type: "review_projection_removed";
      payload: {
        reviewId: string;
      };
    }
  | {
      type: "metrics_projection_received";
      payload: {
        reviewId: string;
        likesCount: number;
        dislikesCount: number;
      };
    }
  | {
      type: "reaction_projection_received";
      payload: {
        reviewId: string;
        reaction: ReactionType | null;
        mutationId?: string;
      };
    }
  | {
      type: "reaction_mutation_started";
      payload: {
        reviewId: string;
        mutation: PendingReactionMutation;
      };
    }
  | {
      type: "reaction_mutation_failed";
      payload: {
        reviewId: string;
        mutationId: string;
      };
    };

/**
 * =========================================================
 * Initial State
 * =========================================================
 */

export const initialReviewState: ReviewState = {
  reviews: {},
  pendingReviewOperations: {},
};

/**
 * =========================================================
 * Pure Utility Helpers
 * =========================================================
 */

/**
 * Applies both mutation pruning steps safely to a ReviewView
 */
function applyMutationPruning(view: ReviewView): ReviewView {
  const prunedResolved = pruneResolvedMutations(view);
  const prunedExpired = pruneExpiredMutations(prunedResolved);
  return {
    ...view,
    pendingMutations: prunedExpired,
  };
}

/**
 * Extracts a specific action type payload safely for our handlers
 */
type PayloadFor<T extends ReviewAction["type"]> = Extract<
  ReviewAction,
  { type: T }
>["payload"];

/**
 * =========================================================
 * Action Handlers
 * =========================================================
 * Each function is responsible ONLY for its specific slice of state logic.
 */

const handleBootstrap = (
  state: ReviewState,
  payload: PayloadFor<"bootstrap_reviews">,
): ReviewState => {
  const normalized: Record<string, ReviewView> = {};
  for (const review of payload) {
    normalized[review.review._id] = review;
  }
  return { ...state, reviews: normalized };
};

const handleCreateOptimistic = (
  state: ReviewState,
  payload: PayloadFor<"review_create_optimistic">,
): ReviewState => {
  const { review, operationId } = payload;
  return {
    ...state,
    reviews: { ...state.reviews, [review.review._id]: review },
    pendingReviewOperations: {
      ...state.pendingReviewOperations,
      [review.review._id]: {
        operationId,
        type: "create",
        startedAt: Date.now(),
      },
    },
  };
};

const handleUpdateOptimistic = (
  state: ReviewState,
  payload: PayloadFor<"review_update_optimistic">,
): ReviewState => {
  const { reviewId, rating, comment, operationId } = payload;
  const existing = state.reviews[reviewId];
  if (!existing) return state;

  return {
    ...state,
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
        snapshot: structuredClone(existing),
        startedAt: Date.now(),
      },
    },
  };
};

const handleReviewProjectionReceived = (
  state: ReviewState,
  payload: PayloadFor<"review_projection_received">,
): ReviewState => {
  const incoming = payload.review;
  const existing = state.reviews[incoming._id];
  const pending = { ...state.pendingReviewOperations };
  delete pending[incoming._id];

  // New Realtime Review
  if (!existing) {
    return {
      ...state,
      reviews: {
        ...state.reviews,
        [incoming._id]: {
          review: { ...incoming },
          metrics: { reviewId: incoming._id, likesCount: 0, dislikesCount: 0 },
          confirmedReaction: null,
          pendingMutations: [],
        },
      },
      pendingReviewOperations: pending,
    };
  }

  // Idempotent protection
  if (incoming._rev === existing.review._rev) return state;

  return {
    ...state,
    reviews: {
      ...state.reviews,
      [incoming._id]: {
        ...existing,
        review: {
          ...existing.review,
          ...incoming,
          foodName: existing.review?.foodName, // Preserve denormalized fields
          user: existing.review?.user,
        },
      },
    },
    pendingReviewOperations: pending,
  };
};

const handleReviewRemoval = (
  state: ReviewState,
  payload: { reviewId: string; operationId?: string },
): ReviewState => {
  const { reviewId, operationId } = payload;
  const existing = state.reviews[reviewId];
  if (!existing) return state;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [reviewId]: _, ...nextReviews } = state.reviews;

  if (operationId) {
    return {
      ...state,
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
  }

  return { ...state, reviews: nextReviews };
};

const handleOperationField = (
  state: ReviewState,
  payload: PayloadFor<"review_operation_field">,
): ReviewState => {
  const { reviewId } = payload;
  const operation = state.pendingReviewOperations[reviewId];
  if (!operation) return state;

  const nextPending = { ...state.pendingReviewOperations };
  delete nextPending[reviewId];

  if (operation.type === "create") {
    const nextReviews = { ...state.reviews };
    delete nextReviews[reviewId];
    return {
      ...state,
      reviews: nextReviews,
      pendingReviewOperations: nextPending,
    };
  }

  // Restore snapshot for failed update/delete
  if (!operation.snapshot) return state;
  return {
    ...state,
    reviews: { ...state.reviews, [reviewId]: operation.snapshot },
    pendingReviewOperations: nextPending,
  };
};

const handleMetricsProjection = (
  state: ReviewState,
  payload: PayloadFor<"metrics_projection_received">,
): ReviewState => {
  const { reviewId, likesCount, dislikesCount } = payload;
  const existing = state.reviews[reviewId];
  if (!existing) return state;

  // Idempotent protection
  if (
    existing.metrics.likesCount === likesCount &&
    existing.metrics.dislikesCount === dislikesCount
  ) {
    return state;
  }

  const nextView = applyMutationPruning({
    ...existing,
    metrics: { reviewId, likesCount, dislikesCount },
  });

  return { ...state, reviews: { ...state.reviews, [reviewId]: nextView } };
};

const handleReactionProjection = (
  state: ReviewState,
  payload: PayloadFor<"reaction_projection_received">,
): ReviewState => {
  const { reviewId, reaction } = payload;
  const existing = state.reviews[reviewId];
  if (!existing) return state;

  const nextView = applyMutationPruning({
    ...existing,
    confirmedReaction: reaction,
  });

  return { ...state, reviews: { ...state.reviews, [reviewId]: nextView } };
};

const handleMutationStarted = (
  state: ReviewState,
  payload: PayloadFor<"reaction_mutation_started">,
): ReviewState => {
  const { reviewId, mutation } = payload;
  const existing = state.reviews[reviewId];
  if (!existing) return state;

  return {
    ...state,
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
};

const handleMutationFailed = (
  state: ReviewState,
  payload: PayloadFor<"reaction_mutation_failed">,
): ReviewState => {
  const { reviewId, mutationId } = payload;
  const existing = state.reviews[reviewId];
  if (!existing) return state;

  // Ignore stale rollbacks
  if (!existing.pendingMutations.some((m) => m.mutationId === mutationId))
    return state;

  return {
    ...state,
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
};

/**
 * =========================================================
 * Reducer Entry Point
 * =========================================================
 * Clean, safe, and decoupled.
 */

export function reviewReducer(
  state: ReviewState,
  action: ReviewAction,
): ReviewState {
  switch (action.type) {
    case "bootstrap_reviews":
      return handleBootstrap(state, action.payload);
    case "review_create_optimistic":
      return handleCreateOptimistic(state, action.payload);
    case "review_update_optimistic":
      return handleUpdateOptimistic(state, action.payload);
    case "review_delete_optimistic":
      return handleReviewRemoval(state, action.payload);
    case "review_projection_removed":
      return handleReviewRemoval(state, action.payload);
    case "review_operation_field":
      return handleOperationField(state, action.payload);
    case "review_projection_received":
      return handleReviewProjectionReceived(state, action.payload);
    case "metrics_projection_received":
      return handleMetricsProjection(state, action.payload);
    case "reaction_projection_received":
      return handleReactionProjection(state, action.payload);
    case "reaction_mutation_started":
      return handleMutationStarted(state, action.payload);
    case "reaction_mutation_failed":
      return handleMutationFailed(state, action.payload);
    default:
      return state;
  }
}

// export function reviewReducer_(
//   state: ReviewState,
//   action: ReviewAction,
// ): ReviewState {
//   switch (action.type) {
//     /**
//      * =====================================================
//      * Initial SSR hydration
//      * =====================================================
//      */
//     case "bootstrap_reviews": {
//       const normalized: Record<string, ReviewView> = {};
//       for (const review of action.payload) {
//         normalized[review.review._id] = review;
//       }

//       return {
//         reviews: normalized,
//         pendingReviewOperations: state.pendingReviewOperations,
//       };
//     }

//     /**
//      * =====================================================
//      * Review create optimistic
//      * =====================================================
//      */

//     case "review_create_optimistic": {
//       const { review, operationId } = action.payload;

//       return {
//         ...state,
//         reviews: {
//           ...state.reviews,
//           [review.review._id]: review,
//         },
//         pendingReviewOperations: {
//           ...state.pendingReviewOperations,
//           [review.review._id]: {
//             operationId,
//             type: "create",
//             startedAt: Date.now(),
//           },
//         },
//       };
//     }

//     /**
//      * =====================================================
//      * Review update optimistic
//      * =====================================================
//      */

//     case "review_update_optimistic": {
//       const { reviewId, rating, comment, operationId } = action.payload;

//       const existing = state.reviews[reviewId];

//       if (!existing) {
//         return state;
//       }

//       return {
//         ...state,
//         reviews: {
//           ...state.reviews,
//           [reviewId]: {
//             ...existing,
//             review: {
//               ...existing.review,
//               rating,
//               comment,
//             },
//           },
//         },
//         pendingReviewOperations: {
//           ...state.pendingReviewOperations,
//           [reviewId]: {
//             operationId,
//             type: "update",
//             snapshot: structuredClone(existing),
//             startedAt: Date.now(),
//           },
//         },
//       };
//     }

//     /**
//      * =====================================================
//      * Review projection updates
//      * =====================================================
//      */
//     case "review_projection_received": {
//       const pending = {
//         ...state.pendingReviewOperations,
//       };
//       const incoming = action.payload.review;

//       const existing = state.reviews[incoming._id];
//       const existingReview = existing?.review;

//       delete pending[incoming._id];

//       /**
//        * ==========================================
//        * New realtime review
//        * ==========================================
//        */

//       if (!existing) {
//         return {
//           ...state,
//           reviews: {
//             ...state.reviews,
//             [incoming._id]: {
//               review: {
//                 ...existingReview,
//                 ...incoming,
//               },
//               metrics: {
//                 reviewId: incoming._id,
//                 likesCount: 0,
//                 dislikesCount: 0,
//               },
//               confirmedReaction: null,
//               pendingMutations: [],
//             },
//           },
//           pendingReviewOperations: pending,
//         };
//       }

//       /**
//        * ==========================================
//        * Idempotent protection
//        * ==========================================
//        */

//       if (incoming._rev === existing.review._rev) {
//         return state;
//       }

//       return {
//         ...state,
//         reviews: {
//           ...state.reviews,
//           [incoming._id]: {
//             ...existing,
//             review: {
//               ...existingReview,
//               ...incoming,
//               /**
//                * Preserve denormalized static fields
//                */

//               foodName: existingReview?.foodName,
//               user: existingReview?.user,

//               /**
//                * Reconciled metrics
//                */
//             },
//           },
//         },
//         pendingReviewOperations: pending,
//       };
//     }
//     /**
//      * =====================================================
//      * Review projection removed and Review delete optimistic
//      * =====================================================
//      */
//     case "review_delete_optimistic":
//     case "review_projection_removed": {
//       let operationId: string | undefined;
//       if (
//         action.type === "review_delete_optimistic" &&
//         "operationId" in action.payload
//       ) {
//         operationId = action.payload.operationId;
//       }

//       const { reviewId } = action.payload;

//       const existing = state.reviews[reviewId];

//       /**
//        * Ignore if review doesn't exist
//        */
//       if (!existing) {
//         return state;
//       }

//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       const { [reviewId]: _, ...next } = state.reviews;

//       if (operationId) {
//         return {
//           ...state,
//           reviews: next,
//           pendingReviewOperations: {
//             ...state.pendingReviewOperations,
//             [reviewId]: {
//               operationId,
//               type: "delete",
//               snapshot: structuredClone(existing),
//               startedAt: Date.now(),
//             },
//           },
//         };
//       } else {
//         return {
//           ...state,
//           reviews: next,
//         };
//       }
//     }

//     case "review_operation_field": {
//       const { reviewId } = action.payload;

//       const operation = state.pendingReviewOperations[reviewId];
//       if (!operation) {
//         return state;
//       }

//       const nextPending = {
//         ...state.pendingReviewOperations,
//       };
//       delete nextPending[reviewId];

//       switch (operation.type) {
//         case "create": {
//           const nextReviews = {
//             ...state.reviews,
//           };
//           delete nextReviews[reviewId];

//           return {
//             ...state,
//             reviews: nextReviews,
//             pendingReviewOperations: nextPending,
//           };
//         }
//         case "update":
//         case "delete": {
//           if (!operation.snapshot) {
//             return state;
//           }
//           return {
//             ...state,
//             reviews: {
//               ...state.reviews,
//               [reviewId]: operation.snapshot,
//             },
//             pendingReviewOperations: nextPending,
//           };
//         }
//       }
//     }

//     /**
//      * =====================================================
//      * Metrics projection received
//      * =====================================================
//      */
//     case "metrics_projection_received": {
//       const { reviewId, likesCount, dislikesCount } = action.payload;

//       const existing = state.reviews[reviewId];

//       /**
//        * Ignore metrics for reviews that don't exist
//        */
//       if (!existing) {
//         return state;
//       }

//       /**
//        * ==========================================
//        * Idempotent protection
//        * ==========================================
//        */
//       if (
//         existing.metrics.likesCount === likesCount &&
//         existing.metrics.dislikesCount === dislikesCount
//       ) {
//         return state;
//       }

//       /**
//        * ======================================
//        * Latest optimistic mutation
//        * ======================================
//        */

//       const nextView: ReviewView = {
//         ...existing,

//         metrics: {
//           reviewId,
//           likesCount,
//           dislikesCount,
//         },
//       };

//       nextView.pendingMutations = pruneResolvedMutations(nextView);

//       nextView.pendingMutations = pruneExpiredMutations(
//         nextView.pendingMutations,
//       );

//       return {
//         ...state,
//         reviews: {
//           ...state.reviews,

//           [reviewId]: nextView,
//         },
//       };
//     }

//     /**
//      * =====================================================
//      * Reaction projection updates
//      * =====================================================
//      */

//     case "reaction_projection_received": {
//       const { reviewId, reaction, mutationId } = action.payload;

//       const existing = state.reviews[reviewId];

//       if (!existing) {
//         return state;
//       }

//       const nextReview: ReviewView = {
//         ...existing,
//         confirmedReaction: reaction,
//       };

//       nextReview.pendingMutations = pruneResolvedMutations(nextReview);

//       nextReview.pendingMutations = pruneExpiredMutations(
//         nextReview.pendingMutations,
//       );

//       return {
//         ...state,

//         reviews: {
//           ...state.reviews,

//           [reviewId]: nextReview,
//         },
//       };
//     }

//     /**
//      * =====================================================
//      * Optimistic mutation started
//      * =====================================================
//      */

//     case "reaction_mutation_started": {
//       const { reviewId, mutation } = action.payload;

//       const existing = state.reviews[reviewId];

//       if (!existing) {
//         return state;
//       }

//       return {
//         ...state,

//         reviews: {
//           ...state.reviews,

//           [reviewId]: {
//             ...existing,

//             pendingMutations: [
//               ...existing.pendingMutations,
//               {
//                 ...mutation,
//                 reactionConfirmed: false,
//               },
//             ],
//           },
//         },
//       };
//     }

//     /**
//      * =====================================================
//      * Optimistic rollback
//      * =====================================================
//      */

//     case "reaction_mutation_failed": {
//       const { reviewId, mutationId } = action.payload;

//       const existing = state.reviews[reviewId];

//       if (!existing) {
//         return state;
//       }

//       /**
//        * Ignore stale rollback
//        */

//       if (!existing.pendingMutations.some((m) => m.mutationId === mutationId)) {
//         return state;
//       }

//       return {
//         ...state,

//         reviews: {
//           ...state.reviews,

//           [reviewId]: {
//             ...existing,

//             pendingMutations: existing.pendingMutations.filter(
//               (m) => m.mutationId !== mutationId,
//             ),
//           },
//         },
//       };
//     }
//     default:
//       return state;
//   }
// }
