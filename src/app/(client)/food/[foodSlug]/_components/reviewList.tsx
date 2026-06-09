import { Button } from "@/components/ui/button";
import {
  ReviewDisplayState,
  ReviewState,
  SanityReview,
} from "../../../../../../types/sanityTypes";
import ReviewCard from "./reviewCard";
import { SquarePen } from "lucide-react";
import { DeleteInput, ReviewResult } from "@/hooks/useReviewMutations";

interface ReviewListProps {
  foodId: string;
  userId: string;
  state: ReviewState;
  displayList: ReviewDisplayState[];
  isFormOpen: boolean;
  setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFormType: React.Dispatch<React.SetStateAction<"create" | "edit">>;
  setUpdatedReview: React.Dispatch<React.SetStateAction<SanityReview | null>>;
  onDelete: (input: DeleteInput) => Promise<ReviewResult>;
  isPending: boolean;
}

export function ReviewList({
  userId,
  state,
  isFormOpen,
  setIsFormOpen,
  setFormType,
  setUpdatedReview,
  onDelete,
  displayList,
  isPending,
}: ReviewListProps) {
  return (
    <div className="mb-12">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Customer Reviews
            </h2>
            {Object.values(state.reviews).length > 0 ? (
              <p className="text-muted-foreground">
                Based on {Object.values(state.reviews).length} review
                {Object.values(state.reviews).length !== 1 ? "s" : ""}
              </p>
            ) : (
              <p className="text-muted-foreground">
                Be the first to review this product
              </p>
            )}
          </div>

          <Button
            onClick={() => setIsFormOpen(!isFormOpen)}
            size={"lg"}
            className="h-fit px-4 py-2 rounded-lg"
          >
            <SquarePen className="w-4 h-4" />
            <span className="hidden sm:inline">Write a Review</span>
            <span className="sm:hidden">Review</span>
          </Button>
        </div>
        <div className="space-y-6 max-w-4xl">
          {Object.values(state.reviews).length > 0 && (
            <h3 className="text-xl font-semibold text-foreground">
              All Reviews ({Object.values(state.reviews).length})
            </h3>
          )}
          <div className="space-y-4">
            {Object.values(state.reviews).length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg max-w-2xl mx-auto">
                <p className="text-muted-foreground">
                  No reviews yet. Be the first to share your experience!
                </p>
              </div>
            ) : (
              displayList.map((view) => {
                return (
                  <div key={view.review._id}>
                    <ReviewCard
                      view={view}
                      setFormType={setFormType}
                      setIsFormOpen={setIsFormOpen}
                      userId={userId || ""}
                      setUpdatedReview={setUpdatedReview!}
                      onDelete={onDelete}
                      isPending={isPending}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
