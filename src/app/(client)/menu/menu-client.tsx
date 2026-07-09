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

interface MenuClientProps {
  initialFoods: FoodWithDetails[];
  totalCount: number;
}

const FOODS_PER_PAGE = 12;
const MenuClient = ({
  initialFoods,
  totalCount: totalDBCount,
}: MenuClientProps) => {
  const {
    page,
    foods,
    totalCount,
    sortBy,
    setSortBy,
    isLoading,
    hasMore,
    sentinelRef,
  } = useMenuCatalog(initialFoods, totalDBCount);

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
            : foods?.map((food, index) => (
                <div
                  key={food._id}
                  className="animate-in fade-in zoom-in-95 fill-mode-both duration-500 ease-out"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <FoodCards food={food} />
                </div>
              ))}
        </div>
        {/* Loading indicator for infinite scroll */}
        {hasMore && (
          <div ref={sentinelRef} className="py-20 text-center">
            {isLoading && (
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
