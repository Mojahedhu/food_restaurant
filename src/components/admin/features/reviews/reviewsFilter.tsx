"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function ReviewFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const rating = searchParams.get("rating") || "all";
  const status = searchParams.get("status") || "all";

  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (search === urlSearch) return;

    const delayDebounce = setTimeout(() => {
      updateUrlParam("search", search);
    }, 400);
    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (search !== urlSearch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch(urlSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleReset = () => {
    setSearch("");
    router.push(pathname);
  };

  const hasActiveFilters =
    search.trim() !== "" || rating !== "all" || status !== "all";

  return (
    <div>
      {/* Control Filter Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between bg-card p-4 rounded-lg border">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search reviews, users, or items..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Selection Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Selection Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Status
            </span>
            <div>
              <Select
                name="status"
                value={status}
                onValueChange={(val) => updateUrlParam("status", val)}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rating Selection Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Rating
            </span>
            <Select
              name="rating"
              value={rating}
              onValueChange={(val) => updateUrlParam("rating", val)}
            >
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stars</SelectItem>
                <SelectItem value="5">5 Stars ★</SelectItem>
                <SelectItem value="4">4 Stars ★</SelectItem>
                <SelectItem value="3">3 Stars ★</SelectItem>
                <SelectItem value="2">2 Stars ★</SelectItem>
                <SelectItem value="1">1 Star ★</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Reset
              </span>
              <Button
                variant="ghost"
                onClick={handleReset}
                className="h-9 px-3 gap-1 hover:text-destructive hover:cursor-pointer"
              >
                <X className="size-4" /> Clear
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewFilter;
