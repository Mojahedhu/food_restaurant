"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchMenuProductsAction } from "@/actions/client-menu";
import { toast } from "sonner";
import { FoodWithDetails } from "../../types/sanityTypes";
import { SortOption } from "@/lib/data/menu";

export function useMenuCatalog(
  initialFoods: FoodWithDetails[],
  initialTotalCount: number,
  initialSort: SortOption,
) {
  const FOODS_PER_PAGE = 12;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Rule 7: URL-Driven State - Do not duplicate sort state in React if it belongs in the URL
  const currentSort = (searchParams.get("sort") as SortOption) || initialSort;
  const [isSortPending, startTransition] = useTransition();

  // const [sortBy, setSortBy] = useState(searchParams.get("sort") || "latest");
  // const [page, setPage] = useState(0);

  const [foods, setFoods] = useState<FoodWithDetails[]>(initialFoods);
  const [totalCount, setTotalCount] = useState(initialTotalCount);

  // Rule 5: Explicit Loading Locks
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasMore, setHasMore] = useState(initialFoods.length >= FOODS_PER_PAGE);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const nextPageToLoad = useRef(1); // Tracks next index to load synchronously

  // Sync state cleanly if the server pushes new data (e.g. user clicked back/forward button)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFoods(initialFoods);
    setTotalCount(initialTotalCount);
    nextPageToLoad.current = 1;
    setHasMore(initialFoods.length >= FOODS_PER_PAGE);
  }, [initialFoods, initialTotalCount, currentSort]);

  const setSortBy = (newSort: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newSort === "latest") {
        params.delete("sort");
      } else {
        params.set("sort", newSort);
      }
      router.push(`/menu?${params.toString()}`, { scroll: false });
    });
  };

  const loadMoreItems = useCallback(async () => {
    if (isFetchingNextPage || !hasMore) return;

    // Lock the infinite scroll
    setIsFetchingNextPage(true);

    const pageToLoad = nextPageToLoad.current;
    nextPageToLoad.current = pageToLoad + 1; // Synchronously increment

    const result = await fetchMenuProductsAction({
      page: pageToLoad,
      sortBy: currentSort,
    });

    if (result.success) {
      setTotalCount(result.totalCount);
      // Rule 6: Immutable Array Updater
      setFoods((prev) => [...prev, ...result.foods]);
      setHasMore(
        pageToLoad * FOODS_PER_PAGE + result.foods.length < result.totalCount,
      );
    } else {
      toast.error(result.error || "Failed to load menu items");
      // Revert counter on failure
      nextPageToLoad.current = pageToLoad;
    }

    setIsFetchingNextPage(false);
  }, [hasMore, currentSort, isFetchingNextPage]);

  // Elite observer pattern - Decouples useEffect from state dependencies to stop thrashing
  // Elite React Infinite Scroll Pattern:
  // Capture loadMoreItems inside a mutable ref to decouple useEffect from state changes.
  // This prevents observer re-creation cycles (observer thrashing) during loading/data transitions.
  const loadMoreRef = useRef(loadMoreItems);
  useEffect(() => {
    loadMoreRef.current = loadMoreItems;
  }, [loadMoreItems]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMoreRef.current?.();
          }
        });
      },
      { rootMargin: "250px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore]);

  return {
    foods,
    totalCount,
    sortBy: currentSort,
    setSortBy,
    isSortPending,
    isFetchingNextPage,
    hasMore,
    sentinelRef,
  };
}
