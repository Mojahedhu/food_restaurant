"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchMenuProductsAction } from "@/actions/client-menu";
import { toast } from "sonner";
import { FoodWithDetails } from "../../types/sanityTypes";

export function useMenuCatalog(
  initialFoods: FoodWithDetails[],
  initialTotalCount: number,
) {
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

  const isInitialLoad = useRef(true);
  const nextPageToLoad = useRef(1); // Tracks next index to load synchronously

  // Sync SortBy with URL query params
  useEffect(() => {
    const params = new URLSearchParams();
    if (sortBy !== "latest") params.set("sort", sortBy);
    const queryString = params.toString();
    router.push(queryString ? `/menu?${queryString}` : "/menu", {
      scroll: false,
    });
  }, [sortBy, router]);

  const loadFoods = useCallback(
    async (pageNum: number, isLoadMore: boolean) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoading(true);

      const result = await fetchMenuProductsAction({ page: pageNum, sortBy });
      isFetchingRef.current = false;
      setIsLoading(false);

      if (result.success && result.foods) {
        setTotalCount(result.totalCount ?? 0);
        setFoods((prev) =>
          isLoadMore ? [...prev, ...result.foods!] : result.foods!,
        );
        setHasMore(
          pageNum * 12 + result.foods.length < (result.totalCount ?? 0),
        );
      } else {
        toast.error(result.error || "Failed to load menu items");
      }
    },
    [sortBy],
  );

  // Trigger reload on Sort changes
  // --- Update useEffect on Sort changes (skips mount fetch) ---
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    nextPageToLoad.current = 1; // Reset counter on sort change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
    loadFoods(0, false);
  }, [sortBy, loadFoods]);

  // --- Update loadMoreItems (synchronously updates counter) ---
  const loadMoreItems = useCallback(() => {
    if (hasMore && !isLoading) {
      const pageToLoad = nextPageToLoad.current;
      nextPageToLoad.current = pageToLoad + 1; // Synchronously increment to block double fetches
      setPage(pageToLoad);
      loadFoods(pageToLoad, true);
    }
  }, [hasMore, isLoading, loadFoods]);

  // Elite React Infinite Scroll Pattern:
  // Capture loadMoreItems inside a mutable ref to decouple useEffect from state changes.
  // This prevents observer re-creation cycles (observer thrashing) during loading/data transitions.
  const loadMoreRef = useRef(loadMoreItems);
  useEffect(() => {
    loadMoreRef.current = loadMoreItems;
  }, [loadMoreItems]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || isLoading || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Use the ref to call the latest handler without re-creating the observer.
            loadMoreRef.current?.(); // Invoke the latest closure ref
          }
        });
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isLoading, hasMore]);

  return {
    page,
    foods,
    totalCount,
    sortBy,
    setSortBy,
    isLoading,
    hasMore,
    sentinelRef,
  };
}
