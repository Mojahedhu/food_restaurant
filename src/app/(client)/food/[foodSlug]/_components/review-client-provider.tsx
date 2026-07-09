"use client";

import { ReviewsProvider } from "@/stores/review/reviewProvider";
import { ReviewView } from "@/../types/sanityTypes";
import { ReviewRealtimeBoundary } from "@/components/common/reviewRealtimeBoundary";

interface ReviewClientProviderProps {
  children: React.ReactNode;
  initialReviews: ReviewView[];
  foodId?: string;
  userId?: string;
  foodName?: string;
}

const ReviewClientProvider = ({
  children,
  initialReviews,
  foodId,
  userId,
}: ReviewClientProviderProps) => {
  return (
    <ReviewsProvider initialReviews={initialReviews}>
      {/*
        The boundary mounts ONLY after initialReviews are fully hydrated
        into the Zustand/Context store.
      */}
      <ReviewRealtimeBoundary foodId={foodId} userId={userId}>
        {children}
      </ReviewRealtimeBoundary>
    </ReviewsProvider>
  );
};

export default ReviewClientProvider;
