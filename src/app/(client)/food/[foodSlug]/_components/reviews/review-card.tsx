import { Card, CardContent } from "@/components/ui/card";

import { Loader2, SquarePen, Trash2, UserCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getElapsedTime, getUserImage } from "@/lib/utils";
import { StarRating } from "@/components/foods/starRating";
import React, { useState } from "react";
import { useReviewCardActions } from "@/hooks/useReviewCardActions";
import { useReviewStatic } from "@/stores/review/useReviewSelectors";
import ReviewReactions from "./review-reactions";
import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";

// 1. CHANGE: Accept ID instead of view
interface ReviewCardProps {
  id: string;
  userId?: string;
}

/**
 * ============================================================================
 * Component: ReviewCard
 * Enforces Rule 5 (UX), Rule 4 (Optional Chaining), and Rule 7 (Lean JSX)
 * ============================================================================
 */

const ReviewCard = (props: ReviewCardProps) => {
  const { id, userId } = props;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ATOMIC SUBSCRIPTION: Fetch ONLY the static review data.
  // This component will NO LONGER re-render when reactions change!
  const review = useReviewStatic(id);

  // Pass id and view to the actions hook
  // Delegate complex state and handlers to the custom hook
  const {
    handleEdit,
    handleDelete: deleteReview,
    isDeletePending,
  } = useReviewCardActions({
    review,
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteReview();
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
  };

  // Rule 4: Default State Assurances & Loading States
  if (!review) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Rule 4: Safe Extraction & Fallbacks
  const userImage = review.user ? getUserImage(review.user) : null;
  const createdAt = review._createdAt || new Date().toISOString();
  const userName = review.user?.name ?? "Anonymous";
  const isOwner = review.user?._id && review.user._id === userId;

  return (
    <Card>
      <CardContent className="relative p-4 sm:p-6">
        {/* Actions Menu */}
        {isOwner && (
          <div className="absolute -top-4 right-4 flex ">
            <Button
              disabled={isDeletePending}
              onClick={handleEdit}
              variant={"ghost"}
              size={"icon"}
              className="group cursor-pointer"
              aria-label="Edit review"
            >
              <SquarePen className="w-4 h-4 group-hover:text-primary transition-colors" />
            </Button>
            <>
              <Button
                onClick={() => {
                  setIsDeleteDialogOpen(true);
                }}
                variant={"ghost"}
                size={"icon"}
                className={" group cursor-pointer"}
                aria-label="Delete review"
              >
                <Trash2 className="w-4 h-4 group-hover:text-destructive transition-colors" />
              </Button>
              <DeleteConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Delete this review?"
                description="This will permanently delete your review. This action cannot be undone."
              />
            </>
          </div>
        )}
        <div className="flex gap-3 sm:gap-4">
          {/* User Avatar */}
          {typeof userImage === "string" && userImage ? (
            <span className="relative flex overflow-hidden rounded-full w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              <Image
                className="aspect-square h-full w-full"
                alt={userName}
                src={userImage}
                width={45}
                height={45}
                loading="eager"
              />
            </span>
          ) : (
            <span className="relative flex overflow-hidden rounded-full w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-muted justify-center items-center">
              <UserCircle className="w-10 h-10 text-muted-foreground" />
            </span>
          )}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-semibold text-foreground truncate">
                  {userName}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {getElapsedTime(createdAt)}
                </p>
              </div>
              <StarRating
                rating={review.rating ?? 0}
                showValue={false}
                size="sm"
              />
            </div>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed wrap-break-word">
              {review.comment}
            </p>

            {/* Admin Reply */}
            {review.adminReply && (
              <div className="mt-3 bg-muted/40 p-3 rounded-lg border border-primary/10 pl-4 border-l-4 border-l-primary/60">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-semibold text-[10px] text-primary uppercase tracking-wider">
                    Restaurant Response
                  </span>
                </div>
                <p className="text-foreground text-sm leading-relaxed italic">
                  &quot;{review.adminReply}&quot;
                </p>
              </div>
            )}

            {/* Reactions */}
            {/* 🔥 ISOLATED REACTIONS COMPONENT 🔥 */}
            <ReviewReactions reviewId={id} userId={userId} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ReviewCard);
