"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Star } from "lucide-react";

import { useReviewForm } from "@/hooks/useReviewForm";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface ReviewFormProps {
  foodId?: string;
  foodName?: string;
  userId?: string;
}

const ReviewForm = (props: ReviewFormProps) => {
  const [hoverIndex, setHoverIndex] = useState<number>(0);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL-Driven State extraction
  const isWriting = searchParams.get("writeReview") === "true";
  const editReviewId = searchParams.get("editReview");
  const isFormOpen = isWriting || !!editReviewId;
  const formType = editReviewId ? "edit" : "create";

  const {
    form,
    setRating,
    setComment,
    isPending,
    isAuthenticated,
    handleSubmit,
  } = useReviewForm({
    ...props,
    formType,
    editReviewId,
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Close modal by removing query params entirely
      const params = new URLSearchParams(searchParams.toString());
      params.delete("writeReview");
      params.delete("editReview");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <Sheet open={isFormOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="p-6 w-full sm:max-w-md md:max-w-2xl lg:max-w-4xl overflow-y-auto">
        <SheetHeader className="space-y-2 text-center sm:text-left gap-0 p-0">
          <SheetTitle className="text-lg font-semibold text-foreground">
            Write a Review
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Share your experience with {props.foodName || "this food"}.
          </SheetDescription>
        </SheetHeader>

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-3">
              <label className="font-medium text-base">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                    onMouseEnter={() => setHoverIndex(star)}
                    onMouseLeave={() => setHoverIndex(0)}
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        (hoverIndex || form.rating) >= star
                          ? "text-(--yellow) fill-(--yellow)"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="font-medium text-base">Your Comment</label>
              <textarea
                value={form.comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share detail of your experience..."
                className="w-full h-32 p-3 border rounded-lg bg-background"
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
          </form>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Please log in to submit a review.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ReviewForm;
