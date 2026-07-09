"use client";

import { useReviewRealtime } from "@/hooks/useReviewRealtime";
import ReviewForm from "./review-form";
import { ReviewList } from "./review-list";
import { useReactionRealtime } from "@/hooks/useReactionRealtime";
import { useReviewMetricsRealtime } from "@/hooks/useReviewMetricsRealtime";

interface ReviewViewProps {
  foodId?: string;
  userId?: string;
  foodName?: string;
}

export default function ReviewView({
  foodId,
  userId,
  foodName,
}: ReviewViewProps) {
  // 2. Start the realtime listeners!
  useReviewRealtime({ foodId });
  useReactionRealtime({ foodId, userId });
  useReviewMetricsRealtime({ foodId });
  if (!foodId || !foodName) {
    return null;
  }

  return (
    <>
      {/* 
        Rule 7: No more prop drilling! 
        The list only receives the data it needs to render.
      */}
      <ReviewList userId={userId} />

      {/* 
        The form is completely self-sufficient. 
        It listens to the URL internally to know when to open.
      */}
      <ReviewForm foodId={foodId} foodName={foodName} userId={userId} />
    </>
  );
}
