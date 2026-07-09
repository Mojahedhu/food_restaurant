# Real-Time Feedback Orchestration Execution Blueprint

Here is the complete, production-ready source code for your advanced real-time layer refactor. As requested, I have generated this entirely within this artifact so you can manually execute the changes in your workspace.

### 🚫 Core Improvements Implemented

- **Memory Safety:** Injected `isMounted` refs and `AbortController` signals into the `useReviewRealtime` fetch calls.
- **Robust Subscriptions:** Converted all `client.listen().subscribe()` calls to use explicit `{ next, error }` handler objects for proper connection lifecycle logging.
- **Teardown Rigor:** Explicit unsubscription and abort logic inside every `useEffect` cleanup return.
- **Strict Hydration:** Cleaned up the `ReviewClientProvider` props and boundary wrappers.

---

### 1. The Context Injector

#### `src/app/(client)/food/[foodSlug]/_components/review-client-provider.tsx`

_Acts as the strict hydration boundary, wrapping the state provider and then the real-time boundary._

```typescript
"use client";

import { ReviewsProvider } from "@/providers/review/reviewProvider";
import { ReviewView } from "../../../../../../types/sanityTypes";
import { ReviewRealtimeBoundary } from "@/components/common/reviewRealtimeBoundary";
import { ReactNode } from "react";

interface ReviewClientProviderProps {
  children: ReactNode;
  initialReviews: ReviewView[];
  foodId: string;
  userId?: string;
  foodName?: string;
}

export default function ReviewClientProvider({
  children,
  initialReviews,
  foodId,
  userId,
}: ReviewClientProviderProps) {
  return (
    <ReviewsProvider initialReviews={initialReviews}>
      {/*
        The boundary mounts ONLY after initialReviews are fully hydrated
        into the Zustand/Context store.
      */}
      <ReviewRealtimeBoundary foodId={foodId} userId={userId!}>
        {children}
      </ReviewRealtimeBoundary>
    </ReviewsProvider>
  );
}
```

---

### 2. The Subscription Boundary

#### `src/components/common/reviewRealtimeBoundary.tsx`

_Orchestrates the mounting of all real-time listeners simultaneously._

```typescript
"use client";

import { useReactionRealtime } from "@/hooks/useReactionRealtime";
import { useReviewMetricsRealtime } from "@/hooks/useReviewMetricsRealtime";
import { useReviewRealtime } from "@/hooks/useReviewRealtime";
import { ReactNode } from "react";

interface ReviewRealtimeBoundaryProps {
  children: ReactNode;
  foodId: string;
  userId: string;
}

export function ReviewRealtimeBoundary({
  children,
  foodId,
  userId,
}: ReviewRealtimeBoundaryProps) {

  // 1. Listen for new/deleted reviews
  useReviewRealtime({ foodId });

  // 2. Listen for current user's reaction updates (likes/dislikes)
  useReactionRealtime({ foodId, userId });

  // 3. Listen for global metric aggregations (total likes/dislikes)
  useReviewMetricsRealtime({ foodId });

  return <>{children}</>;
}
```

---

### 3. The Memory-Safe Review Hook

#### `src/hooks/useReviewRealtime.ts`

_Crucial fix here: Adding `AbortController` and `isMounted` checks to prevent the "React state update on unmounted component" memory leak during async Sanity reference fetching._

```typescript
import { client } from "@/sanity/lib/client";
import { useReviewDispatch } from "@/stores/review/hooks/useReviewsState";
import { useEffect } from "react";
import { ReviewStatic } from "../../types/sanityTypes";
import { UserImage } from "../../sanity.types";

interface useReviewRealtimeOptions {
  foodId: string;
}

const REVIEW_PROJECTION_QUERY = `*[
  _type == "review"
  && food._ref == $foodId
  && approved == true
]{
  _id, _type, _rev, _createdAt, _updatedAt,
  rating, comment, approved, food
}`;

export function useReviewRealtime({ foodId }: useReviewRealtimeOptions) {
  const dispatch = useReviewDispatch();

  useEffect(() => {
    if (!foodId) return;

    let isMounted = true;
    const abortController = new AbortController();

    const subscription = client
      .listen<ReviewStatic>(
        REVIEW_PROJECTION_QUERY,
        { foodId },
        {
          includeResult: true,
          includePreviousRevision: true,
          visibility: "query",
        },
      )
      .subscribe({
        next: async (event) => {
          if (!("transition" in event)) return;

          const transition = event.transition;

          // Handle Deletion
          if (transition === "disappear") {
            if (isMounted) {
              dispatch({
                type: "review_projection_removed",
                payload: { reviewId: event.documentId },
              });
            }
            return;
          }

          const result = event.result;
          if (!result) return;

          try {
            // ASYNC FETCH: We must protect against unmounts here!
            const normalizedResult = await client.fetch<{
              user: { _id: string; name: string; image: UserImage };
              foodName: string;
            }>(
              `*[_id == $docID][0]{ "user": user->{ _id, name, image }, "foodName": food->name }`,
              { docID: result._id },
              { signal: abortController.signal }, // Can be aborted if unmounted
            );

            // MEMORY LEAK PREVENTION: Do not dispatch if component unmounted while fetching
            if (!isMounted) return;

            dispatch({
              type: "review_projection_received",
              payload: {
                review: {
                  _id: result._id,
                  _type: "review",
                  rating: result.rating,
                  comment: result.comment,
                  approved: result.approved,
                  food: result.food,
                  foodName: normalizedResult?.foodName || "Unknown",
                  user: normalizedResult?.user,
                  _createdAt: result._createdAt,
                  _updatedAt: result._updatedAt,
                  _rev: result._rev,
                },
              },
            });
          } catch (err: any) {
            // Ignore abort errors natively triggered by cleanup
            if (err.name === "AbortError") {
              console.log(
                "Realtime review fetch aborted (component unmounted)",
              );
            } else {
              console.error("Failed to normalize review projection:", err);
            }
          }
        },
        error: (err) => {
          console.error("Sanity Review Realtime Listener Error:", err);
        },
      });

    // RIGOROUS TEARDOWN
    return () => {
      isMounted = false;
      abortController.abort();
      subscription.unsubscribe();
    };
  }, [foodId, dispatch]);
}
```

