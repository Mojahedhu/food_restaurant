/**
 * =========================================================
 * Realtime review projection synchronization
 * =========================================================
 */

import { client } from "@/sanity/lib/client";
import { useReviewDispatch } from "@/stores/review/hooks/useReviewsState";
import { useEffect } from "react";
import { ReviewStatic } from "../../types/sanityTypes";
import { UserImage } from "../../sanity.types";

interface useReviewRealtimeOptions {
  foodId: string;
}

const REVIEW_PROJECTION_QUERY = `*[
  _type == "review"
  && food._ref == $foodId
  && approved == true
]{
  _id,
  _type,
  _rev,
  _createdAt,
  _updatedAt,

  rating,
  comment,
  approved,

  food,

  "foodName": food->name,

  "user": user->{
    _id,
    name,
    image
  }
}
`;

export function useReviewRealtime({ foodId }: useReviewRealtimeOptions) {
  const dispatch = useReviewDispatch();

  useEffect(() => {
    if (!foodId) {
      return;
    }

    /**
     * =====================================================
     * Review projection stream
     * =====================================================
     */

    const subscribe = client
      .listen<ReviewStatic>(
        REVIEW_PROJECTION_QUERY,
        { foodId },
        {
          includeResult: true,
          includePreviousRevision: true,
          visibility: "query",
        },
      )
      .subscribe(async (event) => {
        /**
         * =================================================
         * Deletion: review removed
         * =================================================
         */

        if (!("transition" in event)) {
          return;
        }

        const transition = event.transition;

        if (transition === "disappear") {
          dispatch({
            type: "review_projection_removed",
            payload: {
              reviewId: event.documentId,

              /**
               * fallback
               */
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
        const normalizedResult = await client.fetch<{
          user: { _id: string; name: string; image: UserImage };
          foodName: string;
        }>(
          `*[_id == $docID][0]{ "user": user->{ _id, name, image }, "foodName": food->name }`,
          {
            docID: result?._id,
          },
        );

        if (!result) {
          return;
        }
        console.log("result", result);
        console.log("normalizedResult", normalizedResult);

        /**
         * =================================================
         * Normalize server projection
         * =================================================
         */

        dispatch({
          type: "review_projection_received",
          payload: {
            review: {
              _id: result._id,

              _type: "review",

              rating: result.rating,

              comment: result.comment,

              approved: result.approved,

              food: result.food,

              foodName: normalizedResult.foodName,

              user: normalizedResult.user,

              _createdAt: result._createdAt,

              _updatedAt: result._updatedAt,

              _rev: result._rev,
            },
          },
        });
      });

    /**
     * =================================================
     * Cleanup
     * =================================================
     */

    return () => {
      subscribe.unsubscribe();
    };
  }, [foodId, dispatch]);
}
