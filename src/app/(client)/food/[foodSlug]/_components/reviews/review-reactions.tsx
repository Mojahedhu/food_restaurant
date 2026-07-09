"use client";

import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useCallback } from "react";
import { useReviewDisplay } from "@/stores/review/useReviewSelectors";
import { useToggleReaction } from "@/stores/review/hooks/useToggleReactions";

interface ReviewReactionsProps {
  reviewId: string;
  userId?: string;
}

const ReviewReactions = ({ reviewId, userId }: ReviewReactionsProps) => {
  // 1. Atomic Subscription to ONLY this review's display state
  const view = useReviewDisplay(reviewId);

  // 2. Self-sufficient toggle logic
  const { toggle, isPending } = useToggleReaction({
    reviewId,
    userId,
  });

  const handleLike = useCallback(() => {
    toggle(view?.isLiked ? null : "like");
  }, [toggle, view?.isLiked]);

  const handleDislike = useCallback(() => {
    toggle(view?.isDisliked ? null : "dislike");
  }, [toggle, view?.isDisliked]);

  if (!view) return null;

  const { isLiked, isDisliked, likesCount, dislikesCount } = view;

  return (
    <div className="flex items-center gap-2 pt-2">
      <Button
        disabled={isPending}
        onClick={handleLike}
        variant={"outline"}
        className={cn(
          "gap-1.5 h-8 px-2.5 border-none cursor-pointer shadow-none group",
          isLiked ? "bg-primary/10 hover:bg-muted" : "hover:bg-primary/10",
        )}
        aria-label="Like review"
      >
        <ThumbsUp
          className={cn(
            "w-4 h-4",
            isLiked
              ? "fill-primary text-primary group-hover:fill-foreground group-hover:text-foreground"
              : "",
          )}
        />
        <span
          className={cn(
            "text-xs font-medium",
            isLiked ? "text-primary group-hover:text-foreground" : "",
          )}
        >
          {likesCount ?? 0}
        </span>
      </Button>
      <Button
        disabled={isPending}
        onClick={handleDislike}
        variant={"outline"}
        className={cn(
          "gap-1.5 h-8 px-2.5 border-none cursor-pointer shadow-none group",
          isDisliked ? "bg-destructive/10" : "hover:bg-destructive/10",
        )}
      >
        <ThumbsDown
          className={cn(
            "w-4 h-4",
            isDisliked
              ? "fill-destructive text-destructive group-hover:fill-foreground group-hover:text-foreground"
              : "",
          )}
        />
        <span
          className={cn(
            "text-xs font-medium",
            isDisliked ? "text-destructive group-hover:text-foreground" : "",
          )}
        >
          {dislikesCount}
        </span>
      </Button>
    </div>
  );
};

export default React.memo(ReviewReactions);
