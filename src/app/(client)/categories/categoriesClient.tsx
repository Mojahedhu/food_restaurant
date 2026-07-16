"use client";

import { CategoryWithCount } from "@/../types/sanityTypes";
import CategoriesHero from "./_components/categoriesHero";
import CategoriesGrid from "./_components/categoriesGrid";
import CategoriesFilterBar from "./_components/categoriesFilterBar";

import { Loader2, UtensilsCrossed } from "lucide-react";
import { useCategoriesCatalog } from "./hooks/useCategoriesCatalog";

interface CategoriesClientProps {
  initialCategories: CategoryWithCount[];
}

export default function CategoriesClient({
  initialCategories,
}: CategoriesClientProps) {
  // Logic completely extracted to a dedicated hook (Rule 7)
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    categories,
    totalResults,
    isFetchingNextPage,
    hasMore,
    sentinelRef,
  } = useCategoriesCatalog(initialCategories);

  return (
    <div className="animate-in fade-in duration-500">
      <CategoriesHero itemCount={initialCategories.length} />

      <div className="container mx-auto px-4 pt-12 pb-4">
        <CategoriesFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          resultsCount={totalResults}
        />
      </div>

      {/* Client-Side Empty State (If search yields 0 results) */}
      {totalResults > 0 ? (
        <>
          <CategoriesGrid categories={categories} />
          {/* Rule 5: Infinite Scroll Exception Guard Sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="py-20 text-center">
              <div
                className={`flex items-center justify-center gap-2 transition-opacity duration-300 ${isFetchingNextPage ? "opacity-100" : "opacity-0"}`}
              >
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Loading more categories...
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="container mx-auto px-4 py-32 text-center animate-in zoom-in-95 duration-300 border border-dashed border-border/50 rounded-2xl bg-muted/10 my-8">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
            <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            No matches found
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We couldn&apos;t find any categories matching &quot;
            <span className="text-foreground font-medium">{searchQuery}</span>
            &quot;. Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}
