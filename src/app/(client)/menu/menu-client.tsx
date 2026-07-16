"use client";
import { FoodWithDetails } from "../../../../types/sanityTypes";
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
import { useMenuCatalog } from "@/hooks/useMenuCatalog";
import { SortOption } from "@/lib/data/menu";

interface MenuClientProps {
  initialFoods: FoodWithDetails[];
  totalCount: number;
  initialSort: SortOption;
}

const FOODS_PER_PAGE = 12;
const MenuClient = ({
  initialFoods,
  totalCount: totalDBCount,
  initialSort,
}: MenuClientProps) => {
  // Rule 7: Pure UI Delegation
  const {
    foods,
    totalCount,
    sortBy,
    setSortBy,
    isSortPending,
    isFetchingNextPage,
    hasMore,
    sentinelRef,
  } = useMenuCatalog(initialFoods, totalDBCount, initialSort);

  // Rule 4: Total Map Safety Guard
  const safeFoods = foods || [];

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
            {isSortPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">
                  Updating catalog...
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">
                {safeFoods.length} of {totalCount}{" "}
                {totalCount === 1 ? "item" : "items"}
              </span>
            )}
          </p>
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-muted-foreground">
              Sort by:
            </label>
            <Select
              value={sortBy}
              onValueChange={setSortBy}
              disabled={isSortPending}
            >
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
          {/* Rule 5: Explicit Loading Skeletons */}
          {isSortPending
            ? Array.from({ length: FOODS_PER_PAGE }).map((_, index) => (
                <FoodCardSkeleton key={`skeleton-${index}`} />
              ))
            : foods?.map((food, index) => (
                <div
                  key={food._id}
                  // Rule 5: Fluid Component Transitions
                  className="h-full animate-in fade-in zoom-in-95 fill-mode-both duration-500 ease-out"
                  style={{
                    animationDelay: `${(index % FOODS_PER_PAGE) * 50}ms`,
                  }}
                >
                  <FoodCards food={food} />
                </div>
              ))}
        </div>
        {/* Loading indicator for infinite scroll */}
        {/* Rule 5: Infinite Scroll Exception Guard Sentinel */}
        {hasMore && !isSortPending && (
          <div ref={sentinelRef} className="py-20 text-center">
            <div
              className={`flex items-center justify-center gap-2 transition-opacity duration-300 ${isFetchingNextPage ? "opacity-100" : "opacity-0"}`}
            >
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Loading more items...
              </span>
            </div>
          </div>
        )}
        {/* No results */}
        {!isSortPending && safeFoods.length === 0 && (
          <div className="py-20 text-center border border-dashed rounded-lg bg-muted/20">
            <p className="text-muted-foreground text-lg mb-2">
              No items found.
            </p>
            <p className="text-sm text-muted-foreground/75">
              Try adjusting your sort filters.
            </p>
          </div>
        )}
      </Container>
    </>
  );
};

export default MenuClient;
