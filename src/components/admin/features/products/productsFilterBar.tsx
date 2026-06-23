// src/components/admin/features/products/productsFilterBar.tsx
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
import { CreateCategoryDialog } from "./createCategoryDialog";

interface ProductsFilterBarProps {
  categories: Array<{ _id: string; name: string }>;
}

export function ProductsFilterBar({ categories }: ProductsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for search typing to support debouncing
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const category = searchParams.get("category") || "all";
  const available = searchParams.get("available") || "all";

  // Debounce search typing
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      // eslint-disable-next-line react-hooks/immutability
      updateUrlParam("search", search);
    }, 400);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Sync local search state with external URL search changes (e.g. clicking clear)
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
    params.set("page", "1"); // Always reset page to 1 when filters change

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    router.push(pathname); // Clears all search queries and resets path
  };

  const hasActiveFilters =
    search.trim() !== "" || category !== "all" || available !== "all";

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border">
      {/* Search Input field */}
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search food items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4"
        />
      </div>

      {/* Select Dropdowns & Category Creator */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Dynamic Category Selector */}
        <Select
          value={category}
          onValueChange={(val) => updateUrlParam("category", val)}
        >
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(categories || []).map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Availability Status Selector */}
        <Select
          value={available}
          onValueChange={(val) => updateUrlParam("available", val)}
        >
          <SelectTrigger className="w-[150px] bg-background">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="true">Available</SelectItem>
            <SelectItem value="false">Unavailable</SelectItem>
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

        {/* Mount Category Seeding / Creation dialog */}
        <CreateCategoryDialog />
      </div>
    </div>
  );
}
