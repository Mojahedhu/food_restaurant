import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOption } from "../hooks/useRestaurantsCatalog";

interface RestaurantsFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  uniqueCategories: string[];
  resultsCount: number;
}

export default function RestaurantsFilterBar({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  selectedCategory,
  setSelectedCategory,
  uniqueCategories,
  resultsCount,
}: RestaurantsFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm mb-8">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search restaurants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 w-full bg-background"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        <div className="text-sm text-muted-foreground hidden lg:block mr-2">
          <span className="font-medium text-foreground">{resultsCount}</span>{" "}
          found
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background">
            <SelectValue placeholder="All Cuisines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cuisines</SelectItem>
            {uniqueCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(val) => setSortBy(val as SortOption)}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background">
            <SelectValue placeholder="Sort..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Recommended</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="delivery-time">Fastest Delivery</SelectItem>
            <SelectItem value="delivery-fee">Lowest Fee</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
