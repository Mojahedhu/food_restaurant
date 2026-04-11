"use client";
import { useEffect, useState } from "react";
import { FoodWithCategory } from "../../../types/sanityTypes";
import { client } from "@/sanity/lib/client";
import { FEATURED_FOODS_SEARCH_QUERY, SEARCH_FOODS_QUERY } from "@/lib/query";
import { ArrowRight, Search, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
interface SearchModelProps {
  isSearchOpen: boolean;
  onClose: () => void;
}

const SearchSkeleton = () => (
  <div className="space-y-3">
    {[...Array(6)].map((_, i) => [
      <div
        key={i}
        className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 animate-pulse"
      >
        <div className="w-10 h-10 rounded-full bg-muted-foreground/20 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
          <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
        </div>
        <div className="w-8 h-8 rounded-full bg-muted-foreground/20 shrink-0" />
      </div>,
    ])}
  </div>
);

const SearchModel = ({ isSearchOpen, onClose }: SearchModelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodWithCategory[]>([]);
  const [featuredItems, setFeaturedItems] = useState<FoodWithCategory[]>([]);

  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Close modal on escape key
  useEffect(() => {
    if (!isSearchOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (!isSearchOpen) return;
      if (e.key === "Escape") {
        onClose();
      }
    };
    const originalOverflow = document.body.style.overflow;

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [isSearchOpen, onClose]);

  // A search function with debounce
  const searchFoods = async (query: string) => {
    if (!query.trim()) {
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(false);
    try {
      const results = await client.fetch<FoodWithCategory[]>(
        SEARCH_FOODS_QUERY,
        { query } as Record<string, unknown>,
      );
      setSearchResults(results);
    } catch (error) {
      console.log("Search Errors", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  // Debounced Search
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(false);

    const timer = setTimeout(() => {
      searchFoods(trimmedQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch featured items when modal opens
  useEffect(() => {
    const fetchFeaturedItems = async () => {
      if (isSearchOpen && featuredItems.length === 0) {
        setIsLoadingFeatured(true);
        try {
          const result = await client.fetch<FoodWithCategory[]>(
            FEATURED_FOODS_SEARCH_QUERY,
            {},
          );
          setFeaturedItems(result);
        } catch (error) {
          console.error("Error fetching featured items:", error);
        } finally {
          setIsLoadingFeatured(false);
        }
      }
      setIsSearching(false);
      setHasSearched(false);
    };
    fetchFeaturedItems();
  }, [featuredItems.length, isSearchOpen]);

  // Rest on Close
  useEffect(() => {
    if (!isSearchOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;
  const FeaturedItemsView = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Featured Items
        </h3>
        <div className="space-y-2">
          {featuredItems.map((food) => (
            <Link
              key={food._id}
              href={`/food/${food.slug}`}
              onClick={onClose}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-all group"
            >
              {/* Search Icon */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Search className="w-5 h-5 text-primary" />
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {food.name}
                </h3>
                {food.category && (
                  <p className="text-xs text-muted-foreground">
                    {food.category.name}
                  </p>
                )}
              </div>

              {/* Arrow Button */}
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const SearchResultsView = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Found {searchResults.length} result
          {searchResults.length !== 1 ? "s" : ""}
        </h3>
        <div className="space-y-3">
          {searchResults.map((food) => (
            <Link
              key={food._id}
              href={`/food/${food.slug}`}
              onClick={onClose}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-all group"
            >
              {/* Image */}
              <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                {food.images && food.images.length > 0 && food.images[0] ? (
                  <Image
                    src={urlFor(food.images[0]).url()}
                    alt={food.name || "Food item"}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Search className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {food.name}
                </h3>
                {food.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {food.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {food.category && (
                    <span className="text-xs text-primary">
                      {food.category.name}
                    </span>
                  )}
                  {food.averageRating && (
                    <span className="text-xs text-muted-foreground">
                      ⭐ {food.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-right shrink-0">
                <p className="font-bold text-primary">${food.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm transition-opacity" />
      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
        onClick={onClose}
      >
        <div
          className="bg-card rounded-2xl shadow-2xl w-full max-w-5xl max-h-[80vh] flex flex-col animate-in fade-in  slide-in-from-top-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-4 p-6 border-b">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for food items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-12 py-3 bg-muted/50 border border-muted-foreground/20 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted text-foreground transition-all"
              aria-label="Close Search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Results */}
          <div className="flex-1 overflow-y-auto p-6">
            {isSearching ? (
              <SearchSkeleton />
            ) : searchQuery.trim() === "" ? (
              isLoadingFeatured ? (
                <SearchSkeleton />
              ) : featuredItems.length > 0 ? (
                <FeaturedItemsView />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="w-12 h-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Start typing to search for food
                  </p>
                </div>
              )
            ) : hasSearched && searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">
                  No results found for &quot;
                  <span className="font-semibold text-primary">
                    {searchQuery}
                  </span>
                  &quot;
                </p>
              </div>
            ) : hasSearched && searchResults.length > 0 ? (
              <SearchResultsView />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchModel;
