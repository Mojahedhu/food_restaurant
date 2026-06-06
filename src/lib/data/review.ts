import { client } from "@/sanity/lib/client";
import {
  DISLIKES_COUNT_QUERY,
  LIKES_COUNT_QUERY,
  MY_REVIEW_REACTION_QUERY,
  REVIEWS_METRIC_BY_FOOD_ID_QUERY,
  REVIEWS_STATIC_BY_FOOD_ID_QUERY,
} from "../query";

import { cache } from "react";
import {
  ReviewMetricsProjection,
  ReviewStatic,
  ReviewView,
} from "../../../types/sanityTypes";
import { ReactionType } from "../../../sanity.types";
import auth from "../../../auth";

export const getReviewsByFoodId = cache(
  async (foodId: string, userId?: string): Promise<ReviewView[]> => {
    const reviews = await client.fetch<ReviewStatic[]>(
      REVIEWS_STATIC_BY_FOOD_ID_QUERY,
      {
        foodId,
        userId,
      },
      {
        next: {
          tags: [`reviews:${foodId}`],
          revalidate: 300,
        },
      },
    );
    return reviews.map(
      (review): ReviewView => ({
        review,
        metrics: {
          reviewId: review._id,
          likesCount: 0,
          dislikesCount: 0,
        },

        // confirmedReaction: review.confirmedReaction ?? null,

        confirmedReaction: null,

        pendingMutations: [],
      }),
    );
  },
);

/**
 * ================================================================
 * Dynamic review query
 * ===============================================================
 */

export async function getReviewMetrics(foodId: string) {
  return client.fetch<ReviewMetricsProjection[]>(
    REVIEWS_METRIC_BY_FOOD_ID_QUERY,
    { foodId },
    {
      next: {
        revalidate: 0,
      },
    },
  );
}

// IMPORTANT:
// DO NOT cache user-personalized data.

export const getMyReviewReactions = async (
  foodId: string,
): Promise<Record<string, ReactionType | undefined> | null> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }
  const result = await client.fetch<
    {
      reviewId: string;
      confirmedReaction?: ReactionType;
    }[]
  >(
    MY_REVIEW_REACTION_QUERY,
    {
      foodId,
      userId,
    },
    {
      cache: "no-store",
    },
  );
  return result?.reduce(
    (acc, item) => {
      acc[item.reviewId] = item.confirmedReaction;
      return acc;
    },
    {} as Record<string, ReactionType | undefined>,
  );
};

export function mergeReviewFeed({
  reviews,
  metrics,
  reactions,
}: {
  reviews: ReviewView[];

  metrics: ReviewMetricsProjection[] | null;

  reactions: Record<string, ReactionType | undefined> | null;
}): ReviewView[] {
  const metricsMap = metrics?.reduce(
    (acc, metric) => {
      acc[metric.reviewId] = metric;
      return acc;
    },
    {} as Record<string, ReviewMetricsProjection>,
  );

  return reviews.map((view) => {
    const metric = metricsMap?.[view.review._id];

    return {
      ...view,
      metrics: metric ?? {
        reviewId: view.review._id,
        likesCount: 0,
        dislikesCount: 0,
      },

      confirmedReaction: reactions?.[view.review._id] ?? null,
    };
  });
}

export function getLikesCount(reviewId: string) {
  return client.fetch<number>(LIKES_COUNT_QUERY, { reviewId }, {});
}

export function getDislikesCount(reviewId: string) {
  return client.fetch<number>(DISLIKES_COUNT_QUERY, { reviewId }, {});
}
