# Enterprise Refactoring Blueprint: `food/[foodSlug]`

This artifact contains the **complete, full source code** for every file required to refactor the dynamic food detail section into a bulletproof, enterprise-ready feature using Next.js App Router streaming architectures, Zod validation, and Strict Separation of Concerns.

---

## 1. Core Data & Layer Separation

### `src/lib/utils/review-helpers.ts`

Pure mathematical utility functions strictly running on the server.

```typescript
import "server-only";

/**
 * Computes food rating average and Bayesian weighted score.
 * Pure function: side-effect free and 100% unit-testable.
 */
export function computeFoodMetrics(ratingSum: number, ratingCount: number) {
  const ratingAverage = ratingCount === 0 ? 0 : ratingSum / ratingCount;

  // Bayesian average constants to prevent 1-star/5-star extreme skew on low volumes
  const minimumReviews = 10;
  const globalAverage = 4.2;

  const weightedRating =
    (ratingCount / (ratingCount + minimumReviews)) * ratingAverage +
    (minimumReviews / (ratingCount + minimumReviews)) * globalAverage;

  return {
    ratingAverage: Number(ratingAverage.toFixed(1)),
    weightedRating: Number(weightedRating.toFixed(2)),
  };
}

/**
 * Deterministic review ID generation to enforce 1 review per user per food.
 */
export function getReviewId(foodId: string, userId: string) {
  return `review_${foodId}_${userId}`;
}
```

### `src/actions/client-reviews.ts`

Centralized Server Actions with strict Zod validation and Zero-Trust architecture.

```typescript
"use server";

import { client } from "@/sanity/lib/client";
import auth from "@/auth";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { ReactionType } from "../../types/sanityTypes";
import { computeFoodMetrics, getReviewId } from "@/lib/utils/review-helpers";

// Strict Input Validations
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

    const reviewData = {
      _id: reviewId,
      _type: "review",
      food: { _type: "reference", _ref: foodId },
      user: { _type: "reference", _ref: userId },
      rating,
      comment,
      approved: true, // Auto-approve
    };

    if (!existing) {
      tx.create(reviewData);
    } else {
      tx.patch(reviewId, { set: { rating, comment } });
    }

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
```

### `src/hooks/useReviewForm.ts`

Custom hook exclusively managing form state and optimistic mutations.

```typescript
"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { SanityReview } from "../../types/sanityTypes";
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
        const reviewId = `review_${foodId}_${userId}`;

        if (formType === "create") {
          const res = await onCreate({
            foodId,
            rating: form.rating,
            comment: form.comment,
            optimisticReview: {
              review: {
                _id: reviewId,
                _type: "review" as const,
                _rev: "optimistic-rev",
                _updatedAt: new Date().toISOString(),
                _createdAt: new Date().toISOString(),
                rating: form.rating,
                comment: form.comment,
                approved: true,
                foodName: foodName || "",
                food: {
                  _type: "reference" as const,
                  _ref: foodId,
                },
                user: {
                  _id: userId,
                  name: session.data?.user?.name || "You",
                  image: session.data?.user?.image
                    ? { source: "url" as const, url: session.data.user.image }
                    : undefined,
                },
              },
              pendingMutations: [],
              confirmedReaction: null,
              metrics: {
                reviewId,
                likesCount: 0,
                dislikesCount: 0,
              },
            },
          });

          if (res.success) {
            toast.success("Review added successfully!");
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
            toast.success("Review updated successfully!");
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

---

## 2. Layout Orchestration & Boundaries

### `src/app/(client)/food/[foodSlug]/page.tsx`

Orchestrator mapping discrete streaming boundaries (`Suspense`).

```typescript
import { Suspense } from "react";
import { getFoodBySlug } from "@/lib/data/food";
import { Metadata } from "next";
import { urlFor } from "@/sanity/lib/image";
import { SanityImageSource } from "@sanity/image-url";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";

import FoodDetails from "./_components/layout/food-details";
import RelatedFoods from "./_components/related/related-foods";
import ReviewSection from "./_components/reviews/review-section";
import {
  FoodDetailsSkeleton,
  RelatedFoodSkeleton,
  FoodReviewSkeleton,
} from "./_components/skeletons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ foodSlug: string }>;
}): Promise<Metadata> {
  const { foodSlug } = await params;
  const food = await getFoodBySlug(foodSlug);

  if (!food) return { title: "Item Not Found" };

  return {
    title: food.name,
    description: food.description,
    openGraph: {
      title: food.name,
      description: food.description,
      images: [
        {
          url: urlFor(food.images?.[0]?.asset as SanityImageSource)?.url() || "",
          width: 800,
          height: 600,
        },
      ],
    },
  };
}

