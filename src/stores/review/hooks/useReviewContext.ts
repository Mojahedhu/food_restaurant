import { useContext, useMemo } from "react";
import { ReviewDisplayState, ReviewView } from "../../../../types/sanityTypes";
import { selectReviewList, getReviewDisplayState } from "../selector";
import { ReviewStateContext } from "../reviewProvider";

/**
 * =========================================================
 * Store Context
 * =========================================================
 */

/**
 * =========================================================
 * Base Store Access
 * =========================================================
 */

/**
 * =========================================================
 * Raw State Access
 * =========================================================
 */

export function useReviewState() {
  const state = useContext(ReviewStateContext);
  if (!state)
    throw new Error("useReviewState must be used within ReviewsProvider");
  return state;
}

/**
 * =========================================================
 * Single Review Selector
 * =========================================================
 */

export function useReview(reviewId: string): ReviewDisplayState | undefined {
  const state = useReviewState();

  // 1. Narrowed Dependency: Extract only the specific slice for this review.
  const reviewSlice = reviewId ? state?.reviews?.[reviewId] : undefined;

  return useMemo(() => {
    // 2. Pure Calculation: Only recompute the display projection if this specific review's slice changes.
    // This stabilizes the object reference, unlocking React.memo performance downstream!
    return getReviewDisplayState(reviewSlice);
  }, [reviewSlice]);
}

/**
 * =========================================================
 * Review List Selector
 * =========================================================
 */

export function useReviewList(): ReviewDisplayState[] {
  const state = useReviewState();

  return useMemo(() => {
    return selectReviewList(state);
  }, [state]);
}

/**
 * =========================================================
 * Internal View Access
 * (advanced/debugging only)
 * =========================================================
 */

export function useReviewView(reviewId?: string): ReviewView | undefined {
  const state = useReviewState();

  // 3. Removed Redundant Memoization: Simple property lookups do not benefit from useMemo.

  return reviewId ? state?.reviews?.[reviewId] : undefined;
}
