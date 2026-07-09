## 3. Feature Plan 2: Food Detail & Reviews (`/food/[slug]`)

### A. Architectural Separation

Currently, review submission, update, deletion, and user reactions exist inside component-level subdirectories (`src/app/(client)/food/[foodSlug]/actions/`). Furthermore, `reviewForm.tsx` directly imports and calls `upsertReview` instead of utilizing the `useReviewMutations` hook, which bypasses optimistic store dispatchers and slows down the user experience.

To strictly enforce **Strict Separation of Concerns & Modular Architecture (Rule 7)**:

1.  **Centralized Server Action (`src/actions/client-reviews.ts`):** Combine all review updates, deletes, and reactions into a single global action file under `src/actions/` with strict Zod validations.
2.  **Pure Helper Extraction (`src/lib/utils/review-helpers.ts`):** Move pure mathematical helper calculations (`computeFoodMetrics`) out of the Server Action, making them testable and keeping mutations lean.
3.  **Form State Hook (`src/hooks/useReviewForm.ts`):** Extract all form input mutations, star rating hover indices, dirty flags, and submission transitions out of presentational JSX code.
4.  **Dumb Components Pattern (`reviewForm.tsx`):** Convert the reviews sheet to a presentation-only component, relying entirely on the new custom hook to resolve logic and dispatch optimistic callbacks.

### B. File Structure Adjustments

```
Before:
  src/app/(client)/food/[foodSlug]/
    └── actions/
        ├── review.ts               <-- [DELETE] Route-level review action
        └── reactions.ts            <-- [DELETE] Route-level reactions action

After:
  src/actions/
    └── client-reviews.ts           <-- [NEW] Unified server action (validations + transactions)
  src/lib/utils/
    └── review-helpers.ts           <-- [NEW] Pure mathematical calculation helpers
  src/hooks/
    ├── useReviewMutations.ts       <-- [MODIFY] Point imports to new central action
    └── useReviewForm.ts            <-- [NEW] Form logic state container (Rule 7 separation)
  src/stores/review/hooks/
    └── useToggleReactions.ts       <-- [MODIFY] Point imports to new central action
  src/app/(client)/food/[foodSlug]/_components/
    └── reviewForm.tsx              <-- [MODIFY] Presentational view consuming useReviewForm hook
```

---

### C. Code Blueprints

#### 1. Pure Helpers: `src/lib/utils/review-helpers.ts`

We extract all pure, deterministic calculation logic:

```typescript
/**
 * Computes food rating average and Bayesian weighted score.
 * Pure function: side-effect free and 100% unit-testable.
 */
export function computeFoodMetrics(ratingSum: number, ratingCount: number) {
  const ratingAverage = ratingCount === 0 ? 0 : ratingSum / ratingCount;
  const minimumReviews = 10;
  const globalAverage = 4.2;
  const weightedRating =
    (ratingCount / (ratingCount + minimumReviews)) * ratingAverage +
    (minimumReviews / (ratingCount + minimumReviews)) * globalAverage;

  return { ratingAverage, weightedRating };
}

export function getReviewId(foodId: string, userId: string) {
  return `review_${foodId}_${userId}`;
}
```

#### 2. Centralized Server Action: `src/actions/client-reviews.ts`

We consolidate write operations, validate payloads, and call the pure helpers:

