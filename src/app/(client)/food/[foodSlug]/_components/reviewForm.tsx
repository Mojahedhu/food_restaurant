"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, SquarePen, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState, useTransition } from "react";
import { ReviewFormSkeleton } from "./skeleton";

import { toast } from "sonner";
import { SanityReview } from "../../../../../../types/sanityTypes";
import { upsertReview } from "../actions/review";
import {
  CreateInput,
  ReviewResult,
  UpdateInput,
} from "@/hooks/useReviewMutations";

interface ReviewFormProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  foodId?: string;
  foodName?: string;
  userId?: string;
  formType: "create" | "edit";
  setFormType: (type: "create" | "edit") => void;
  updatedReview: SanityReview | null;
  setUpdatedReview: (review: SanityReview | null) => void;
  onCreate: (input: CreateInput) => Promise<ReviewResult>;

  onUpdate: (input: UpdateInput) => Promise<ReviewResult>;

  isPending: boolean;
}

const ReviewForm = ({
  isFormOpen,
  setIsFormOpen,
  foodName,
  foodId,
  formType,
  setFormType,
  updatedReview,
  setUpdatedReview,
}: ReviewFormProps) => {
  const session = useSession();

  const authLoading = session.status === "loading";
  const isAuthenticated = session.status === "authenticated";

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    rating: 0,
    comment: "",
  });

  const [hoverIndex, setHoverIndex] = useState<number>(0);
  const isDirty = form.comment.length > 0;
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (formType === "edit" && updatedReview) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        rating: updatedReview.rating || 0,
        comment: updatedReview.comment || "",
      });
    }
  }, [updatedReview, formType]);

  useEffect(() => {
    if (authLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [authLoading]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!session.data?.user?.id || !foodId) return;
    startTransition(async () => {
      if (formType === "create") {
        const res = await upsertReview({
          foodId,
          rating: form.rating,
          comment: form.comment,
          type: formType,
          transactionId: crypto.randomUUID(),
        });

        if (res.success) {
          toast.success(
            "Review added successfully ! You can check it below 🎉",
          );
          setIsFormOpen(false);
          setForm({
            rating: 0,
            comment: "",
          });
        } else if (res.message === "Review already exists") {
          toast.error(
            "Sorry ! you have already reviewed this food ! Feel free to edit your review",
          );
        } else {
          toast.error(
            "Sorry ! Error occur while adding review , Please try again later !",
          );
        }
      } else if (formType === "edit") {
        const res = await upsertReview({
          foodId,
          comment: form.comment,
          rating: form.rating,
          type: formType,
          transactionId: crypto.randomUUID(),
        });
        if (res.success) {
          toast.success(
            "Review updated successfully ! You can check it below 🎉",
          );
          setIsFormOpen(false);
          setForm({
            rating: 0,
            comment: "",
          });
          setUpdatedReview(null);
          setFormType("create");
        } else {
          toast.error(
            "Sorry ! Error occur while updating review , Please try again later !",
          );
        }
      }
    });
  };

  return (
    <Sheet
      open={isFormOpen}
      onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) {
          setForm({
            rating: 0,
            comment: "",
          });
        }
        setFormType("create");
        setUpdatedReview(null);
      }}
    >
      <SheetContent className="p-6 w-full sm:max-w-md! md:max-w-2xl! lg:max-w-4xl! overflow-y-auto">
        <SheetHeader className="space-y-2 text-center sm:text-left gap-0 p-0">
          <SheetTitle className="text-lg font-semibold text-foreground">
            Write a Review
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Share your experience with {foodName || "this food"}. Your review
            will help others make informed decisions.
          </SheetDescription>
        </SheetHeader>
        {loading ? (
          <ReviewFormSkeleton />
        ) : (
          <>
            {isAuthenticated ? (
              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <div className="space-y-3">
                  <label
                    htmlFor="rating"
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-base"
                  >
                    Your Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm({ ...form, rating: star })}
                        className={`transition-transform hover:scale-110 focus:outline-none`}
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
                  <p className="text-sm text-muted-foreground">
                    {form.rating} out of 5 stars
                  </p>
                </div>
                <div className="space-y-3">
                  <label
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-base"
                    htmlFor="comment"
                  >
                    Your Review
                  </label>
                  <textarea
                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
                    id="comment"
                    placeholder="Share your experience with this food item..."
                    rows={6}
                    maxLength={500}
                    value={form.comment}
                    onChange={(e) =>
                      setForm({ ...form, comment: e.target.value })
                    }
                  ></textarea>
                  <p className="text-xs text-muted-foreground text-right">
                    {form.comment.length}/500 characters
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    disabled={!isDirty || isPending}
                    type="submit"
                    className="w-full h-10 px-6! border-none"
                  >
                    {isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : formType === "create" ? (
                      "Submit Review"
                    ) : (
                      "Update Review"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Your review will be visible after approval by our moderation
                  team.
                </p>
              </form>
            ) : (
              <>
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <SquarePen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Sign in to write a review
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You need to be signed in to share your experience
                    </p>
                  </div>
                  <a href="/auth/signin">
                    <Button size={"lg"} className="px-6 py-2 mt-4">
                      Sign In
                    </Button>
                  </a>
                </div>
              </>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ReviewForm;
