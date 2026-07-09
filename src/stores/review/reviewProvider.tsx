"client";
import { createContext, Dispatch, useMemo, useReducer } from "react";
import { ReviewState, ReviewView } from "@/../types/sanityTypes";
import {
  initialReviewState,
  ReviewAction,
  reviewReducer,
} from "@/stores/review/reducer";

/**
 * =========================================================
 * Context Definitions
 * =========================================================
 * Contexts are strictly separated to prevent unnecessary React tree re-renders.
 * Components consuming only `ReviewDispatchContext` will NOT re-render when `state` changes.
 */

export const ReviewStateContext = createContext<ReviewState | undefined>(
  undefined,
);
export const ReviewDispatchContext = createContext<
  Dispatch<ReviewAction> | undefined
>(undefined);

/**
 * =========================================================
 * Provider
 * =========================================================
 */

interface ReviewsProviderProps {
  children: React.ReactNode;
  initialReviews: ReviewView[];
}

export function ReviewsProvider({
  children,
  initialReviews,
}: ReviewsProviderProps) {
  // 1. Initialize Reducer with Bootstrapped SSR Data
  const [state, dispatch] = useReducer(
    reviewReducer,
    initialReviews,
    (reviews) =>
      reviewReducer(initialReviewState, {
        type: "bootstrap_reviews",
        payload: reviews,
      }),
  );

  // 2. Memoize state wrapper to avoid unnecessary reference churn
  const stateValue = useMemo(() => state, [state]);
  // Note: `dispatch` returned from `useReducer` is inherently stable
  // and does not require useMemo wrapping.

  return (
    <ReviewDispatchContext.Provider value={dispatch}>
      <ReviewStateContext.Provider value={stateValue}>
        {children}
      </ReviewStateContext.Provider>
    </ReviewDispatchContext.Provider>
  );
}
