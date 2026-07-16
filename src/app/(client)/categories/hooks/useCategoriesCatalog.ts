import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { CategoryWithCount } from "@/../types/sanityTypes";

export type SortOption =
  | "latest"
  | "name-asc"
  | "name-desc"
  | "items-high"
  | "items-low";

export function useCategoriesCatalog(initialCategories: CategoryWithCount[]) {
  const CATEGORIES_PER_PAGE = 8; // User requested limit

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [page, setPage] = useState(1);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset pagination to page 1 whenever search or sort changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [searchQuery, sortBy]);

  // 1. Live Filter and Sort
  const filteredAndSortedCategories = useMemo(() => {
    let result = (initialCategories || []).filter((category) =>
      (category.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim()),
    );

    result = result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "");
        case "items-high":
          return (b.itemsCount || 0) - (a.itemsCount || 0);
        case "items-low":
          return (a.itemsCount || 0) - (b.itemsCount || 0);
        case "latest":
        default:
          return 0;
      }
    });

    return result;
  }, [initialCategories, searchQuery, sortBy]);

  // 2. Slice for Infinite Pagination
  const paginatedCategories = useMemo(() => {
    return filteredAndSortedCategories.slice(0, page * CATEGORIES_PER_PAGE);
  }, [filteredAndSortedCategories, page]);

  const hasMore =
    paginatedCategories.length < filteredAndSortedCategories.length;

  // 3. The Infinite Scroll Loader
  const loadMoreItems = useCallback(() => {
    if (isFetchingNextPage || !hasMore) return;

    setIsFetchingNextPage(true);

    // Simulate slight network delay for smooth UI transition
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsFetchingNextPage(false);
    }, 400);
  }, [hasMore, isFetchingNextPage]);

  // Elite observer pattern - Decouples useEffect from state dependencies to stop thrashing
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
    categories: paginatedCategories,
    totalResults: filteredAndSortedCategories.length,
    isFetchingNextPage,
    hasMore,
    sentinelRef,
  };
}
