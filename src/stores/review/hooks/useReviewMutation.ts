import { useContext } from "react";
import { ReviewDispatchContext } from "../reviewProvider";

/**
 * =========================================================
 * Dispatch Access
 * =========================================================
 */
function useReviewDispatch() {
  const dispatch = useContext(ReviewDispatchContext);
  if (!dispatch)
    throw new Error("useReviewDispatch must be used within ReviewsProvider");
  return dispatch;
}