```typescript
"use server";

import { client } from "@/sanity/lib/client";
import auth from "../../auth";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { ReactionType } from "../../sanity.types";
import { computeFoodMetrics, getReviewId } from "@/lib/utils/review-helpers";

// Validation Schemas
const ReviewInputSchema = z.object({
  foodId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(10, "Comment must be at least 10 characters")
    .max(1000),
  type: z.enum(["create", "edit"]),
  transactionId: z.string().uuid().optional(),
});

const ToggleReactionSchema = z.object({
  reviewId: z.string().min(1),
  foodId: z.string().min(1),
  reaction: z.enum(["like", "dislike"]).nullable(),
  mutationId: z.string().uuid().optional(),
});

export async function upsertReviewAction(payload: unknown) {
  try {
    const parsed = ReviewInputSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid input data",
      };
    }

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized: Please sign in to submit a review",
      };
    }

    const {
      foodId,
      rating,
      comment,
      type,
      transactionId = crypto.randomUUID(),
    } = parsed.data;
    const reviewId = getReviewId(foodId, userId);

    // Fetch existing review
    const existing = await client.fetch<{ _id: string; rating: number }>(
      `*[_type == "review" && _id == $reviewId][0] { _id, rating }`,
      { reviewId },
    );

    if (type === "edit" && !existing)
      return { success: false, error: "Review not found" };
    if (type === "create" && existing)
      return { success: false, error: "You have already reviewed this dish" };

    const food = await client.fetch<{
      ratingSum: number;
      ratingCount: number;
      slug: string;
    }>(
      `*[_id == $foodId][0] { ratingSum, ratingCount, "slug": slug.current }`,
      { foodId },
    );
    if (!food) return { success: false, error: "Food item not found" };

    const previousRating = existing?.rating ?? 0;
    const tx = client.transaction();

    // Upsert Review
    const reviewData = {
      _id: reviewId,
      _type: "review",
      food: { _type: "reference", _ref: foodId },
      user: { _type: "reference", _ref: userId },
      rating,
      comment,
      approved: true, // Auto-approve reviews
    };

    if (!existing) {
      tx.create(reviewData);
    } else {
      tx.patch(reviewId, { set: { rating, comment } });
    }

    // Apply Deltas to Parent Product document using pure helpers
    const currentRatingSum = food.ratingSum ?? 0;
    const currentRatingCount = food.ratingCount ?? 0;

    if (type === "create") {
      const { ratingAverage, weightedRating } = computeFoodMetrics(
        currentRatingSum + rating,
        currentRatingCount + 1,
      );
      tx.patch(foodId, {
        setIfMissing: { ratingSum: 0, ratingCount: 0 },
        inc: { ratingSum: rating, ratingCount: 1 },
        set: { ratingAverage, weightedRating },
      });
    } else {
      const ratingDelta = rating - previousRating;
      const { ratingAverage, weightedRating } = computeFoodMetrics(
        currentRatingSum + ratingDelta,
        currentRatingCount,
      );
      tx.patch(foodId, {
        setIfMissing: { ratingSum: 0, ratingCount: 0 },
        inc: { ratingSum: ratingDelta },
        set: { ratingAverage, weightedRating },
      });
    }

    await tx.commit({ transactionId });
    revalidateTag(`reviews:${foodId}`);
    revalidateTag(`food:${food.slug}`);

    return { success: true, transactionId };
  } catch (error) {
    console.error("Failed to upsert review:", error);
    return { success: false, error: "Database transaction failed" };
  }
}

export async function deleteReviewAction(payload: unknown) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized" };

    const parsed = z.object({ foodId: z.string().min(1) }).safeParse(payload);
    if (!parsed.success) return { success: false, error: "Invalid parameters" };

    const { foodId } = parsed.data;
    const reviewId = getReviewId(foodId, userId);

    const [existing, food, reactionIds] = await Promise.all([
      client.fetch<{ rating: number }>(`*[_id == $reviewId][0] { rating }`, {
        reviewId,
      }),
      client.fetch<{ ratingSum: number; ratingCount: number; slug: string }>(
        `*[_id == $foodId][0] { ratingSum, ratingCount, "slug": slug.current }`,
        { foodId },
      ),
      client.fetch<string[]>(
        `*[_type == "reviewReaction" && review._ref == $reviewId]._id`,
        { reviewId },
      ),
    ]);

    if (!existing || !food)
      return { success: false, error: "Record not found" };

    const safeRatingSum = Math.max(0, (food.ratingSum ?? 0) - existing.rating);
    const safeRatingCount = Math.max(0, (food.ratingCount ?? 0) - 1);
    const { ratingAverage, weightedRating } = computeFoodMetrics(
      safeRatingSum,
      safeRatingCount,
    );

    const tx = client.transaction();
    reactionIds.forEach((id) => tx.delete(id));
    tx.delete(`metrics_${reviewId}`);
    tx.delete(reviewId);
    tx.patch(foodId, {
      set: {
        ratingSum: safeRatingSum,
        ratingCount: safeRatingCount,
        ratingAverage,
        weightedRating,
      },
    });

    await tx.commit();
    revalidateTag(`reviews:${foodId}`);
    revalidateTag(`food:${food.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete review:", error);
    return { success: false, error: "Deletion failed" };
  }
}

