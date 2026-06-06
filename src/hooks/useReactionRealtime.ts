import { getReviewIdFromReactionId } from "@/lib/utils/helpers";
import { client } from "@/sanity/lib/client";

import { useReviewDispatch } from "@/stores/review/hooks/useReviewsState";
import { useEffect } from "react";

/**
 * =========================================================
 * Realtime reaction synchronization
 * =========================================================
 */

interface useReactionRealtimeOptions {
  foodId: string;

  userId: string;
}

const BASE_REACTION_REALTIME_QUERY = `*[
  _type == "reviewReaction"
  && food._ref == $foodId
  && user._ref == $userId
]`;

const REACTION_REALTIME_QUERY = `*[
    _type == "reviewReaction"
    && food._ref == $foodId
    && user._ref == $userId
  ]{
    mutationId,
    review,
    food,
    user,
    type  
  }`;

export function useReactionRealtime({
  foodId,
  userId,
}: useReactionRealtimeOptions) {
  const dispatch = useReviewDispatch();

  useEffect(() => {
    if (!userId || !foodId) {
      return;
    }

    /**
     * =====================================================
     * User reaction stream
     * =====================================================
     */

    const subscribe = client
      .listen(
        BASE_REACTION_REALTIME_QUERY,
        {
          userId,
          foodId,
        },
        {
          includeResult: true,
          includePreviousRevision: true,
          visibility: "query",
        },
      )
      .subscribe({
        next(event) {
          /**
           * =================================================
           * Reaction removed
           * =================================================
           */

          if (!("transition" in event)) {
            return;
          }

          if (event.transition === "disappear") {
            /**
             * reaction.reviewId.userId
             */
            const reviewId = getReviewIdFromReactionId(event.documentId!);

            dispatch({
              type: "reaction_projection_received",
              payload: {
                reviewId,
                reaction: null,
              },
            });
            return;
          }

          /**
           * =================================================
           * Ignore malformed packets
           * =================================================
           */

          const result = event.result;

          if (!result) {
            return;
          }

          const reviewId =
            result.review._ref ?? getReviewIdFromReactionId(event.documentId!);

          if (!reviewId) {
            return;
          }

          dispatch({
            type: "reaction_projection_received",
            payload: {
              reviewId,
              reaction: result.type,
              mutationId: result.mutationId,
            },
          });
        },
        error(error) {
          console.error("reaction listener error", error);
        },
        complete() {
          console.log("listener complete");
        },
      });

    return () => {
      subscribe.unsubscribe();
    };
  }, [foodId, userId, dispatch]);
}
