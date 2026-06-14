import { Card, CardContent } from "@/components/ui/card";

import {
  SquarePen,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  UserCircle,
} from "lucide-react";
import Image from "next/image";
import {
  ReviewDisplayState,
  SanityReview,
} from "../../../../../../types/sanityTypes";
import { Button } from "@/components/ui/button";
import { cn, getElapsedTime, getUserImage } from "@/lib/utils";
import { StarRating } from "@/components/foods/starRating";
import { useToggleReaction } from "@/stores/review/hooks/useToggleReactions";
import { usePathname, useRouter } from "next/navigation";
import { DeleteInput, ReviewResult } from "@/hooks/useReviewMutations";
import { toast } from "sonner";

interface ReviewCardProps {
  view: ReviewDisplayState;

  setUpdatedReview: (review: SanityReview) => void;
  setIsFormOpen: (open: boolean) => void;
  setFormType: (type: "edit" | "create") => void;
  userId: string;
  onDelete: (input: DeleteInput) => Promise<ReviewResult>;
  isPending: boolean;
}

const ReviewCard = ({
  view,
  setUpdatedReview,
  setIsFormOpen,
  setFormType,
  onDelete,
  userId,
  isPending,
}: ReviewCardProps) => {
  const { toggle } = useToggleReaction({
    reviewId: view.review._id,
  });
  const router = useRouter();
  const pathname = usePathname();
  if (!view) return null;
  const { isDisliked, isLiked } = view;

  return (
    <Card>
      <CardContent className="relative p-4 sm:p-6">
        {view.review.user?._id === userId && (
          <div className="absolute -top-4 right-4 flex ">
            <Button
              disabled={isPending}
              onClick={() => {
                setIsFormOpen(true);
                setFormType("edit");
                setUpdatedReview(view.review);
              }}
              variant={"ghost"}
              size={"icon"}
              className="group cursor-pointer"
            >
              <SquarePen className="w-4 h-4 group-hover:text-primary transition-colors" />
            </Button>
            <Button
              disabled={isPending}
              onClick={async () => {
                const res = await onDelete({
                  reviewId: view.review._id,
                  foodId: view.review.food._ref,
                });
                if (res.success) {
                  toast.success("Review deleted successfully 🎉");
                } else {
                  toast.error("Failed to delete review, please try again. 😞 ");
                }
              }}
              variant={"ghost"}
              size={"icon"}
              className=" group cursor-pointer"
            >
              <Trash2 className="w-4 h-4 group-hover:text-primary transition-colors" />
            </Button>
          </div>
        )}
        <div className="flex gap-3 sm:gap-4">
          {view.review.user &&
          typeof getUserImage(view.review.user) === "string" ? (
            <span className="relative flex overflow-hidden rounded-full w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              <Image
                className="aspect-square h-full w-full"
                alt={view.review.user.name}
                src={getUserImage(view.review.user)!}
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
                  {view.review.user?.name ?? "Anonymous"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {getElapsedTime(view.review._createdAt!)}
                </p>
              </div>
              <StarRating
                rating={view.review.rating || 0}
                showValue={false}
                size="sm"
              />
            </div>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed wrap-break-word">
              {view.review.comment}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={() => {
                  const params = new URLSearchParams({
                    callbackUrl: pathname,
                  });
                  if (!userId) {
                    router.push(`/auth/signin?${params.toString()}`, {
                      scroll: false,
                    });
                    return;
                  }
                  toggle(isLiked ? null : "like");
                }}
                variant={"outline"}
                className={cn(
                  "gap-1.5 h-8 px-2.5 border-none cursor-pointer shadow-none group",
                  isLiked
                    ? "bg-primary/10 hover:bg-muted"
                    : "hover:bg-primary/10",
                )}
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
                  {view.likesCount}
                </span>
              </Button>
              <Button
                onClick={() => {
                  const params = new URLSearchParams({
                    callbackUrl: pathname,
                  });
                  if (!userId) {
                    router.push(
                      `/auth/signup?callbackUrl=/${params.toString()}`,
                      { scroll: false },
                    );
                    return;
                  }
                  toggle(isDisliked ? null : "dislike");
                }}
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
                    isDisliked
                      ? "text-destructive group-hover:text-foreground"
                      : "",
                  )}
                >
                  {view.dislikesCount}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
