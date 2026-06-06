"use client";

import { ReviewsProvider } from "@/providers/review/reviewProvider";
import { ReviewView } from "../../../../../../types/sanityTypes";
import { ReviewRealtimeBoundary } from "@/components/common/reviewRealtimeBoundary";

interface ReviewClientProviderProps {
  children: React.ReactNode;
  initialReviews: ReviewView[];
  foodId: string;
  userId?: string;
}

const ReviewClientProvider = ({
  children,
  initialReviews,
  foodId,
  userId,
}: ReviewClientProviderProps) => {
  return (
    <ReviewsProvider initialReviews={initialReviews}>
      <ReviewRealtimeBoundary foodId={foodId} userId={userId!}>
        {children}
      </ReviewRealtimeBoundary>
    </ReviewsProvider>
  );
};

export default ReviewClientProvider;
