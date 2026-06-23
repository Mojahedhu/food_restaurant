# Phase 11: Reviews Moderation & Feedback Center

This phase adds a comprehensive **Reviews Moderation & Feedback Center** to the Admin Dashboard (located at `/admin/reviews`). It allows administrators to review customer feedback, approve pending reviews (so they appear on the client-side), reject/unapprove reviews, write official admin responses, and monitor rating distributions and average satisfaction scores.

All features are designed to comply with the zero-trust server validation, crash elimination, and fluid UI transition rules in [plan.md](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/plan.md).

---

## User Review Required

> [!IMPORTANT]
>
> - **Schema Expansion:** We propose adding a new optional `adminReply` field (type `text`) to the `review` document schema. This allows admins to respond directly to customer feedback. Client routes will be able to fetch and display this reply under reviews.
> - **Real-Time Data Revalidation:** Every mutation (approve, reject, delete, reply) will trigger a `revalidateTag("reviews")` to instantly refresh both the admin tables/metrics and the client-facing menus.
> - **Optimistic UI Experience:** Moderation actions (approve/reject/delete) will use a custom hook (`useReviewsLogic`) that manages local override states to ensure instant state updates without layout flickers, rolling back automatically if the Sanity mutation fails.
> - **UI Layout Stability:** Min-height wrappers and clear loading skeletons will be placed on review tables and rating stats to ensure zero layout shift (CLS) during server action resolutions.

---

## Design Decisions & Resolutions

> [!NOTE]
>
> - **Schema Design Decision:** We will keep the boolean `approved` field to maintain compatibility with existing client-side queries (`approved == true`). To support feedback and responses, we will add the `adminReply` field to the schema.

---

## Proposed Changes

We will implement this phase by introducing types, updating the schema, creating backend actions, building custom hooks, and assembling the components.

```text
src/
├── actions/
│   └── admin-reviews.ts         # NEW: Server actions (Zod validation, Sanity mutations, cache revalidation)
├── app/
│   └── admin/
│       └── reviews/
│           └── page.tsx         # NEW: Reviews page route (data fetching & layout assembly)
├── components/
│   └── admin/
│       └── features/
│           └── reviews/
│               ├── reviewsTable.tsx        # NEW: Filterable, paginated review table list
│               ├── reviewsTableSkeleton.tsx # NEW: Skeleton loading placeholder for Reviews Table
│               ├── reviewFilter.tsx        # NEW: Reusable search and filter controls
│               ├── reviewMetricsCards.tsx   # NEW: Average rating display & stars breakdown
│               └── reviewDetailsDialog.tsx  # NEW: Reply interface & full metadata view
├── hooks/
│   └── useReviewsLogic.ts       # NEW: Custom hook for optimistic updates & transition wrapper
├── sanity/
│   └── schemaTypes/
│       └── review.ts            # MODIFY: Add adminReply field
└── types/
    └── admin.ts                 # MODIFY: Append ReviewSummary and ReviewMetrics interfaces
```

---

### 1. Schema Expansion

Update the Sanity review schema to allow administrators to write replies to user feedback.

#### [MODIFY] [review.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/schemaTypes/review.ts)

```typescript
// Insert around line 42 (in the fields array of review schema)
defineField({
  name: "adminReply",
  title: "Admin Reply",
  type: "text",
  rows: 3,
  description: "Official response from the restaurant administration.",
  validation: (Rule) => Rule.max(1000),
}),
```

---

### 2. Type Additions

Define the structures for reviews and metrics aggregates within the administrative context.

#### [MODIFY] [admin.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/types/admin.ts)

```typescript
// Append the following types to the end of the file

export interface ReviewSummary {
  _id: string;
  _createdAt: string;
  rating: number;
  comment: string;
  approved: boolean;
  adminReply?: string;
  food: {
    _id: string;
    name: string;
    images?: any;
  } | null;
  user: {
    _id: string;
    name: string;
    email: string;
    image?: any;
  } | null;
}

export interface RatingDistributionPoint {
  stars: number;
  count: number;
  percentage: number;
}

export interface ReviewMetricsSummary {
  totalReviews: number;
  pendingReviews: number;
  averageRating: number;
  distribution: RatingDistributionPoint[];
}
```

