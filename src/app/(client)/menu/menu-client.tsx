"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FoodWithDetails } from "../../../../types/sanityTypes";
import { useRouter, useSearchParams } from "next/navigation";
import { client } from "@/sanity/lib/client";
import Container from "@/components/common/container";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FoodCardSkeleton from "@/components/common/foodCardSkeleton";
import FoodCards from "@/components/foods/foodCards";

interface MenuClientProps {
  initialFoods: FoodWithDetails[];
  totalCount: number;
}

const FOODS_PER_PAGE = 12;
const MenuClient = ({
  initialFoods,
  totalCount: totalDBCount,
}: MenuClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "latest");
  const [page, setPage] = useState(0);
  const [foods, setFoods] = useState<FoodWithDetails[]>(initialFoods);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialFoods.length >= FOODS_PER_PAGE);
  const [totalCount, setTotalCount] = useState(totalDBCount);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  // Update URL when sort changes
  useEffect(() => {
    const params = new URLSearchParams();

    if (sortBy && sortBy !== "latest") {
      params.set("sort", sortBy);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/menu?${queryString}` : "/menu";

    router.push(newUrl, { scroll: false });
  }, [sortBy, router]);

  // Fetch foods directly from sanity
  const fetchFoods = useCallback(
    async (pageNum: number, isLoadMore: boolean = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const offset = pageNum * FOODS_PER_PAGE;
        const limit = FOODS_PER_PAGE;
        console.log("offset", offset);
        console.log("limit", limit);
        // Simple filter - only available foods
        const filters = '_type == "food" && available == true';

        // Determine sort order
        let orderClause = "_createdAt desc"; // default latest
        if (sortBy === "name-asc") orderClause = "name asc";
        if (sortBy === "name-desc") orderClause = "name desc";
        if (sortBy === "price-low") orderClause = "price asc";
        if (sortBy === "price-high") orderClause = "price desc";

        // Query for foods with pagination - use direct values in slice
        const query = `
          *[${filters}]
          | order(${orderClause})
          [${offset}...${offset + limit}] {
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
            averageRating,
            totalReviews,
            category->{
              _id,
              name,
              "slug": slug.current,
              description
            },
            varieties[]->{
              _id,
              name,
            }
          }
        `;
        // Query for total totalCount
        const countQuery = `count(*[${filters}])`;

        const [data, count] = await Promise.all([
          client.fetch(
            query,
            {},
            { next: { revalidate: 0 }, cache: "no-store" },
          ),
          client.fetch(
            countQuery,
            {},
            { next: { revalidate: 0 }, cache: "no-store" },
          ),
        ]);

        setTotalCount(count);

        if (isLoadMore) {
          setFoods((prev) => [...prev, ...data]);
        } else {
          setFoods(data);
        }

        // Check if there are more foods to load
        setHasMore(offset + data.length < count);
      } catch (error) {
        console.error("Error fetching foods:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [sortBy],
  );

  // Fetch data when sort changes [skip initial load unless sort change]
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      // Only fetch if sort changed from default
      if (sortBy !== "latest") {
        isFetchingRef.current = false;
        setPage(0);

        fetchFoods(0, false);
      }
      return;
    }
    // When sort changes, reset and fetch from beginning
    isFetchingRef.current = false;
    setPage(0);

    fetchFoods(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  // Load more Items - start from page 1 since initialFoods is page 0,
  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      setPage((prev) => {
        const nextPage = prev + 1;
        fetchFoods(nextPage, true);
        return nextPage;
      });
    }
  }, [hasMore, isLoadingMore, fetchFoods]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isLoading
        ) {
          loadMore();
        }
      },
      {
        rootMargin: "200px",
        threshold: 0,
      },
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current?.disconnect();
      }
    };
  }, [loadMore, hasMore, isLoadingMore, isLoading]);

  return (
    <>
      {/* Page Header */}
      <div className="border-b bg-muted">
        <Container className="py-8">
          <h1 className="mb-2 text-3xl font-bold">Our Menu</h1>
          <p className="text-muted-foreground">
            Explore our delicious menu and order your favorite dishes
          </p>
        </Container>
      </div>
      <Container className="py-8">
        {/* Header with count and sort */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-lg font-medium">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </span>
            ) : (
              <span className="text-muted-foreground">
                {foods.length} of {totalCount}{" "}
                {totalCount === 1 ? "item" : "items"}
              </span>
            )}
          </p>
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-muted-foreground">
              Sort by:
            </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Menu grid of four columns */}
        <div className="grid grid-cols-1 sm:grid-cols md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading && page === 0
            ? Array.from({ length: FOODS_PER_PAGE }).map((_, index) => (
                <FoodCardSkeleton key={`skeleton-${index}`} />
              ))
            : foods?.map((food) => <FoodCards key={food._id} food={food} />)}
        </div>
        {/* Loading indicator for infinite scroll */}
        {hasMore && !isLoading && (
          <div ref={loadMoreRef} className="py-20 text-center">
            {isLoadingMore && (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Loading more items...
                </span>
              </div>
            )}
          </div>
        )}
        {/* No results */}
        {!isLoading && foods.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No items found.</p>
          </div>
        )}
      </Container>
    </>
  );
};

export default MenuClient;
