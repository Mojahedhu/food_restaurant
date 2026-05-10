"use client";

import { useReviewListener } from "@/hooks/useReviewListener";

import { ReviewsWithReactionsByFoodIdQueryResult } from "../../../../../../types/sanityTypes";

interface FoodReviewProps {
  foodId: string;
  initialReviews: ReviewsWithReactionsByFoodIdQueryResult[];
  userId?: string;
}

const FoodReview = ({ foodId, initialReviews, userId }: FoodReviewProps) => {
  const reviews = useReviewListener(foodId, initialReviews, userId);

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold">Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div key={review._id} className="mb-4 border-b pb-4">
            <p className="font-semibold">{review.user?.name}</p>
            <p className="text-gray-600">{review.comment}</p>
            <p className="text-gray-500">{review.rating} stars</p>
          </div>
        ))
      )}
    </div>
  );
};

export default FoodReview;
