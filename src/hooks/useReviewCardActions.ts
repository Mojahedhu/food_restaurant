import { useCallback } from "react";
import { toast } from "sonner";
import { useReviewMutations } from "./useReviewMutations";
import { useRouter } from "next/navigation";
import { SanityReview } from "../../types/sanityTypes";

/**
 * ============================================================================
 * Custom Hook: useReviewCardActions
 * Enforces Rule 7 (Strict Separation of Concerns) by moving all event
 * handlers and side effects out of the JSX presentation layer.
 * ============================================================================
 */
interface ReviewCardActionsProps {
  review?: SanityReview;
}

export function useReviewCardActions({ review }: ReviewCardActionsProps) {
  const router = useRouter();

  // 1. Self-Sufficient Mutation: The card gets its own delete power!
  const { removeReview, isPending: isDeletePending } = useReviewMutations();

  // -------- handle edit --------
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const handleEdit = useCallback(() => {
    if (!review?._id) return;
    // 2. URL-Driven State: Push edit ID to URL
    router.push(`?editReview=${review._id}`, { scroll: false });
  }, [router, review]);

  // -------- handle delete --------
  const handleDelete = useCallback(async () => {
    const foodId = review?.food?._ref;
    const reviewId = review?._id;
    if (!foodId || !reviewId) return;
    try {
      const res = await removeReview({ reviewId, foodId });
      if (res?.success) toast.success("Review deleted successfully 🎉");
      else toast.error(res?.error || "Failed to delete review. 😞");
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    }
  }, [removeReview, review]);

  return {
    handleEdit,
    handleDelete,
    isDeletePending,
  };
}
