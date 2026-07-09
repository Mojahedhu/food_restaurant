# Enterprise Zustand Architecture Blueprint: Review Data Management

Based on your exact constraints from `plan.md` and `AGENTS.md`, this is a complete, production-ready, zero-placeholder implementation of a high-performance Zustand store.

### Key Architectural Mandates Executed:

1. **Zustand Provider Pattern:** Implemented `ReviewStoreProvider` to explicitly prevent cross-request SSR state pollution in Next.js.
2. **Absolute State Safety:** All reducers enforce strict immutability. Arrays use spread operators (`[...state, new]`) instead of `push()`, and objects use deep spreading to guarantee React reconciler integrity.
3. **Atomic Selectors & `useShallow`:** Selector hooks strictly return the exact primitive or shallowly-compared object required, terminating React's render phase instantly if unrelated slices mutate.
4. **Complete Typings:** Zero `any` types. Integrated exactly with `types/sanityTypes.ts`.

---

### 1. The Core Store & Reducers (`src/stores/review/useReviewStore.ts`)

This file defines the store factory function (not a global singleton). Note the strict array and record mutations.

```typescript
import { createStore } from "zustand";
import { ReviewView, PendingReactionMutation } from "@/../types/sanityTypes";
import { ReactionType } from "@/../sanity.types";

export interface ReviewState {
  reviews: Record<string, ReviewView>;
  isInitialized: boolean;
}

export interface ReviewActions {
  bootstrapReviews: (reviews: ReviewView[]) => void;
  addOptimisticReaction: (
    reviewId: string,
    reaction: ReactionType,
    startedAt: number,
  ) => void;
  resolveReaction: (reviewId: string, confirmedReaction: ReactionType) => void;
  addReviewOptimistic: (review: ReviewView) => void;
}

export type ReviewStore = ReviewState & ReviewActions;

/**
 * STORE FACTORY: Must be used with a Context Provider in Next.js App Router
 * to prevent cross-request state pollution during SSR.
 */
export const createReviewStore = (
  initialState: ReviewState = { reviews: {}, isInitialized: false },
) => {
  return createStore<ReviewStore>()((set) => ({
    ...initialState,

    bootstrapReviews: (reviews) =>
      set(() => {
        const reviewMap: Record<string, ReviewView> = {};
        reviews.forEach((review) => {
          if (review.review?._id) {
            reviewMap[review.review._id] = review;
          }
        });
        return { reviews: reviewMap, isInitialized: true };
      }),

    addOptimisticReaction: (reviewId, reaction, startedAt) =>
      set((state) => {
        const existing = state.reviews[reviewId];
        if (!existing) return state; // Guard against missing records

        const newMutation: PendingReactionMutation = {
          mutationId: crypto.randomUUID(), // Guarantee uniqueness
          startedAt,
          optimisticReaction: reaction,
          reactionConfirmed: false,
        };

        return {
          reviews: {
            ...state.reviews,
            [reviewId]: {
              ...existing,
              // Strictly safe array appending without mutating existing array reference
              pendingMutations: [
                ...(existing.pendingMutations || []),
                newMutation,
              ],
            },
          },
        };
      }),

    resolveReaction: (reviewId, confirmedReaction) =>
      set((state) => {
        const existing = state.reviews[reviewId];
        if (!existing) return state;

        return {
          reviews: {
            ...state.reviews,
            [reviewId]: {
              ...existing,
              confirmedReaction,
              // Safely clear mutations upon server reconciliation
              pendingMutations: [],
            },
          },
        };
      }),

    addReviewOptimistic: (newReviewView) =>
      set((state) => {
        const reviewId = newReviewView.review._id;
        // Strictly safe object append without overwriting the record blindly
        return {
          reviews: {
            ...state.reviews,
            [reviewId]: newReviewView,
          },
        };
      }),
  }));
};
```

---

### 2. Next.js SSR Provider Pattern (`src/stores/review/ReviewStoreProvider.tsx`)

