import { useContext, useMemo } from "react";
import { ReviewDisplayState } from "../../../../types/sanityTypes";
import {
  selectReviewView,
  reviewDisplayState,
  selectReviewList,
} from "../selector";
import { ReviewsStoreContext } from "@/providers/review/reviewProvider";

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

export function useReviewStore() {
  const context = useContext(ReviewsStoreContext);

  if (!context) {
    throw new Error("useReviewStore must be used within ReviewsProvider");
  }

  return context;
}

/**
 * =========================================================
 * Dispatch Access
 * =========================================================
 */

export function useReviewDispatch() {
  return useReviewStore().dispatch;
}

/**
 * =========================================================
 * Raw State Access
 * =========================================================
 */

export function useReviewState() {
  return useReviewStore().state;
}

/**
 * =========================================================
 * Single Review Selector
 * =========================================================
 */

export function useReview(reviewId: string): ReviewDisplayState | undefined {
  const { state } = useReviewStore();

  return useMemo(() => {
    return reviewDisplayState(state, reviewId);
  }, [state, reviewId]);
}

/**
 * =========================================================
 * Review List Selector
 * =========================================================
 */

export function useReviewList() {
  const { state } = useReviewStore();

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

export function useReviewView(reviewId: string) {
  const { state } = useReviewStore();

  return useMemo(() => {
    return selectReviewView(state, reviewId);
  }, [state, reviewId]);
}
