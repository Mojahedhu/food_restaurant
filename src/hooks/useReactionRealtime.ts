import { getReviewIdFromReactionId } from "@/lib/utils/helpers";
import { client } from "@/sanity/lib/client";
import { useReviewActions } from "@/stores/review/useReviewSelectors";
import { useEffect } from "react";

/**
 * =========================================================
 * Realtime reaction synchronization
 * =========================================================
 */

interface useReactionRealtimeOptions {
  foodId?: string;

  userId?: string;
}

const BASE_REACTION_REALTIME_QUERY = `*[
  _type == "reviewReaction"
  && food._ref == $foodId
  && user._ref == $userId
]`;

export function useReactionRealtime({
  foodId,
  userId,
}: useReactionRealtimeOptions) {
  const actions = useReviewActions();

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

          // Handle reaction removal
          if (event.transition === "disappear") {
            /**
             * reaction.reviewId.userId
             */
            const reviewId = getReviewIdFromReactionId(event.documentId!);

            actions.reactionProjectionReceived(reviewId, null);
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

          actions.reactionProjectionReceived(reviewId, result.type);
        },
        error(error) {
          console.error("Sanity Reaction Listener Error:", error);
        },
        complete() {
          console.log("Sanity Reaction Listener complete");
        },
      });

    return () => {
      subscribe.unsubscribe();
    };
  }, [foodId, userId, actions]);
}