---

### 3. Server Actions for Reviews

Implement backend mutations protected by strict input validation (`Zod`) and revalidation of the `reviews` tag.

#### [NEW] [admin-reviews.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-reviews.ts)

```typescript
"use server";

import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { ReviewSummary, ReviewMetricsSummary } from "@/types/admin";
import { groq } from "next-sanity";
import { revalidateTag } from "next/cache";
import { z } from "zod";

// Input Validation Schemas
const ApproveReviewSchema = z.object({
  reviewId: z.string().min(1),
});

const RejectReviewSchema = z.object({
  reviewId: z.string().min(1),
});

const DeleteReviewSchema = z.object({
  reviewId: z.string().min(1),
});

const ReplyReviewSchema = z.object({
  reviewId: z.string().min(1),
  replyText: z
    .string()
    .min(1, "Reply comment cannot be empty")
    .max(1000, "Reply cannot exceed 1000 characters"),
});

interface FetchReviewsParams {
  page: number;
  pageSize: number;
  search?: string;
  rating?: string; // "all" or "1"-"5"
  status?: string; // "all", "approved", "pending"
}

/**
 * Fetch paged, filtered, and searched reviews from Sanity
 */
export async function fetchAdminReviewsPaged({
  page,
  pageSize,
  search = "",
  rating = "all",
  status = "all",
}: FetchReviewsParams): Promise<{ reviews: ReviewSummary[]; total: number }> {
  try {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    let filterClauses = `_type == "review"`;
    const params: Record<string, string | number> = { start, end };

    // Apply Approval Status filter
    if (status === "approved") {
      filterClauses += ` && approved == true`;
    } else if (status === "pending") {
      filterClauses += ` && approved == false`;
    }

    // Apply Rating filter
    if (rating !== "all") {
      const ratingValue = parseInt(rating, 10);
      if (!isNaN(ratingValue)) {
        filterClauses += ` && rating == $ratingVal`;
        params.ratingVal = ratingValue;
      }
    }

    // Apply Search filter (User Name, Food Name, Comment Text)
    if (search.trim()) {
      filterClauses += ` && (user->name match $search || food->name match $search || comment match $search)`;
      params.search = `*${search.trim()}*`;
    }

    const query = groq`{
      "reviews": *[${filterClauses}] | order(_createdAt desc)[$start...$end] {
        _id,
        _createdAt,
        rating,
        comment,
        approved,
        adminReply,
        food->{
          _id,
          name,
          images
        },
        user->{
          _id,
          name,
          email,
          image
        }
      },
      "total": count(*[${filterClauses}])
    }`;

    const { data } = await sanityFetch({
      query,
      params,
      tags: ["reviews"],
    });

    return {
      reviews: (data.reviews || []) as ReviewSummary[],
      total: data.total || 0,
    };
  } catch (error) {
    console.error("Failed to fetch admin reviews:", error);
    return { reviews: [], total: 0 };
  }
}

/**
 * Fetch aggregated statistics and ratings distribution
 */
export async function fetchAdminReviewMetrics(): Promise<ReviewMetricsSummary> {
  try {
    const query = groq`{
      "totalReviews": count(*[_type == "review"]),
      "pendingReviews": count(*[_type == "review" && approved == false]),
      "averageRating": coalesce(math::avg(*[_type == "review"].rating), 0),
      "fiveStar": count(*[_type == "review" && rating == 5]),
      "fourStar": count(*[_type == "review" && rating == 4]),
      "threeStar": count(*[_type == "review" && rating == 3]),
      "twoStar": count(*[_type == "review" && rating == 2]),
      "oneStar": count(*[_type == "review" && rating == 1])
    }`;

    const { data } = await sanityFetch({
      query,
      params: {},
      tags: ["reviews"],
    });

    const total = data.totalReviews || 0;
    const distribution = [
      { stars: 5, count: data.fiveStar || 0 },
      { stars: 4, count: data.fourStar || 0 },
      { stars: 3, count: data.threeStar || 0 },
      { stars: 2, count: data.twoStar || 0 },
      { stars: 1, count: data.oneStar || 0 },
    ].map((item) => ({
      ...item,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
    }));

    return {
      totalReviews: total,
      pendingReviews: data.pendingReviews || 0,
      averageRating: Math.round(data.averageRating * 10) / 10,
      distribution,
    };
  } catch (error) {
    console.error("Failed to fetch review metrics:", error);
    return {
      totalReviews: 0,
      pendingReviews: 0,
      averageRating: 0,
      distribution: [
        { stars: 5, count: 0, percentage: 0 },
        { stars: 4, count: 0, percentage: 0 },
        { stars: 3, count: 0, percentage: 0 },
        { stars: 2, count: 0, percentage: 0 },
        { stars: 1, count: 0, percentage: 0 },
      ],
    };
  }
}

/**
 * Approve a review to publish it on the main site
 */
export async function approveReviewAction(rawInput: unknown) {
  const result = ApproveReviewSchema.safeParse(rawInput);
  if (!result.success) {
    return { success: false, error: "Invalid review parameters." };
  }

  const { reviewId } = result.data;
  try {
    await client.patch(reviewId).set({ approved: true }).commit();

    revalidateTag("reviews");
    return { success: true };
  } catch (error) {
    console.error(`Failed to approve review ${reviewId}:`, error);
    return { success: false, error: "Database transaction failed." };
  }
}

/**
 * Reject or retract approval of a review
 */
export async function rejectReviewAction(rawInput: unknown) {
  const result = RejectReviewSchema.safeParse(rawInput);
  if (!result.success) {
    return { success: false, error: "Invalid review parameters." };
  }

  const { reviewId } = result.data;
  try {
    await client.patch(reviewId).set({ approved: false }).commit();

    revalidateTag("reviews");
    return { success: true };
  } catch (error) {
    console.error(`Failed to reject review ${reviewId}:`, error);
    return { success: false, error: "Database transaction failed." };
  }
}

/**
 * Submit or update admin reply to a review
 */
export async function replyToReviewAction(rawInput: unknown) {
  const result = ReplyReviewSchema.safeParse(rawInput);
  if (!result.success) {
    const errorMsg = result.error.errors[0]?.message || "Invalid input";
    return { success: false, error: errorMsg };
  }

  const { reviewId, replyText } = result.data;
  try {
    await client.patch(reviewId).set({ adminReply: replyText }).commit();

    revalidateTag("reviews");
    return { success: true };
  } catch (error) {
    console.error(`Failed to reply to review ${reviewId}:`, error);
    return { success: false, error: "Database transaction failed." };
  }
}

export async function deleteReviewAction(rawInput: unknown) {
  const result = DeleteReviewSchema.safeParse(rawInput);
  if (!result.success) {
    return { success: false, error: "Invalid parameters." };
  }

  const { reviewId } = result.data;
  try {
    // 1. Query for all documents that reference this review (e.g. metrics, reactions)
    const referencingDocIds = await client.fetch<string[]>(
      `*[references($reviewId)]._id`,
      { reviewId },
    );

    // 2. Perform a transaction to delete all referencing documents and the review itself
    let transaction = client.transaction();
    for (const docId of referencingDocIds) {
      transaction = transaction.delete(docId);
    }
    transaction = transaction.delete(reviewId);

    await transaction.commit();

    revalidateTag("reviews");
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete review ${reviewId}:`, error);
    return {
      success: false,
      error: "Database deletion failed due to dependency constraints.",
    };
  }
}
```

---

### 4. Custom Hook: `useReviewsLogic`

Implement a React hook to handle concurrent operations, trigger server actions, maintain client-side override dictionaries (optimistic UI), and show status toasts.

#### [NEW] [useReviewsLogic.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/hooks/useReviewsLogic.ts)

```typescript
"use client";

