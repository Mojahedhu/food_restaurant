"use client";

import { useReactionRealtime } from "@/hooks/useReactionRealtime";
import { useReviewMetricsRealtime } from "@/hooks/useReviewMetricsRealtime";
import { useReviewRealtime } from "@/hooks/useReviewRealtime";
import { ReactNode } from "react";

interface ReviewRealtimeBoundaryProps {
  children: ReactNode;
  foodId: string;
  userId: string;
}

export function ReviewRealtimeBoundary({
  children,
  foodId,
  userId,
}: ReviewRealtimeBoundaryProps) {
  useReviewRealtime({ foodId });

  useReactionRealtime({ foodId, userId });

  useReviewMetricsRealtime({ foodId });

  return children;
}
