# Refactoring Roadmap: Client Directory `src/app/(client)`

This roadmap details the sequential, step-by-step refactoring of the front-facing website components in `src/app/(client)` to enforce absolute Separation of Concerns (Rule 7), Zero-Trust Server Security (Rule 1), and UX excellence.

---

## 1. High-Level Roadmap Overview

The client-side refactor will proceed in 6 standalone, sequential Feature Plans:

## 2. Feature Plan 1: Menu Catalog Decoupling & Server Action Migration

### A. Architectural Separation

Currently, `menu-client.tsx` manages state for sorting, paging, fetching data directly from the client via Sanity read tokens, and manual DOM Intersection Observers. We will refactor this into:

1.  **Server Action (`src/actions/client-menu.ts`):** All Sanity data fetches (queries, filters, counts) will run strictly in secure server-side scopes.
2.  **Custom Hook (`src/hooks/useMenuCatalog.ts`):** Handles all browser-side states, URL sync pushes, and scroll sentinels.
3.  **Presentational View Component (`src/app/(client)/menu/menu-catalog.tsx`):** A lightweight view component rendering layout and binding list variables.

### B. File Structure Adjustments

```
Before:
  src/app/(client)/menu/
    ├── page.tsx
    └── menu-client.tsx

After:
  src/actions/
    └── client-menu.ts              <-- [NEW] Server Action for fetching menu products
  src/hooks/
    └── useMenuCatalog.ts           <-- [NEW] Custom hook for paging, sorting, and sentinels
  src/app/(client)/menu/
    ├── page.tsx
    └── menu-catalog.tsx            <-- [REFACTORED] Dumb presentation UI
```

---

### C. Code Blueprints

#### 1. Server Action: `src/actions/client-menu.ts`

We will encapsulate Sanity fetches and validate query parameters using a strict Zod schema:

```typescript
"use server";

import { client } from "@/sanity/lib/client";
import { z } from "zod";
import { FoodWithDetails } from "@/types/sanityTypes";

const FOODS_PER_PAGE = 12;

const FetchMenuSchema = z.object({
  page: z.number().int().min(0).default(0),
  sortBy: z
    .enum(["latest", "name-asc", "name-desc", "price-low", "price-high"])
    .default("latest"),
});

export async function fetchMenuProductsAction(payload: unknown) {
  try {
    const parsed = FetchMenuSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error("Invalid query parameters");
    }

    const { page, sortBy } = parsed.data;
    const offset = page * FOODS_PER_PAGE;

    let orderClause = "_createdAt desc";
    if (sortBy === "name-asc") orderClause = "name asc";
    if (sortBy === "name-desc") orderClause = "name desc";
    if (sortBy === "price-low") orderClause = "price asc";
    if (sortBy === "price-high") orderClause = "price desc";

    const query = `
      *[_type == "food" && available == true]
      | order(${orderClause})
      [${offset}...${offset + FOODS_PER_PAGE}] {
        _id,
        _createdAt,
        name,
        "slug": slug.current,
        description,
        "basePrice": price,
        images,
        preparationTime,
        spiceLevel,
        available,
        featured,
        "averageRating": coalesce(math::avg(*[_type == "review" && food._ref == ^._id && approved == true].rating), 0),
        "totalReviews": count(*[_type == "review" && food._ref == ^._id && approved == true]),
        category->{ _id, name, "slug": slug.current, description },
        varieties[]->{ _id, name }
      }
    `;

    const countQuery = `count(*[_type == "food" && available == true])`;

    const [data, count] = await Promise.all([
      client.fetch<FoodWithDetails[]>(query, {}, { next: { revalidate: 60 } }), // Cache for 60 seconds
      client.fetch<number>(countQuery, {}, { next: { revalidate: 60 } }),
    ]);

    return { success: true, foods: data, totalCount: count };
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return { success: false, error: "Unable to retrieve menu products" };
  }
}
```

#### 2. Custom Hook: `src/hooks/useMenuCatalog.ts`

This custom hook handles page query changes, browser history URLs, and scroll intersections:

```typescript
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchMenuProductsAction } from "@/actions/client-menu";
import { FoodWithDetails } from "@/types/sanityTypes";
import { toast } from "sonner";
export function useMenuCatalog(initialFoods: FoodWithDetails[], initialTotalCount: number) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "latest");
  const [page, setPage] = useState(0);
  const [foods, setFoods] = useState<FoodWithDetails[]>(initialFoods);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialFoods.length >= 12);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  // Sync SortBy with URL query params
  useEffect(() => {
    const params = new URLSearchParams();
    if (sortBy !== "latest") params.set("sort", sortBy);
    const queryString = params.toString();
    router.push(queryString ? `/menu?${queryString}` : "/menu", { scroll: false });
  }, [sortBy, router]);
  const loadFoods = useCallback(async (pageNum: number, isLoadMore: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    const result = await fetchMenuProductsAction({ page: pageNum, sortBy });
    isFetchingRef.current = false;
    setIsLoading(false);
    if (result.success && result.foods) {
      setTotalCount(result.totalCount ?? 0);
      setFoods((prev) => (isLoadMore ? [...prev, ...result.foods!] : result.foods!));
      setHasMore((pageNum * 12) + result.foods.length < (result.totalCount ?? 0));
    } else {
      toast.error(result.error || "Failed to load menu items");
    }
  }, [sortBy]);
  // Trigger reload on Sort changes
  useEffect(() => {
    setPage(0);
    loadFoods(0, false);
  }, [sortBy, loadFoods]);
  const loadMoreItems = useCallback(() => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadFoods(nextPage, true);
    }
  }, [page, hasMore, isLoading, loadFoods]);
  // Elite React Infinite Scroll Pattern:
  // Capture loadMoreItems inside a mutable ref to decouple useEffect from state changes.
  // This prevents observer re-creation cycles (observer thrashing) during loading/data transitions.
  const loadMoreRef = useRef(loadMoreItems);
  useEffect(() => {
    loadMoreRef.current = loadMoreItems;
  }, [loadMoreItems]);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreRef.current(); // Invoke the latest closure ref
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]); // Only reinstantiates if pagination/limit state reaches terminal count
  return {
    foods,
    totalCount,
    sortBy,
    setSortBy,
    isLoading,
    hasMore,
    sentinelRef,
  };
}

---

## 3. Testing & Verification Criteria

1.  **URL Parameter Sync:** Verify changing the sorting dropdown updates the URL search query parameters (e.g. `?sort=price-low`) without forcing a full page reload.
2.  **Infinite Scroll sentinel:** Verify scrolling down to the bottom sentinel node triggers the Intersection Observer and appends items to the menu grid seamlessly.
3.  **Loading lockouts:** Verify that fast/repeated scrolling does not fire multiple duplicate requests concurrently (protected by the `isFetchingRef` lock).
4.  **No direct client fetches:** Use browser developer tools (network tab) to confirm that Sanity API keys or direct client-side reads are no longer executing; all fetches must go through Next.js Server Actions.
```
