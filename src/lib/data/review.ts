import { client } from "@/sanity/lib/client";
import {
  REVIEWS_BY_FOOD_ID_QUERY,
  REVIEWS_WITH_REACTIONS_BY_FOOD_ID_QUERY,
} from "../query";
import { ReviewsWithReactionsByFoodIdQueryResult } from "../../../types/sanityTypes";
import { cache } from "react";

export async function toggleReaction({
  reviewId,
  userId,
  type, // "like" | "dislike"
}: {
  reviewId: string;
  userId: string;
  type: "like" | "dislike";
}) {
  const existing = await client.fetch(
    `*[_type == "reviewReaction" && review._ref == $reviewId && user._ref == $userId][0]`,
    { reviewId, userId },
  );

  const transaction = client.transaction();

  if (!existing) {
    // ➕ create new reaction
    transaction.create({
      _type: "reviewReaction",
      review: { _type: "reference", _ref: reviewId },
      user: { _type: "reference", _ref: userId },
      type,
    });

    // update counters
    transaction.patch(reviewId, (p) =>
      p.inc({
        likesCount: type === "like" ? 1 : 0,
        dislikesCount: type === "dislike" ? 1 : 0,
      }),
    );
  } else if (existing.type === type) {
    // ❌ remove reaction (toggle off)
    transaction.delete(existing._id);

    transaction.patch(reviewId, (p) =>
      p.dec({
        likesCount: type === "like" ? 1 : 0,
        dislikesCount: type === "dislike" ? 1 : 0,
      }),
    );
  } else {
    // 🔁 switch reaction
    transaction.patch(existing._id, {
      set: { type },
    });

    transaction.patch(reviewId, (p) =>
      p.inc({
        likesCount: type === "like" ? 1 : -1,
        dislikesCount: type === "dislike" ? 1 : -1,
      }),
    );
  }

  return transaction.commit();
}

export const getReviewsByFoodId = cache(
  async (foodId: string, userId?: string) => {
    if (userId) {
      const reviews = await client.fetch<
        ReviewsWithReactionsByFoodIdQueryResult[]
      >(REVIEWS_WITH_REACTIONS_BY_FOOD_ID_QUERY, {
        foodId,
        userId,
      });
      return reviews;
    }
    const reviews = await client.fetch<
      ReviewsWithReactionsByFoodIdQueryResult[]
    >(REVIEWS_BY_FOOD_ID_QUERY, {
      foodId,
    });
    return reviews;
  },
);

export const getReviewsReactionByFoodId = cache(
  async (foodId: string, userId: string) => {
    console.log("foodId", foodId);
    console.log("userId", userId);
    const reviews = await client.fetch<
      ReviewsWithReactionsByFoodIdQueryResult[]
    >(REVIEWS_WITH_REACTIONS_BY_FOOD_ID_QUERY, {
      foodId,
      userId,
    });
    return reviews;
  },
);
