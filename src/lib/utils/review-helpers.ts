import "server-only";
import { urlFor } from "@/sanity/lib/image";
import { SanityAsset } from "@sanity/image-url";

/**
 * Computes food rating average and Bayesian weighted score.
 * Pure function: side-effect free and 100% unit-testable.
 */
export function computeFoodMetrics(ratingSum: number, ratingCount: number) {
  const ratingAverage = ratingCount === 0 ? 0 : ratingSum / ratingCount;

  // Bayesian average constants to prevent 1-star/5-star extreme skew on low volumes
  const minimumReviews = 10;
  const globalAverage = 4.2;
  const weightedRating =
    (ratingCount / (ratingCount + minimumReviews)) * ratingAverage +
    (minimumReviews / (ratingCount + minimumReviews)) * globalAverage;

  return { ratingAverage, weightedRating };
}

/**
 * Deterministic review ID generation to enforce 1 review per user per food.
 */

export function getReviewId(foodId: string, userId: string) {
  return `review_${foodId}_${userId}`;
}

/*
 *  Image Helper Functions
 *  Usage: getImageUrl(imageSource)
 */
export const getImageUrl = (imageSource?: SanityAsset | string) => {
  if (!imageSource) return "";
  if (typeof imageSource === "string") {
    if (imageSource.startsWith("http") || imageSource.startsWith("/")) {
      return imageSource;
    }
    return imageSource;
  }
  try {
    return urlFor(imageSource).url();
  } catch (e) {
    return `${e}`;
  }
};

/**
 * =========================================================
 * ReactionId
 * =========================================================
 */

export function getReactionId(reviewId: string, userId: string) {
  return `reaction_${reviewId}_${userId}`;
}

/**
 * =========================================================
 * MetricsId
 * =========================================================
 */

export function getMetricsId(reviewId: string) {
  return `metrics_${reviewId}`;
}

/**
 * ========================================
 * Bayesian weighted score
 * ========================================
 */

export function calculateWeightedRating({
  average,
  count,
  globalAverage = 4.2,
  minimumReviews = 10,
}: {
  average: number;
  count: number;
  globalAverage?: number;
  minimumReviews?: number;
}) {
  return (
    (count / (count + minimumReviews)) * average +
    (minimumReviews / (count + minimumReviews)) * globalAverage
  );
}
