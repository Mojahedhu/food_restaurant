"use client";

import { useReactionRealtime } from "@/hooks/useReactionRealtime";
import { useReviewMetricsRealtime } from "@/hooks/useReviewMetricsRealtime";
import { useReviewRealtime } from "@/hooks/useReviewRealtime";
import { ReactNode } from "react";

interface ReviewRealtimeBoundaryProps {
  children: ReactNode;
  foodId?: string;
  userId?: string;
}

export function ReviewRealtimeBoundary({
  children,
  foodId,
  userId,
}: ReviewRealtimeBoundaryProps) {
  // 1. Listen for new/deleted reviews
  useReviewRealtime({ foodId });

  // 2. Listen for current user's reaction updates (likes/dislikes)
  useReactionRealtime({ foodId, userId });

  // 3. Listen for global metric aggregations (total likes/dislikes)
  useReviewMetricsRealtime({ foodId });

  return <>{children}</>;
}
