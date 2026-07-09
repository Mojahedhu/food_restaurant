import { client } from "@/sanity/lib/client";
import { useReviewActions } from "@/stores/review/useReviewSelectors";
import { useEffect } from "react";

const METRICS_REALTIME_QUERY = `*[
  _type == "reviewMetrics"
  && food._ref == $foodId
]{
  review,
  likesCount,
  dislikesCount
}`;

export function useReviewMetricsRealtime({ foodId }: { foodId?: string }) {
  const actions = useReviewActions();

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
      .subscribe({
        next: (event) => {
          if (!("transition" in event) || event.transition === "disappear") {
            return;
          }

          const result = event.result;
          if (!result) return;

          const reviewId = result.review?._ref;
          if (!reviewId) return;

          actions.metricsProjectionReceived(
            reviewId,
            result.likesCount ?? 0,
            result.dislikesCount ?? 0,
          );
        },
        error: (error) => {
          console.error("Sanity Metrics Listener Error:", error);
        },
      });

    return () => subscription.unsubscribe();
  }, [foodId, actions]);
}
