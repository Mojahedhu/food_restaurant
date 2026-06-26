"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

export function RestaurantFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for search typing to support debouncing
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const status = searchParams.get("status") || "all";
  const featured = searchParams.get("featured") || "all";

  // Debounce search input updates (400ms delay)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (search === urlSearch) return;

    const delayDebounce = setTimeout(() => {
      const urlSearch = searchParams.get("search") || "";
      if (urlSearch === search) return;
      // eslint-disable-next-line react-hooks/immutability
      updateUrlParam("search", search);
    }, 400);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Sync state if URL query is cleared/changed externally
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (search !== urlSearch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch(urlSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset page to 1 when filters change

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    router.push(pathname);
  };

  const hasActiveFilters =
    search.trim() !== "" || status !== "all" || featured !== "all";

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border">
      {/* Search Input field */}
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search name or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4"
        />
      </div>

      {/* Select Dropdowns */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={(val) => updateUrlParam("status", val)}
        >
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Open / Active</SelectItem>
            <SelectItem value="inactive">Closed / Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Featured Filter */}
        <Select
          value={featured}
          onValueChange={(val) => updateUrlParam("featured", val)}
        >
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Featured</SelectItem>
            <SelectItem value="featured">Featured Only</SelectItem>
            <SelectItem value="standard">Standard Only</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-9 px-3 gap-1 hover:text-destructive"
          >
            <X className="size-4" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
