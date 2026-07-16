import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOption } from "../hooks/useCategoriesCatalog";

interface CategoriesFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
  resultsCount: number;
}

export default function CategoriesFilterBar({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  resultsCount,
}: CategoriesFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
      {/* Live Search Input */}
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 w-full bg-background"
        />
      </div>

      {/* Meta Counter & Sorting Dropdown */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        <div className="text-sm text-muted-foreground hidden sm:block">
          Showing{" "}
          <span className="font-medium text-foreground">{resultsCount}</span>{" "}
          results
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="sort-select"
            className="text-sm text-muted-foreground whitespace-nowrap"
          >
            Sort by:
          </label>
          <Select
            value={sortBy}
            onValueChange={(val) => setSortBy(val as SortOption)}
          >
            <SelectTrigger id="sort-select" className="w-[160px] bg-background">
              <SelectValue placeholder="Sort..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest Added</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="items-high">Most Items</SelectItem>
              <SelectItem value="items-low">Fewest Items</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