import { useTransition, useState, useEffect } from "react";
import { ReviewSummary } from "@/types/admin";
import {
  approveReviewAction,
  rejectReviewAction,
  deleteReviewAction,
  replyToReviewAction,
} from "@/actions/admin-reviews";
import { toast } from "sonner";

export function useReviewsLogic(initialReviews: ReviewSummary[]) {
  const [isPending, startTransition] = useTransition();

  // Dictionary to store local overrides: { [reviewId]: Partial<ReviewSummary> }
  const [localUpdates, setLocalUpdates] = useState<
    Record<string, Partial<ReviewSummary>>
  >({});

  // Sync and clean up local overrides when server data updates
  useEffect(() => {
    setLocalUpdates((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const reviewId in next) {
        const serverReview = initialReviews.find((r) => r._id === reviewId);
        const localUpdate = next[reviewId];

        // If review is deleted local-only, we keep it hidden until it leaves the server payload
        if (localUpdate._id === null) {
          if (!serverReview) {
            delete next[reviewId];
            changed = true;
          }
          continue;
        }

        if (serverReview) {
          const isApprovedSynced =
            localUpdate.approved === undefined ||
            serverReview.approved === localUpdate.approved;
          const isReplySynced =
            localUpdate.adminReply === undefined ||
            serverReview.adminReply === localUpdate.adminReply;

          if (isApprovedSynced && isReplySynced) {
            delete next[reviewId];
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [initialReviews]);

  // Combine server reviews with local override details, excluding those marked as deleted (null ID)
  const reviews = initialReviews
    .map((review) => {
      const update = localUpdates[review._id];
      if (update && update._id === null) return null; // Marked for deletion
      return update ? { ...review, ...update } : review;
    })
    .filter((r): r is ReviewSummary => r !== null);

  const handleApprove = async (reviewId: string) => {
    // 1. Apply local optimistic status update
    setLocalUpdates((prev) => ({
      ...prev,
      [reviewId]: { approved: true },
    }));

    startTransition(async () => {
      const result = await approveReviewAction({ reviewId });
      if (result.success) {
        toast.success("Review approved successfully! 🎉");
      } else {
        toast.error("Failed to approve review.");
        // Rollback local change
        setLocalUpdates((prev) => {
          const next = { ...prev };
          delete next[reviewId];
          return next;
        });
      }
    });
  };

  const handleReject = async (reviewId: string) => {
    // 1. Apply local optimistic status update
    setLocalUpdates((prev) => ({
      ...prev,
      [reviewId]: { approved: false },
    }));

    startTransition(async () => {
      const result = await rejectReviewAction({ reviewId });
      if (result.success) {
        toast.success("Review retracted/disapproved. ⏳");
      } else {
        toast.error("Failed to update review status.");
        // Rollback local change
        setLocalUpdates((prev) => {
          const next = { ...prev };
          delete next[reviewId];
          return next;
        });
      }
    });
  };

  const handleReply = async (reviewId: string, replyText: string) => {
    // 1. Apply local optimistic reply update
    setLocalUpdates((prev) => ({
      ...prev,
      [reviewId]: { ...prev[reviewId], adminReply: replyText },
    }));

    // Promise to handle loading toast easily
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const result = await replyToReviewAction({ reviewId, replyText });
        if (result.success) {
          toast.success("Admin reply published! 💬");
          resolve(true);
        } else {
          toast.error(result.error || "Failed to publish reply.");
          // Rollback local change
          setLocalUpdates((prev) => {
            const next = { ...prev };
            if (next[reviewId]) {
              const { adminReply, ...rest } = next[reviewId];
              if (Object.keys(rest).length === 0) {
                delete next[reviewId];
              } else {
                next[reviewId] = rest;
              }
            }
            return next;
          });
          resolve(false);
        }
      });
    });
  };

  const handleDelete = async (reviewId: string) => {
    // 1. Capture previous state to restore on rollback
    const previousUpdate = localUpdates[reviewId];

    // 2. Apply local optimistic deletion (null ID acts as deletion flag)
    setLocalUpdates((prev) => ({
      ...prev,
      [reviewId]: { _id: null as any },
    }));

    startTransition(async () => {
      const result = await deleteReviewAction({ reviewId });
      if (result.success) {
        toast.success("Review deleted permanently.");
      } else {
        toast.error("Failed to delete review.");
        // Rollback local change to previous state (or remove override if there was none)
        setLocalUpdates((prev) => {
          const next = { ...prev };
          if (previousUpdate) {
            next[reviewId] = previousUpdate;
          } else {
            delete next[reviewId];
          }
          return next;
        });
      }
    });
  };

  return {
    reviews,
    isPending,
    handleApprove,
    handleReject,
    handleReply,
    handleDelete,
  };
}
```

---

### 5. UI Features & Layout Elements

Create the modular dashboard layout elements using the pre-configured `shadcn/ui` system.

#### [NEW] [reviewMetricsCards.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/reviews/reviewMetricsCards.tsx)

```tsx
"use client";

import { ReviewMetricsSummary } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare, AlertCircle, TrendingUp } from "lucide-react";

