"use client";
import { Restaurant } from "@/../types/sanityTypes";
import RestaurantCard from "@/components/restaurants/restaurantCard";
import { useRestaurantsCatalog } from "./hooks/useRestaurantsCatalog";
import { useMemo } from "react";
import RestaurantsFilterBar from "./_components/restaurantsFilterBar";
import { Loader2, Utensils } from "lucide-react";

interface RestaurantClientProps {
  initialRestaurants: Restaurant[];
}

function RestaurantsClient({ initialRestaurants }: RestaurantClientProps) {
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedCategory,
    setSelectedCategory,
    restaurants,
    totalResults,
    isFetchingNextPage,
    hasMore,
    sentinelRef,
  } = useRestaurantsCatalog(initialRestaurants);
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    initialRestaurants.forEach((r) => {
      r.categories?.forEach((c) => {
        if (c.name) cats.add(c.name);
      });
    });
    return Array.from(cats).sort();
  }, [initialRestaurants]);
  console.log(initialRestaurants[0].categories);
  return (
    <div className="container mx-auto px-4 animate-in fade-in duration-500">
      <RestaurantsFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        uniqueCategories={uniqueCategories}
        resultsCount={totalResults}
      />
      {totalResults > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.map((restaurant, index) => (
              <div
                key={restaurant._id}
                className="animate-in fade-in zoom-in-95 fill-mode-both duration-500 ease-out"
                style={{ animationDelay: `${(index % 8) * 50}ms` }}
              >
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="py-20 text-center">
              <div
                className={`flex items-center justify-center gap-2 transition-opacity duration-300 ${isFetchingNextPage ? "opacity-100" : "opacity-0"}`}
              >
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Loading more restaurants...
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-32 text-center animate-in zoom-in-95 duration-300 border border-dashed border-border/50 rounded-2xl bg-muted/10 my-8">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
            <Utensils className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            No matches found
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We couldn&apos;t find any restaurants matching your filters. Try
            adjusting your search or cuisine type.
          </p>
        </div>
      )}
    </div>
  );
}

export default RestaurantsClient;
