import { useState, useEffect, useRef } from "react";
import { fetchBlogPostsAction } from "@/actions/client-blog";
import type { PostCard } from "@/../types/sanityTypes";
import { useRouter } from "next/navigation";

export function useBlogSearchAutocomplete(debounceMs = 300) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PostCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const res = await fetchBlogPostsAction({
        page: 1,
        searchQuery: query.trim(),
      });
      if (res.success) {
        // Show up to 5 partial matches
        setResults(res.posts.slice(0, 5));
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
      setIsSearching(false);
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, debounceMs]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowDropdown]);

  const handleSearch = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/blog?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return {
    query,
    setQuery,
    results,
    isSearching,
    showDropdown,
    setShowDropdown,
    handleSearch,
    dropdownRef,
  };
}
