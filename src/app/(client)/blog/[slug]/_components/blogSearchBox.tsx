"use client";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, Loader2, Search } from "lucide-react";
import { useBlogSearchAutocomplete } from "@/hooks/useBlogSearchAutocomplete";
import Link from "next/link";
import { dateFormatter } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";

function BlogSearchBox() {
  const {
    query,
    setQuery,
    results,
    isSearching,
    showDropdown,
    setShowDropdown,
    dropdownRef,
    handleSearch,
  } = useBlogSearchAutocomplete();

  return (
    <div
      ref={dropdownRef}
      className="relative bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    >
      <h3 className="font-bold text-lg mb-4 border-l-4 border-primary pl-3">
        Search
      </h3>
      <form className="flex gap-2" onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim()) setShowDropdown(true);
          }}
          className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50"
          placeholder="Search recipes..."
        />

        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 size-9"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Autocomplete Dropdown */}
      {isSearching ? (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-center p-4">
            <Loader2 className="size-7 animate-spin text-muted-foreground" />
          </div>
        </div>
      ) : (
        showDropdown &&
        results.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
            <ul className="max-h-96 overflow-y-auto py-2">
              {results.map((post) => {
                const imageUrl = post.mainImage
                  ? urlFor(post.mainImage).width(100).height(100).url()
                  : "/window.svg";
                // eslint-disable-next-line react-hooks/purity
                const randomLove = Math.floor(Math.random() * 150);
                return (
                  <li key={post.slug?.current || post._id}>
                    <Link
                      href={`/blog/${post.slug?.current}`}
                      className="flex gap-4 items-center px-4 py-3 hover:bg-gray-200 transition-colors border-b border-gray-50 last:border-0 rounded-lg m-1"
                      onClick={() => setShowDropdown(false)}
                    >
                      {/* Main Image Thumbnail */}
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0 bg-gray-100 shadow-sm border border-gray-200/50">
                        <Image
                          src={imageUrl}
                          alt={post.title || "post-img"}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Content & Smart Icons */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-sm line-clamp-1 mb-1.5">
                          {post.title}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-500">
                          {post.publishedAt && (
                            <div className="flex items-center gap-1 font-medium">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              <span>{dateFormatter(post.publishedAt)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full font-semibold border border-rose-100/50">
                            <Heart className="h-3.5 w-3.5 fill-rose-500" />
                            <span>{randomLove}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )
      )}
      {showDropdown && !isSearching && query.trim() && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-50 p-4 text-center text-sm text-gray-500">
          No articles found.
        </div>
      )}
    </div>
  );
}

export default BlogSearchBox;