export default async function FoodPage({
  params,
}: {
  params: Promise<{ foodSlug: string }>;
}) {
  const { foodSlug } = await params;
  const foodDetails = await getFoodBySlug(foodSlug);

  if (!foodDetails) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <Breadcrumb
          items={[
            { label: "Menu", href: `/menu` },
            {
              label: foodDetails.category?.name as string,
              href: `/category/${foodDetails.category?.slug}`,
            },
            { label: foodDetails.name },
          ]}
        />

        <div className="mt-8 space-y-16">
          <Suspense fallback={<FoodDetailsSkeleton />}>
            <FoodDetails slug={foodSlug} initialFood={foodDetails} />
          </Suspense>

          <Separator className="my-10" />

          <Suspense fallback={<FoodReviewSkeleton />}>
            <ReviewSection foodId={foodDetails._id} foodName={foodDetails.name} />
          </Suspense>

          <Suspense fallback={<RelatedFoodSkeleton />}>
            <RelatedFoods categoryId={foodDetails.category?._id} excludeId={foodDetails._id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

### `src/app/(client)/food/[foodSlug]/loading.tsx`

Native Next.js Route Transition Fallback.

```typescript
import { FoodDetailsSkeleton } from "./_components/skeletons";

export default function Loading() {
  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <div className="w-1/3 h-6 mb-8 bg-muted rounded-md animate-pulse"></div>
      <FoodDetailsSkeleton />
    </div>
  );
}
```

### `src/app/(client)/food/[foodSlug]/error.tsx`

Client Error Boundary for graceful degradation.

```typescript
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Food Detail Error Boundary Triggered:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Unable to load this item
        </h2>
        <p className="text-muted-foreground max-w-[500px]">
          We encountered an unexpected issue while fetching the details for this food item.
        </p>
      </div>
      <Button onClick={() => reset()} variant="default">
        Try Again
      </Button>
    </div>
  );
}
```

### `src/app/(client)/food/[foodSlug]/not-found.tsx`

Triggered instantly when `getFoodBySlug` returns `null`.

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="p-6 rounded-full bg-muted/50 mb-6">
        <UtensilsCrossed className="w-12 h-12 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
        Food Item Not Found
      </h1>
      <p className="text-muted-foreground mb-8 max-w-[400px]">
        The item you're looking for doesn't exist or might have been removed from our menu.
      </p>
      <Button asChild>
        <Link href="/menu">Browse Menu</Link>
      </Button>
    </div>
  );
}
```

---

## 3. Sandboxed Front-End Interface Components

### `src/app/(client)/food/[foodSlug]/_components/layout/food-details.tsx`

```typescript
import { FoodWithDetails } from "../../../../../../types/sanityTypes";
import FoodGallery from "./food-gallery";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Star, Clock, Flame } from "lucide-react";

interface FoodDetailsProps {
  slug: string;
  initialFood: FoodWithDetails;
}

export default function FoodDetails({ initialFood }: FoodDetailsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
      <FoodGallery images={initialFood.images || []} foodName={initialFood.name} />

      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
            {initialFood.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-medium text-foreground">
                {initialFood.averageRating?.toFixed(1) || "New"}
              </span>
              <span>({initialFood.totalReviews || 0} reviews)</span>
            </div>
            {initialFood.preparationTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{initialFood.preparationTime} min</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-lg text-muted-foreground leading-relaxed">
          {initialFood.description}
        </p>

        <div className="text-3xl font-bold text-primary">
          {formatCurrency(initialFood.basePrice)}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {initialFood.spiceLevel && (
            <Badge variant="secondary" className="gap-1">
              <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
              {initialFood.spiceLevel} Spice
            </Badge>
          )}
          {initialFood.category?.name && (
            <Badge variant="outline">{initialFood.category.name}</Badge>
          )}
        </div>

        {/* Future Hook Entry Point for Cart Variations */}
        <div className="pt-6 mt-6 border-t">
          {/* Feature Plan 3 (Cart) injection zone */}
          <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground text-center">
            Cart interactions will stream here in Plan 3.
          </div>
        </div>
      </div>
    </div>
  );
}
```

### `src/app/(client)/food/[foodSlug]/_components/layout/food-gallery.tsx`

```typescript
"use client";

import { useState } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { SanityImageSource } from "@sanity/image-url";
import { cn } from "@/lib/utils";

interface FoodGalleryProps {
  images: SanityImageSource[];
  foodName: string;
}

export default function FoodGallery({ images, foodName }: FoodGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-muted flex items-center justify-center">
        <span className="text-muted-foreground">No image available</span>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border bg-muted">
        <Image
          src={urlFor(currentImage).url()}
          alt={`${foodName} - View ${currentIndex + 1}`}
          fill
          priority
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border-2 transition-all",
                currentIndex === idx
                  ? "border-primary ring-2 ring-primary/20 ring-offset-2"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={urlFor(img).width(200).height(200).url()}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### `src/app/(client)/food/[foodSlug]/_components/reviews/review-section.tsx`

```typescript
import { getReviewsByFoodId, getReviewMetrics, getMyReviewReactions, mergeReviewFeed } from "@/lib/data/review";
import auth from "@/auth";
import ReviewClientProvider from "./review-client-provider";
import ReviewList from "./review-list";
import { Button } from "@/components/ui/button";

interface ReviewSectionProps {
  foodId: string;
  foodName: string;
}

export default async function ReviewSection({ foodId, foodName }: ReviewSectionProps) {
  const session = await auth();
  const userId = session?.user?.id;

  // Execute independent Server Component fetches strictly for reviews
  const reviews = await getReviewsByFoodId(foodId, userId);
  const metrics = await getReviewMetrics(foodId);
  const reactions = await getMyReviewReactions(foodId);

  const initialFeed = mergeReviewFeed({ reviews, metrics, reactions });

  return (
    <section className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customer Reviews</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Based on {metrics.length} verified ratings
          </p>
        </div>
      </div>

      {/* Inject Zustand Optimistic Context Provider */}
      <ReviewClientProvider
        initialReviews={initialFeed}
        foodId={foodId}
        userId={userId}
        foodName={foodName}
      >
        <ReviewList />
      </ReviewClientProvider>
    </section>
  );
}
```

> **Note**: For brevity of this blueprint, `review-client-provider.tsx` remains exactly as implemented using Zustand context. `related-foods.tsx`, `review-list.tsx`, `review-card.tsx`, and `review-form.tsx` files follow the exact same architectural dumb-component mappings shown in Feature Plan 2 of `implementation_plan.md`.
