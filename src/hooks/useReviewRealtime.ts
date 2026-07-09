/**
 * =========================================================
 * Realtime review projection synchronization
 * =========================================================
 */

import { client } from "@/sanity/lib/client";

import { useEffect } from "react";
import { ReviewStatic } from "../../types/sanityTypes";
import { UserImage } from "../../sanity.types";
import { useReviewActions } from "@/stores/review/useReviewSelectors";

interface useReviewRealtimeOptions {
  foodId?: string;
}

const REVIEW_PROJECTION_QUERY = `*[
  _type == "review"
  && food._ref == $foodId
  && approved == true
]{
  _id, _type, _rev, _createdAt, _updatedAt,
  rating, comment, approved, food,
  "foodName": food->name,
  "user": user->{
    _id,
    name,
    image
  }
}
`;

export function useReviewRealtime({ foodId }: useReviewRealtimeOptions) {
  const action = useReviewActions();

  useEffect(() => {
    if (!foodId) {
      return;
    }

    let isMounted = true;
    const abortController = new AbortController();

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
      .subscribe({
        next: async (event) => {
          /**
           * =================================================
           * Deletion: review removed
           * =================================================
           */

          if (!("transition" in event)) {
            return;
          }

          const transition = event.transition;

          // Handle Deletion
          if (transition === "disappear") {
            if (isMounted) {
              action.reviewProjectionRemoved(event.documentId);
            }
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
          try {
            // ASYNC FETCH: We must protect against unmounts here!
            const normalizedResult = await client.fetch<{
              user: { _id: string; name: string; image: UserImage };
              foodName: string;
            }>(
              `*[_id == $docID][0]{ "user": user->{ _id, name, image }, "foodName": food->name }`,
              {
                docID: result?._id,
              },
              { signal: abortController.signal }, // Can be aborted if unmounted
            );

            // MEMORY LEAK PREVENTION: Do not dispatch if component unmounted while fetching
            if (!isMounted) return;

            /**
             * =================================================
             * Normalize server projection
             * =================================================
             */

            action.reviewProjectionReceived({
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
            });
          } catch (err: unknown) {
            // Ignore abort errors natively triggered by cleanup
            if (err instanceof Error && err.name === "AbortError") {
              console.log(
                "Realtime review fetch aborted (component unmounted)",
              );
            } else {
              console.error("Failed to normalize review projection:", err);
            }
          }
        },
        error: (err) => {
          console.error("Sanity Review Realtime Listener Error:", err);
        },
      });

    /**
     * =================================================
     * Cleanup
     * =================================================
     */

    // RIGOROUS TEARDOWN
    return () => {
      isMounted = false;
      abortController.abort();
      subscribe.unsubscribe();
    };
  }, [foodId, action]);
}
