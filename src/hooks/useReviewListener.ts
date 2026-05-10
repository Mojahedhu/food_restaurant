"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import { getReviewsReactionByFoodId } from "@/lib/data/review";
import { ReviewsWithReactionsByFoodIdQueryResult } from "../../types/sanityTypes";
import { REVIEWS_WITH_REACTIONS_BY_FOOD_ID_QUERY } from "@/lib/query";

export function useReviewListener(
  foodId: string,
  initialReviews: ReviewsWithReactionsByFoodIdQueryResult[],
  userId?: string,
) {
  const [reviews, setReviews] = useState(initialReviews);
  useEffect(() => {
    if (!foodId) return;
    const sub = client
      .listen(REVIEWS_WITH_REACTIONS_BY_FOOD_ID_QUERY, { foodId, userId })
      .subscribe(async (update) => {
        if (update.transition === "appear") {
          const updatedReview = await getReviewsReactionByFoodId(
            foodId,
            userId as string,
          );
          setReviews(updatedReview);
        }
        if (update.transition === "update") {
          const updatedReview = await getReviewsReactionByFoodId(
            foodId,
            userId as string,
          );
          setReviews(updatedReview);
        }
        if (update.transition === "disappear") {
          const updatedReview = await getReviewsReactionByFoodId(
            foodId,
            userId as string,
          );
          setReviews(updatedReview);
        }
      });

    return () => sub.unsubscribe();
  }, [foodId, userId]);

  return reviews;
}
