import { useState, useCallback, useRef, useEffect, useTransition } from "react";
import type { PostCard } from "@/../types/sanityTypes";
import { fetchBlogPostsAction } from "@/actions/client-blog";
import { toast } from "sonner";
// Type-only import to prevent Client Components from accidentally running Server files
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useBlogCatalog(
  initialPosts: PostCard[],
  initialTotal: number,
  initialSearch: string,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Internal State Data
  const [posts, setPosts] = useState<PostCard[]>(initialPosts);
  const [totalCount, setTotalCount] = useState<number>(initialTotal);
  // Use a hardcoded fallback since we can't import the value from a Server file without module execution risks
  const ITEMS_PER_PAGE = 8;
  const [hasMore, setHasMore] = useState<boolean>(
    initialPosts.length < initialTotal,
  );

  // 2. Fetching & DOM States
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isPending, startTransition] = useTransition();
  const nextPageToLoad = useRef(2);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 3. Search Input States
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearch);

  // Effect A: Manual Debounce implementation
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Effect B: URL Synchronization
  useEffect(() => {
    if (debouncedSearchTerm !== initialSearch) {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearchTerm) {
          params.set("search", debouncedSearchTerm);
        } else {
          params.delete("search");
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }
  }, [debouncedSearchTerm, initialSearch, pathname, router, searchParams]);

  // Effect C: Infinite Scroll Fetcher
  const loadMoreItems = useCallback(async () => {
    if (isFetchingNextPage || !hasMore || isPending) return;

    setIsFetchingNextPage(true);
    const pageToLoad = nextPageToLoad.current;
    nextPageToLoad.current += 1;

    try {
      const result = await fetchBlogPostsAction({
        page: pageToLoad,
        searchQuery: initialSearch, // We use initialSearch because it always strictly matches the current URL
      });

      if (result.success) {
        setTotalCount(result.totalCount);

        // Strict Immutable Array Updater (Rule 6)
        setPosts((prev) => {
          // Deduplicate items to prevent rendering errors
          const existingIds = new Set(prev.map((p) => p._id));
          const newPosts = result.posts.filter((p) => !existingIds.has(p._id));
          return [...prev, ...newPosts];
        });

        setHasMore(pageToLoad * ITEMS_PER_PAGE < result.totalCount);
      } else {
        toast.error(result.error || "Failed to load posts");
        // Revert page counter on failure
        nextPageToLoad.current = pageToLoad;
      }
    } catch (error) {
      const err = error as Error;
      console.error(err || String(error));
      toast.error("An unexpected error occurred");
      nextPageToLoad.current = pageToLoad;
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [hasMore, initialSearch, isFetchingNextPage, isPending]);

  // Effect D: Intersection Observer Registration
  // Elite Pattern: Capture loadMoreItems in a mutable ref to decouple it from the observer.
  // This completely eliminates "observer thrashing" (the observer constantly destroying and recreating
  // itself whenever isFetchingNextPage or other dependencies change).
  const loadMoreRef = useRef(loadMoreItems);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreRef.current?.();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore]);

  // Synchronize internal state whenever the URL search changes and triggers a Server Component refresh
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosts(initialPosts);
    setTotalCount(initialTotal);
    setHasMore(initialPosts.length < initialTotal);
    nextPageToLoad.current = 2;
  }, [initialPosts, initialTotal, initialSearch]);

  return {
    posts,
    totalCount,
    hasMore,
    isFetchingNextPage,
    isPending,
    searchTerm,
    setSearchTerm,
    sentinelRef, // Exported specifically so the UI component can just attach it and forget it
  };
}
