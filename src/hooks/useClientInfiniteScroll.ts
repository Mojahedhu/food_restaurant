"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useClientInfiniteScroll<T>(
  items: T[],
  itemsPerPage: number = 5,
) {
  const [page, setPage] = useState(1);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  // Safe extraction with fallbacks
  const safeItems = items || [];
  const totalItems = safeItems.length;
  const visibleItems = safeItems.slice(0, page * itemsPerPage);
  const hasMore = visibleItems.length < totalItems;

  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMoreItems = useCallback(() => {
    // Rule 5: Explicit Loading Lock (isFetchingNextPage)
    if (hasMore && !isFetchingNextPage) {
      setIsFetchingNextPage(true);

      // Artificial delay (300ms) to allow DOM layout to stabilize,
      // prevent thrashing, and show the sentinel loader smoothly
      setTimeout(() => {
        setPage((prevPage) => prevPage + 1);
        setIsFetchingNextPage(false);
      }, 300);
    }
  }, [hasMore, isFetchingNextPage]);

  // Elite React Infinite Scroll Pattern:
  // Decouple useEffect from state changes to prevent observer re-creation cycles
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
    visibleItems,
    hasMore,
    isFetchingNextPage,
    sentinelRef,
  };
}