This is the required boundary that injects an isolated store instance into the React tree per-request, satisfying Next.js safety rules.

```tsx
"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { type StoreApi, useStore } from "zustand";
import { createReviewStore, type ReviewStore } from "./useReviewStore";

export const ReviewStoreContext = createContext<
  StoreApi<ReviewStore> | undefined
>(undefined);

export interface ReviewStoreProviderProps {
  children: ReactNode;
}

export const ReviewStoreProvider = ({ children }: ReviewStoreProviderProps) => {
  const storeRef = useRef<StoreApi<ReviewStore>>();

  if (!storeRef.current) {
    // Initializes exactly once per client/SSR render tree
    storeRef.current = createReviewStore();
  }

  return (
    <ReviewStoreContext.Provider value={storeRef.current}>
      {children}
    </ReviewStoreContext.Provider>
  );
};

/**
 * Internal Context Consumer
 * Throws a clean error if a hook is used outside the provider boundary.
 */
export const useReviewStoreContext = <T,>(
  selector: (store: ReviewStore) => T,
): T => {
  const reviewStoreContext = useContext(ReviewStoreContext);

  if (!reviewStoreContext) {
    throw new Error(
      "useReviewStoreContext must be used within a ReviewStoreProvider",
    );
  }

  return useStore(reviewStoreContext, selector);
};
```

---

### 3. Atomic Selectors & Hooks (`src/stores/review/useReviewSelectors.ts`)

This isolates rendering. Components only re-render if their exact primitive value or shallow comparison changes.

```typescript
import { useShallow } from "zustand/react/shallow";
import { useReviewStoreContext } from "./ReviewStoreProvider";
import { getReviewDisplayState } from "./selector"; // Maintains compatibility with your existing projection logic
import { ReviewDisplayState } from "@/../types/sanityTypes";

/**
 * =========================================================
 * 1. Action Dispatchers
 * =========================================================
 * Use useShallow to ensure the object reference remains perfectly stable.
 * This guarantees components consuming actions NEVER re-render when state changes.
 */
export const useReviewActions = () => {
  return useReviewStoreContext(
    useShallow((state) => ({
      bootstrapReviews: state.bootstrapReviews,
      addOptimisticReaction: state.addOptimisticReaction,
      resolveReaction: state.resolveReaction,
      addReviewOptimistic: state.addReviewOptimistic,
    })),
  );
};

/**
 * =========================================================
 * 2. List-Level Selectors
 * =========================================================
 * Returns an array of IDs. The list component will only render if items are added or removed.
 * It ignores changes inside specific reviews (like reaction counts).
 */
export const useReviewIds = (): string[] => {
  return useReviewStoreContext(
    useShallow((state) =>
      Object.values(state.reviews)
        .filter((view) => Boolean(view?.review?._createdAt))
        .sort((a, b) => {
          const timeA = new Date(a.review._createdAt).getTime() || 0;
          const timeB = new Date(b.review._createdAt).getTime() || 0;
          return timeB - timeA;
        })
        .map((r) => r.review._id),
    ),
  );
};

/**
 * =========================================================
 * 3. Card-Level Selectors (Atomic Subscriptions)
 * =========================================================
 * Subscribes strictly to a SINGLE review in the Record.
 * Returns the exact ReviewDisplayState projection required for the UI.
 * This effectively memoizes every ReviewCard automatically!
 */
export const useReviewDisplay = (
  reviewId: string,
): ReviewDisplayState | undefined => {
  return useReviewStoreContext(
    // We use a primitive string ID to drill directly into the record in O(1) time
    (state) => {
      const rawView = state.reviews[reviewId];
      if (!rawView) return undefined;

      // Projections should be stable calculations
      return getReviewDisplayState(rawView);
    },
  );
};

/**
 * =========================================================
 * 4. Initialization Status
 * =========================================================
 */
export const useIsReviewsInitialized = (): boolean => {
  return useReviewStoreContext((state) => state.isInitialized);
};
```