interface ReviewMetricsProps {
  metrics: ReviewMetricsSummary;
}

export function ReviewMetricsCards({ metrics }: ReviewMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Average Score Card */}
      <Card className="relative overflow-hidden border bg-card text-card-foreground">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="size-4 text-amber-500 fill-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-baseline gap-2">
            {metrics.averageRating.toFixed(1)}{" "}
            <span className="text-sm text-muted-foreground">/ 5.0</span>
          </div>
          <div className="flex gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`size-3.5 ${
                  star <= Math.round(metrics.averageRating)
                    ? "text-amber-500 fill-amber-500"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Total Reviews Card */}
      <Card className="border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
          <MessageSquare className="size-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalReviews}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Submitted comments
          </p>
        </CardContent>
      </Card>

      {/* Pending Approvals Card */}
      <Card className="border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            Pending Moderation
          </CardTitle>
          <AlertCircle
            className={`size-4 ${metrics.pendingReviews > 0 ? "text-destructive animate-pulse" : "text-emerald-500"}`}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.pendingReviews}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.pendingReviews > 0 ? "Needs admin approval" : "All clean!"}
          </p>
        </CardContent>
      </Card>

      {/* Stars Distribution Chart (Virtual Card) */}
      <Card className="border bg-card col-span-1 md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Rating Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 pt-1">
          {metrics.distribution.map((dist) => (
            <div key={dist.stars} className="flex items-center text-xs gap-2">
              <span className="w-3 text-right font-medium">{dist.stars}★</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${dist.percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-muted-foreground">
                {dist.percentage}%
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### [NEW] [reviewsTable.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/reviews/reviewsTable.tsx)

```tsx
"use client";

import { useState } from "react";
import { ReviewSummary } from "@/types/admin";
import { useReviewsLogic } from "@/hooks/useReviewsLogic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  Star,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  MessageSquareShare,
  Trash2,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReviewDetailsDialog } from "./reviewDetailsDialog";

interface ReviewsTableProps {
  initialReviews: ReviewSummary[];
}

export function ReviewsTable({ initialReviews }: ReviewsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    reviews,
    isPending,
    handleApprove,
    handleReject,
    handleReply,
    handleDelete,
  } = useReviewsLogic(initialReviews);

  const [selectedReview, setSelectedReview] = useState<ReviewSummary | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Sorting Handler
  const currentSortBy = searchParams.get("sortBy") || "date";
  const currentSortOrder = searchParams.get("sortOrder") || "desc";

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentSortBy === field) {
      params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", field);
      params.set("sortOrder", "desc");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const renderSortIcon = (field: string) => {
    if (currentSortBy !== field)
      return <ArrowUpDown className="ml-1 size-3 opacity-50" />;
    return currentSortOrder === "asc" ? (
      <ArrowUp className="ml-1 size-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 size-3 text-primary" />
    );
  };

  return (
    <div className="relative rounded-md border bg-card overflow-hidden">
      {/* Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity duration-300">
          <div className="flex flex-col items-center gap-2">
            <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-xs text-muted-foreground font-medium">
              Updating Reviews...
            </p>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">User</TableHead>
            <TableHead className="w-[150px]">Food Item</TableHead>
            <TableHead
              className="w-[120px] cursor-pointer hover:text-foreground"
              onClick={() => handleSort("rating")}
            >
              <span className="flex items-center">
                Rating {renderSortIcon("rating")}
              </span>
            </TableHead>
            <TableHead>Comment</TableHead>
            <TableHead
              className="w-[120px] cursor-pointer hover:text-foreground"
              onClick={() => handleSort("date")}
            >
              <span className="flex items-center">
                Submitted {renderSortIcon("date")}
              </span>
            </TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[60px] text-right"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {(reviews || []).length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-32 text-center text-muted-foreground"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <AlertCircle className="size-6 text-muted-foreground" />
                  <p>No reviews found matching the search criteria.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            reviews.map((review) => {
              return (
                <TableRow
                  key={review._id}
                  className="transition-colors hover:bg-muted/40"
                >
                  {/* User Cell */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage
                          src={
                            review.user?.image?.asset
                              ? `/api/image-url?asset=${review.user.image.asset._ref}`
                              : undefined
                          }
                        />
                        <AvatarFallback>
                          <User className="size-4 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="truncate max-w-[140px]">
                        <p className="text-sm font-semibold truncate">
                          {review.user?.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {review.user?.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Food Item Cell */}
                  <TableCell className="font-medium text-sm">
                    {review.food?.name || "Unknown Food"}
                  </TableCell>

                  {/* Rating Stars Cell */}
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < review.rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>

                  {/* Comment Excerpt */}
                  <TableCell className="max-w-[280px]">
                    <div className="truncate text-sm">
                      <span className="text-foreground">{review.comment}</span>
                      {review.adminReply && (
                        <div className="mt-1 flex items-start gap-1.5 text-xs text-primary bg-primary/5 rounded p-1 border border-primary/10">
                          <span className="font-semibold shrink-0">Admin:</span>
                          <span className="truncate italic">
                            "{review.adminReply}"
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Submitted Date */}
                  <TableCell className="text-muted-foreground text-xs">
                    {format(new Date(review._createdAt), "MMM d, yyyy")}
                  </TableCell>

                  {/* Approval Status Badge */}
                  <TableCell>
                    {review.approved ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 flex w-fit items-center gap-1"
                      >
                        <CheckCircle className="size-3" /> Approved
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-amber-500/30 bg-amber-500/10 text-amber-500 flex w-fit items-center gap-1"
                      >
                        <AlertCircle className="size-3" /> Pending
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-8 p-0">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedReview(review);
                            setDetailsOpen(true);
                          }}
                        >
                          <MessageSquareShare className="mr-2 size-4 text-muted-foreground" />{" "}
                          View & Reply
                        </DropdownMenuItem>

                        {review.approved ? (
                          <DropdownMenuItem
                            onClick={() => handleReject(review._id)}
                          >
                            <XCircle className="mr-2 size-4 text-amber-500" />{" "}
                            Disapprove
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleApprove(review._id)}
                          >
                            <CheckCircle className="mr-2 size-4 text-emerald-500" />{" "}
                            Approve
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={() => handleDelete(review._id)}
                        >
                          <Trash2 className="mr-2 size-4" /> Delete Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Selected Review Details Dialog */}
      {selectedReview && (
        <ReviewDetailsDialog
          review={selectedReview}
          isOpen={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedReview(null);
          }}
          onReply={handleReply}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
```

#### [NEW] [reviewDetailsDialog.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/reviews/reviewDetailsDialog.tsx)

```tsx
"use client";

import { useState } from "react";
import { ReviewSummary } from "@/types/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star, Send, ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface ReviewDetailsProps {
  review: ReviewSummary;
  isOpen: boolean;
  onClose: () => void;
  onReply: (reviewId: string, replyText: string) => Promise<boolean>;
  onApprove: (reviewId: string) => void;
  onReject: (reviewId: string) => void;
}

export function ReviewDetailsDialog({
  review,
  isOpen,
  onClose,
  onReply,
  onApprove,
  onReject,
}: ReviewDetailsProps) {
  const [replyText, setReplyText] = useState(review.adminReply || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || replyText.trim() === review.adminReply) return;

    setSubmitting(true);
    const success = await onReply(review._id, replyText.trim());
    setSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] border bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            Review Details
          </DialogTitle>
          <DialogDescription className="text-xs">
            Submitted by {review.user?.name || "Anonymous"} on{" "}
            {format(new Date(review._createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* User & Item Context */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/40 p-3 rounded-lg border">
            <div>
              <span className="text-xs text-muted-foreground block font-medium">
                Customer
              </span>
              <span className="font-semibold block">
                {review.user?.name || "Anonymous"}
              </span>
              <span className="text-xs text-muted-foreground truncate block">
                {review.user?.email || "No email"}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block font-medium">
                Food Item
              </span>
              <span className="font-semibold block">
                {review.food?.name || "Unknown Food"}
              </span>
              <div className="flex items-center gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3.5 ${
                      i < review.rating
                        ? "text-amber-500 fill-amber-500"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Review Message */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              User Comment
            </Label>
            <div className="text-sm bg-muted/20 border p-3 rounded-lg leading-relaxed italic text-foreground">
              "{review.comment}"
            </div>
          </div>

          {/* Admin Response Section */}
          <form onSubmit={handleSubmitReply} className="space-y-2">
            <Label
              htmlFor="adminReply"
              className="text-xs font-semibold text-muted-foreground flex items-center justify-between"
            >
              <span>Admin Reply Response</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                Max 1000 characters
              </span>
            </Label>
            <Textarea
              id="adminReply"
              placeholder="Write an official response to the customer feedback..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="resize-none h-24 text-sm"
              disabled={submitting}
            />

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              {/* Quick Status Control Buttons inside Dialog Footer */}
              <div className="flex gap-2 mr-auto">
                {review.approved ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 h-9"
                    onClick={() => {
                      onReject(review._id);
                      onClose();
                    }}
                  >
                    <XCircle className="mr-1.5 size-4" /> Disapprove
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 h-9"
                    onClick={() => {
                      onApprove(review._id);
                      onClose();
                    }}
                  >
                    <CheckCircle className="mr-1.5 size-4" /> Approve
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    submitting ||
                    !replyText.trim() ||
                    replyText.trim() === review.adminReply
                  }
                  className="h-9"
                >
                  {submitting ? (
                    <div className="size-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Send className="mr-1.5 size-3.5" />
                  )}
                  Save Reply
                </Button>
              </div>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 5.1 Reusable Review Filter Component

#### [NEW] [reviewFilter.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/reviews/reviewsFilter.tsx)

```tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useTransition } from "react";

interface ReviewFilterProps {
  initialSearch?: string;
  initialRating?: string;
  initialStatus?: string;
}

export function ReviewFilter({
  initialSearch = "",
  initialRating = "all",
  initialStatus = "all",
}: ReviewFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset to page 1 on filter/search change

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchVal = formData.get("search") as string;
    handleFilterChange("search", searchVal);
  };

  return (
    <div className="relative flex flex-col gap-3 md:flex-row md:items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
      {/* Search Input Box */}
      <form className="relative flex-1 max-w-sm" onSubmit={handleSearchSubmit}>
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          name="search"
          defaultValue={initialSearch}
          placeholder="Search reviews, users, or items..."
          className="pl-9 h-9"
        />
        {isPending && (
          <div className="absolute right-3 top-2.5 size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        )}
      </form>

      {/* Filter Selection Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Selection Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Status
          </span>
          <Select
            defaultValue={initialStatus}
            onValueChange={(val) => handleFilterChange("status", val)}
          >
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rating Selection Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Rating
          </span>
          <Select
            defaultValue={initialRating}
            onValueChange={(val) => handleFilterChange("rating", val)}
          >
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stars</SelectItem>
              <SelectItem value="5">5 Stars ★</SelectItem>
              <SelectItem value="4">4 Stars ★</SelectItem>
              <SelectItem value="3">3 Stars ★</SelectItem>
              <SelectItem value="2">2 Stars ★</SelectItem>
              <SelectItem value="1">1 Star ★</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
```

### 5.2 Reviews Table Skeleton Loader

#### [NEW] [reviewsTableSkeleton.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/reviews/reviewsTableSkeleton.tsx)

```tsx
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ReviewsTableSkeleton() {
  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">User</TableHead>
            <TableHead className="w-[150px]">Food Item</TableHead>
            <TableHead className="w-[120px]">Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead className="w-[120px]">Submitted</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[60px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full shrink-0" />
                  <div className="space-y-1 w-full">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="size-3.5 rounded-full" />
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-3.5 w-[50%]" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="size-8 rounded-md ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

### 6. Admin Page Integration

Assemble the layout inside the routing structure, handling initial data aggregation on the server-side.

#### [NEW] [page.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/app/admin/reviews/page.tsx)

```tsx
import { Metadata } from "next";
import {
  fetchAdminReviewsPaged,
  fetchAdminReviewMetrics,
} from "@/actions/admin-reviews";
import { ReviewMetricsCards } from "@/components/admin/features/reviews/reviewMetricsCards";
import { ReviewsTable } from "@/components/admin/features/reviews/reviewsTable";
import { ReviewFilter } from "@/components/admin/features/reviews/reviewFilter";
import { PaginationControls } from "@/components/admin/features/orders/paginationControls";

export const metadata: Metadata = {
  title: "Product Reviews Moderation | Quick Food Admin",
  description:
    "Approve customer comments, write admin responses, and monitor restaurant metrics.",
};

// URL Query Param Props
interface ReviewsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    rating?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function ReviewsModerationPage({
  searchParams,
}: ReviewsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";
  const rating = params.rating || "all";
  const status = params.status || "all";

  const pageSize = 10;

  // Run database fetches concurrently
  const [reviewsData, metrics] = await Promise.all([
    fetchAdminReviewsPaged({ page, pageSize, search, rating, status }),
    fetchAdminReviewMetrics(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header and Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Reviews & Feedback Center
        </h1>
        <p className="text-muted-foreground text-sm">
          Moderate incoming customer feedback, reply to user experiences, and
          inspect satisfaction scores.
        </p>
      </div>

      {/* Overview Statistics Cards */}
      <ReviewMetricsCards metrics={metrics} />

      {/* Reusable Client-Side Filters & Search */}
      <ReviewFilter
        initialSearch={search}
        initialRating={rating}
        initialStatus={status}
      />

      {/* Interactive Main Reviews List Table */}
      <div className="min-h-[400px]">
        <ReviewsTable initialReviews={reviewsData.reviews} />
      </div>

      {/* Reusable Numbered URL Pagination Controls */}
      <PaginationControls
        totalItems={reviewsData.total}
        currentPage={page}
        pageSize={pageSize}
      />
    </div>
  );
}
```

---

## Verification Plan

### Automated Tests

- **TypeScript compilation audit:** Run `npx tsc --noEmit` to verify typegen compatibility.
- **Next.js Lint & Build check:** Run `npm run build` or `pnpm build` to compile the app and ensure all server components build with correct static properties and schemas.

### Manual Verification

1. **Moderation Status Flow:**
   - Submit a review from the client side menu (ensure it defaults to `approved: false` and is invisible to other client profiles).
   - Go to `/admin/reviews`, locate the review under "Pending", and click "Approve". Verify the status changes instantly (optimistically) and becomes visible on the client menu.
   - Click "Disapprove" on the review and verify that it moves back to pending and disappears from the client-side list.
2. **Admin Reply Integration:**
   - Select a review in the table, write an admin reply, and click "Save Reply".
   - Verify the reply displays directly inside the review card in the dashboard table.
   - Verify the reply is fetched and rendered correctly under the food item's review lists on the customer menu.
3. **URL Parameter Filter Matching:**
   - Search for a specific word (e.g. "delicious"), select a 5-star rating filter, and verify the URL changes to `?search=delicious&rating=5`. Reload the page and ensure the filters remain active and list the correct items.
4. **Layout Shift CLS Checks:**
   - Reload `/admin/reviews` on slow 3G network speeds to inspect skeleton loading and confirm charts or tables do not cause sudden shifts in screen layouts.
