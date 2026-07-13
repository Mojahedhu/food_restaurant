"use client";

import React from "react";
import type { PostCard } from "@/../types/sanityTypes";
import BlogCard from "@/components/featuredPost/blogCard";
import { useSearchParams } from "next/navigation";
import { useBlogCatalog } from "@/hooks/useBlogCatalog";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { BlogGridSkeleton } from "./_components/blogGridSkeleton";

interface BlogClientProps {
  initialPosts: PostCard[];
  initialTotal: number;
}

export default function BlogClient({
  initialPosts,
  initialTotal,
}: BlogClientProps) {
  const ITEMS_PER_PAGE = 8;
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  const {
    posts,
    totalCount,
    hasMore,
    isFetchingNextPage,
    isPending,
    searchTerm,
    setSearchTerm,
    sentinelRef,
  } = useBlogCatalog(initialPosts, initialTotal, currentSearch);

  return (
    <div>
      {/* Search Header */}
      <div className="mb-8 max-w-md relative">
        <div className="relative">
          <Input
            placeholder="Search posts by title, author, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        Showing {posts.length} of {totalCount} posts
      </div>

      {/* Conditional Rendering Logic */}
      {isPending ? (
        <BlogGridSkeleton count={8} />
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No posts found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post, index) => (
            <div
              key={post._id}
              // Rule 5: Fluid Component Transitions
              className="animate-in fade-in zoom-in-95 fill-mode-both duration-500 ease-out"
              style={{
                animationDelay: `${(index % ITEMS_PER_PAGE) * 50}ms`,
              }}
            >
              <BlogCard post={post} />
            </div>
          ))}
        </div>
      )}

      {/* Sentinel Element to trigger loading next page via the Hook's Observer */}
      {hasMore && !isPending && (
        <div ref={sentinelRef} className="py-8 flex justify-center">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-primary font-medium">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading more posts...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
