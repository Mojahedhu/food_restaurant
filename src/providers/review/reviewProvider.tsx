import { createContext, Dispatch, useMemo, useReducer } from "react";
import { ReviewState, ReviewView } from "@/../types/sanityTypes";
import {
  initialReviewState,
  ReviewAction,
  reviewReducer,
} from "@/stores/review/reducer";

interface ReviewsStoreContextValue {
  state: ReviewState;

  dispatch: Dispatch<ReviewAction>;
}

export const ReviewsStoreContext = createContext<
  ReviewsStoreContextValue | undefined
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
  const [state, dispatch] = useReducer(
    reviewReducer,
    initialReviews,
    (reviews) =>
      reviewReducer(initialReviewState, {
        type: "bootstrap_reviews",
        payload: reviews,
      }),
  );

  /**
   * =====================================================
   * Hydrate reducer once
   * =====================================================
   */

  // const hydratedState =
  //   state === initialReviewState ? bootstrappedState : state;

  const value = useMemo(
    () => ({
      state: state,

      dispatch,
    }),
    [state],
  );

  return (
    <ReviewsStoreContext.Provider value={value}>
      {children}
    </ReviewsStoreContext.Provider>
  );
}