---

### 4. The Reaction Sync Hook

#### `src/hooks/useReactionRealtime.ts`

_Hardened error handling and explicit cleanup mapping._

```typescript
import { getReviewIdFromReactionId } from "@/lib/utils/helpers";
import { client } from "@/sanity/lib/client";
import { useReviewDispatch } from "@/stores/review/hooks/useReviewsState";
import { useEffect } from "react";

interface useReactionRealtimeOptions {
  foodId: string;
  userId: string;
}

const BASE_REACTION_REALTIME_QUERY = `*[
  _type == "reviewReaction"
  && food._ref == $foodId
  && user._ref == $userId
]`;

export function useReactionRealtime({
  foodId,
  userId,
}: useReactionRealtimeOptions) {
  const dispatch = useReviewDispatch();

  useEffect(() => {
    if (!userId || !foodId) return;

    const subscription = client
      .listen(
        BASE_REACTION_REALTIME_QUERY,
        { userId, foodId },
        {
          includeResult: true,
          includePreviousRevision: true,
          visibility: "query",
        },
      )
      .subscribe({
        next: (event) => {
          if (!("transition" in event)) return;

          // Handle reaction removal
          if (event.transition === "disappear") {
            const reviewId = getReviewIdFromReactionId(event.documentId!);
            dispatch({
              type: "reaction_projection_received",
              payload: { reviewId, reaction: null },
            });
            return;
          }

          const result = event.result as any;
          if (!result) return;

          const reviewId =
            result.review?._ref ?? getReviewIdFromReactionId(event.documentId!);
          if (!reviewId) return;

          dispatch({
            type: "reaction_projection_received",
            payload: {
              reviewId,
              reaction: result.type,
              mutationId: result.mutationId,
            },
          });
        },
        error: (error) => {
          console.error("Sanity Reaction Listener Error:", error);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [foodId, userId, dispatch]);
}
```

---

### 5. The Metrics Aggregation Hook

#### `src/hooks/useReviewMetricsRealtime.ts`

_Standardized subscription handler block._

```typescript
import { client } from "@/sanity/lib/client";
import { useReviewDispatch } from "@/stores/review/hooks/useReviewsState";
import { useEffect } from "react";

const METRICS_REALTIME_QUERY = `*[
  _type == "reviewMetrics"
  && food._ref == $foodId
]{
  review,
  likesCount,
  dislikesCount
}`;

export function useReviewMetricsRealtime({ foodId }: { foodId: string }) {
  const dispatch = useReviewDispatch();

  useEffect(() => {
    if (!foodId) return;

    const subscription = client
      .listen(
        METRICS_REALTIME_QUERY,
        { foodId },
        {
          includeResult: true,
          visibility: "query",
        },
      )
      .subscribe({
        next: (event) => {
          if (!("transition" in event) || event.transition === "disappear")
            return;

          const result = event.result as any;
          if (!result) return;

          const reviewId = result.review?._ref;
          if (!reviewId) return;

          dispatch({
            type: "metrics_projection_received",
            payload: {
              reviewId,
              likesCount: result.likesCount ?? 0,
              dislikesCount: result.dislikesCount ?? 0,
            },
          });
        },
        error: (error) => {
          console.error("Sanity Metrics Listener Error:", error);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [foodId, dispatch]);
}
```

### ✅ Ready to Execute

You can now safely copy-paste these blocks directly into your IDE. They strictly adhere to best-practice React component lifecycles and safely detach async operations when navigating between pages.
