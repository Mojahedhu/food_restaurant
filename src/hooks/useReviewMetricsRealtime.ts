import { client } from "@/sanity/lib/client";
import { useReviewDispatch } from "@/stores/review/hooks/useReviewsState";
import { useEffect } from "react";

const METRICS_REALTIME_QUERY = `*[
  _type == "reviewMetrics"
  && food._ref == $foodId
]{
  review,
  likesCount,
  dislikesCount
}`;

export function useReviewMetricsRealtime({ foodId }: { foodId: string }) {
  const dispatch = useReviewDispatch();

  useEffect(() => {
    if (!foodId) {
      return;
    }

    const subscription = client
      .listen(
        METRICS_REALTIME_QUERY,
        { foodId },
        {
          includeResult: true,
          visibility: "query",
        },
      )
      .subscribe((event) => {
        if (!("transition" in event)) {
          return;
        }

        if (event.transition === "disappear") {
          return;
        }

        const result = event.result;

        if (!result) {
          return;
        }

        const reviewId = result.review?._ref;

        if (!reviewId) {
          return;
        }

        dispatch({
          type: "metrics_projection_received",
          payload: {
            reviewId,
            likesCount: result.likesCount ?? 0,
            dislikesCount: result.dislikesCount ?? 0,
          },
        });
      });

    return () => subscription.unsubscribe();
  }, [foodId, dispatch]);
}
