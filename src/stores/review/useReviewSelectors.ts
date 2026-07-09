import { useShallow } from "zustand/react/shallow";

import { getReviewDisplayState } from "./selector"; // Ensure this returns ReviewDisplayState
import { ReviewDisplayState } from "@/../types/sanityTypes";
import { useReviewStoreContext } from "./ReviewStoreProvider";

// 👇 ADD THIS NEW SELECTOR
export const useHasHydrated = () => {
  return useReviewStoreContext((state) => state.hasHydrated);
};

/**
 * =========================================================
 * 1. Action Dispatchers
 * =========================================================
 * Use useShallow to ensure the object reference remains perfectly stable.
 * This guarantees components consuming actions NEVER re-render when state changes.
 */
export const useReviewActions = () => {
  return useReviewStoreContext(
    useShallow((state) => ({
      bootstrapReviews: state.bootstrapReviews,
      reviewCreateOptimistic: state.reviewCreateOptimistic,
      reviewUpdateOptimistic: state.reviewUpdateOptimistic,
      reviewDeleteOptimistic: state.reviewDeleteOptimistic,
      reactionMutationStarted: state.reactionMutationStarted,
      reviewProjectionReceived: state.reviewProjectionReceived,
      reviewProjectionRemoved: state.reviewProjectionRemoved,
      metricsProjectionReceived: state.metricsProjectionReceived,
      reactionProjectionReceived: state.reactionProjectionReceived,
      reactionMutationFailed: state.reactionMutationFailed,
      reviewOperationField: state.reviewOperationFailed,

      // ... spread the rest of the actions you need to trigger from UI
    })),
  );
};

/**
 * =========================================================
 * 2. List-Level Selectors
 * =========================================================
 * Returns an array of IDs. The list component will only render if items are added or removed.
 * It ignores changes inside specific reviews (like reaction counts).
 */
export const useReviewIds = (): string[] => {
  return useReviewStoreContext(
    useShallow((state) =>
      Object.values(state.reviews)
        .filter((view) => Boolean(view?.review?._createdAt))
        .sort((a, b) => {
          const timeA = new Date(a.review._createdAt).getTime() || 0;
          const timeB = new Date(b.review._createdAt).getTime() || 0;
          return timeB - timeA;
        })
        .map((r) => r.review._id),
    ),
  );
};

/**
 * =========================================================
 * 3. Card-Level Selectors (Atomic Subscriptions)
 * =========================================================
 * Subscribes strictly to a SINGLE review in the Record.
 * Returns the exact ReviewDisplayState projection required for the UI.
 * This effectively memoizes every ReviewCard automatically!
 */
/**
 * This hook consumes a ReviewView from our Store state
 * and returns the exact ReviewDisplayState defined in sanityTypes.ts
 */
export const useReviewDisplay = (
  reviewId: string,
): ReviewDisplayState | undefined => {
  return useReviewStoreContext(
    useShallow((state) => {
      // We use a primitive string ID to drill directly into the record in O(1) time
      const rawView = state.reviews[reviewId];
      if (!rawView) return undefined;

      // Calculate display projection (likes logic, etc)
      // Projections should be stable calculations
      // useShallow will prevent the infinite loop by checking the returned properties!
      return getReviewDisplayState(rawView);
    }),
  );
};

/**
 * Subscribes STRICTLY to the static review data (text, rating, user).
 * This component will completely ignore changes to likes/dislikes!
 */
export const useReviewStatic = (reviewId: string) => {
  return useReviewStoreContext((state) => state.reviews[reviewId]?.review);
};
