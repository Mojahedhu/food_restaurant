"use client";
import {
  useReviewList,
  useReviewState,
} from "@/stores/review/hooks/useReviewsState";
import { ReviewList } from "./reviewList";
import { useReviewMutations } from "@/hooks/useReviewMutations";
import { useState } from "react";
import { SanityReview } from "../../../../../../types/sanityTypes";
import ReviewForm from "./reviewForm";

interface ReviewSectionProps {
  foodId: string;
  userId: string;
}

const ReviewSection = ({ foodId, userId }: ReviewSectionProps) => {
  const state = useReviewState();
  const { createReview, updateReview, removeReview, isPending } =
    useReviewMutations();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"create" | "edit">("create");
  const [updatedReview, setUpdatedReview] = useState<SanityReview | null>(null);
  const displayList = useReviewList();
  return (
    <>
      <ReviewList
        userId={userId}
        foodId={foodId}
        displayList={displayList}
        state={state}
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        setFormType={setFormType}
        setUpdatedReview={setUpdatedReview}
        onDelete={removeReview}
        isPending={isPending}
      />
      <ReviewForm
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        foodId={foodId}
        foodName={Object.values(state.reviews)[0]?.review.foodName || "Unknown"}
        userId={userId}
        formType={formType}
        setFormType={setFormType}
        updatedReview={updatedReview}
        setUpdatedReview={setUpdatedReview!}
        onCreate={createReview}
        onUpdate={updateReview}
        isPending={isPending}
      />
    </>
  );
};

export default ReviewSection;
