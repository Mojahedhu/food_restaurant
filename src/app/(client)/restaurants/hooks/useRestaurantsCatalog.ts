"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Restaurant } from "@/../types/sanityTypes";

export type SortOption = "latest" | "rating" | "delivery-time" | "delivery-fee";

export function useRestaurantsCatalog(initialRestaurants: Restaurant[]) {
  const ITEMS_PER_PAGE = 8;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [page, setPage] = useState(1);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset pagination on filter change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [searchQuery, sortBy, selectedCategory]);

  const filteredAndSorted = useMemo(() => {
    let result = initialRestaurants.filter((restaurant) => {
      // 1. Search Check
      if (
        searchQuery &&
        !restaurant.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim())
      ) {
        return false;
      }

      // 2. Category Check
      if (selectedCategory !== "all") {
        const hasCategory = restaurant.categories?.some(
          (c) => c.name?.toLowerCase() === selectedCategory.toLowerCase(),
        );
        if (!hasCategory) return false;
      }

      return true;
    });

    result = result.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "delivery-time":
          return (
            (a.estimatedDeliveryTime || 0) - (b.estimatedDeliveryTime || 0)
          );
        case "delivery-fee":
          return (a.deliveryFee || 0) - (b.deliveryFee || 0);
        case "latest":
        default:
          return 0; // Assuming initial API fetch preserves "latest" order
      }
    });

    return result;
  }, [initialRestaurants, searchQuery, sortBy, selectedCategory]);

  const paginatedRestaurants = useMemo(() => {
    return filteredAndSorted.slice(0, page * ITEMS_PER_PAGE);
  }, [filteredAndSorted, page]);

  const hasMore = paginatedRestaurants.length < filteredAndSorted.length;

  const loadMoreItems = useCallback(() => {
    if (isFetchingNextPage || !hasMore) return;
    setIsFetchingNextPage(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsFetchingNextPage(false);
    }, 400);
  }, [hasMore, isFetchingNextPage]);

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
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedCategory,
    setSelectedCategory,
    restaurants: paginatedRestaurants,
    totalResults: filteredAndSorted.length,
    isFetchingNextPage,
    hasMore,
    sentinelRef,
  };
}
