import auth from "@/../auth";
import {
  getMyReviewReactions,
  getReviewMetrics,
  getReviewsByFoodId,
  mergeReviewFeed,
} from "@/lib/data/review";
import ReviewView from "./review-view";
import { notFound } from "next/navigation";
import { ReviewStoreProvider } from "@/stores/review/ReviewStoreProvider";

interface ReviewSectionProps {
  foodId?: string;
  foodName?: string;
}

const ReviewSection = async ({ foodId, foodName }: ReviewSectionProps) => {
  /**
   * ==========================================
   * Session
   * ==========================================
   */
  const session = await auth();
  const userId = session?.user?.id;

  if (!foodId || !foodName) {
    return notFound();
  }

  /**
   * ==========================================
   * Review projection bootstrap
   * ==========================================
   */

  // 👇 The fetches live here now!
  const [reviews, metrics, reactions] = await Promise.all([
    getReviewsByFoodId(foodId, userId),
    getReviewMetrics(foodId),
    getMyReviewReactions(foodId),
  ]);
  const initialFeed = mergeReviewFeed({ reviews, metrics, reactions });
  return (
    <section className="space-y-8">
      {/* ... header JSX ... */}

      <ReviewStoreProvider value={initialFeed}>
        <ReviewView foodId={foodId} userId={userId} foodName={foodName} />
      </ReviewStoreProvider>
    </section>
  );
};

export default ReviewSection;