export async function toggleReactionAction(payload: unknown) {
  try {
    const parsed = ToggleReactionSchema.safeParse(payload);
    if (!parsed.success)
      return { success: false, error: "Invalid reaction inputs" };

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized" };

    const {
      reviewId,
      foodId,
      reaction,
      mutationId = crypto.randomUUID(),
    } = parsed.data;
    const reactionId = `reaction_${reviewId}_${userId}`;
    const metricsId = `metrics_${reviewId}`;

    const existing = await client.fetch<{ type: ReactionType }>(
      `*[_id == $reactionId][0] { type }`,
      { reactionId },
    );

    const tx = client.transaction();

    if (!reaction) {
      if (existing) {
        tx.delete(reactionId);
        const decField =
          existing.type === "like" ? "likesCount" : "dislikesCount";
        tx.patch(metricsId, { dec: { [decField]: 1 } });
      }
    } else {
      const isNew = !existing;
      if (isNew) {
        tx.create({
          _id: reactionId,
          _type: "reviewReaction",
          review: { _type: "reference", _ref: reviewId },
          food: { _type: "reference", _ref: foodId },
          user: { _type: "reference", _ref: userId },
          type: reaction,
        });
        const incField = reaction === "like" ? "likesCount" : "dislikesCount";
        tx.patch(metricsId, {
          setIfMissing: { likesCount: 0, dislikesCount: 0 },
          inc: { [incField]: 1 },
        });
      } else if (existing.type !== reaction) {
        tx.patch(reactionId, { set: { type: reaction } });
        const incField = reaction === "like" ? "likesCount" : "dislikesCount";
        const decField = reaction === "like" ? "dislikesCount" : "likesCount";
        tx.patch(metricsId, {
          setIfMissing: { likesCount: 0, dislikesCount: 0 },
          inc: { [incField]: 1 },
          dec: { [decField]: 1 },
        });
      }
    }

    await tx.commit({ transactionId: mutationId });
    revalidateTag(`reviews:${foodId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle reaction:", error);
    return { success: false, error: "Reaction transaction failed" };
  }
}
```

#### 3. Form Logic Hook: `src/hooks/useReviewForm.ts`

All validation logic, button submission states, hover controls, and form resets are delegated to this custom hook (Rule 7):

```typescript
"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { SanityReview } from "@/types/sanityTypes";
import { CreateInput, UpdateInput, ReviewResult } from "./useReviewMutations";

interface UseReviewFormOptions {
  foodId?: string;
  foodName?: string;
  formType: "create" | "edit";
  updatedReview: SanityReview | null;
  setIsFormOpen: (open: boolean) => void;
  setUpdatedReview: (review: SanityReview | null) => void;
  setFormType: (type: "create" | "edit") => void;
  onCreate: (input: CreateInput) => Promise<ReviewResult>;
  onUpdate: (input: UpdateInput) => Promise<ReviewResult>;
}

export function useReviewForm({
  foodId,
  foodName,
  formType,
  updatedReview,
  setIsFormOpen,
  setUpdatedReview,
  setFormType,
  onCreate,
  onUpdate,
}: UseReviewFormOptions) {
  const session = useSession();
  const [form, setForm] = useState({ rating: 0, comment: "" });
  const [hoverIndex, setHoverIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const isDirty = form.comment.trim().length > 0;
  const isAuthenticated = session.status === "authenticated";
  const userId = session.data?.user?.id;

  // Populate edits
  useEffect(() => {
    if (formType === "edit" && updatedReview) {
      setForm({
        rating: updatedReview.rating || 0,
        comment: updatedReview.comment || "",
      });
    }
  }, [updatedReview, formType]);

  const setRating = useCallback((rating: number) => {
    setForm((prev) => ({ ...prev, rating }));
  }, []);

  const setComment = useCallback((comment: string) => {
    setForm((prev) => ({ ...prev, comment }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!userId || !foodId) return;

      if (form.rating < 1 || form.rating > 5) {
        toast.error("Please select a rating between 1 and 5 stars");
        return;
      }
      if (form.comment.trim().length < 10) {
        toast.error("Comments must be at least 10 characters long");
        return;
      }

      startTransition(async () => {
        if (formType === "create") {
          const res = await onCreate({
            foodId,
            rating: form.rating,
            comment: form.comment,
            optimisticReview: {
              review: {
                _id: `review_${foodId}_${userId}`,
                _createdAt: new Date().toISOString(),
                rating: form.rating,
                comment: form.comment,
                approved: true,
                foodName: foodName || "",
                user: {
                  _id: userId,
                  name: session.data?.user?.name || "You",
                  image: session.data?.user?.image || null,
                },
              },
              likesCount: 0,
              dislikesCount: 0,
              activeReaction: null,
              isLiked: false,
              isDisliked: false,
              pending: true,
              pendingMutations: [],
              confirmedReaction: null,
              metrics: { likesCount: 0, dislikesCount: 0 },
            },
          });

          if (res.success) {
            toast.success("Review added successfully! 🎉");
            setIsFormOpen(false);
            setForm({ rating: 0, comment: "" });
          } else {
            toast.error(res.error || "Failed to submit review");
          }
        } else if (formType === "edit") {
          const res = await onUpdate({
            reviewId: updatedReview?._id || "",
            foodId,
            rating: form.rating,
            comment: form.comment,
          });

          if (res.success) {
            toast.success("Review updated successfully! 🎉");
            setIsFormOpen(false);
            setForm({ rating: 0, comment: "" });
            setUpdatedReview(null);
            setFormType("create");
          } else {
            toast.error(res.error || "Failed to update review");
          }
        }
      });
    },
    [
      userId,
      foodId,
      form,
      formType,
      foodName,
      session,
      updatedReview,
      onCreate,
      onUpdate,
      setIsFormOpen,
      setUpdatedReview,
      setFormType,
    ],
  );

  return {
    form,
    hoverIndex,
    setHoverIndex,
    setRating,
    setComment,
    isDirty,
    isPending,
    isAuthenticated,
    handleSubmit,
  };
}
```

#### 4. Presentational View Component: `src/app/(client)/food/[foodSlug]/_components/reviewForm.tsx`

With logic extracted, `reviewForm.tsx` becomes fully presentational, making the code simple, atomic, and easy to maintain:

```typescript
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
import { SanityReview } from "@/types/sanityTypes";
import { CreateInput, UpdateInput, ReviewResult } from "@/hooks/useReviewMutations";

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
}

const ReviewForm = (props: ReviewFormProps) => {
  const {
    form,
    hoverIndex,
    setHoverIndex,
    setRating,
    setComment,
    isPending,
    isAuthenticated,
    handleSubmit,
  } = useReviewForm(props);

  return (
    <Sheet
      open={props.isFormOpen}
      onOpenChange={(open) => {
        props.setIsFormOpen(open);
        if (!open) {
          props.setUpdatedReview(null);
          props.setFormType("create");
        }
      }}
    >
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
            <p className="text-muted-foreground mb-4">Please log in to submit a review.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ReviewForm;
```

---

## 4. Testing & Verification Criteria

1.  **Direct Action Removal:** Verify no server action files exist under `src/app/(client)/food/[foodSlug]/actions/` and that webpack compiles with zero missing reference imports.
2.  **Optimistic UI insertion:** Submit a review and verify it shows up **immediately** in the reviews list (with a subtle pending state indicator) before the server action response is completed.
3.  **Invalid Review Lockout:** Verify that a rating of `0` or comments shorter than 10 characters are rejected instantly by Zod validation, with a user-facing toast showing the restriction error.
4.  **Reaction Toggling:** Click "Like" and "Dislike" on reviews to verify counters change immediately (optimistically) and write changes to Sanity transaction states.
