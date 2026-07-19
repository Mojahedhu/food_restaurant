import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { OrderSummary } from "@/../types/sanityTypes";

interface OrderFiltersProps {
  localSearch: string;
  setLocalSearch: (val: string) => void;
  isPending: boolean;
  statusFilter: string;
  allStatuses: OrderSummary["status"][];
  updateUrlParams: (updates: Record<string, string>) => void;
}

export default function OrderFilters({
  localSearch,
  setLocalSearch,
  isPending,
  statusFilter,
  allStatuses,
  updateUrlParams,
}: OrderFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search order number..."
          className="pl-9 w-full"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>
      <div className="w-full sm:w-[200px]">
        <Select
          value={statusFilter}
          onValueChange={(val) =>
            updateUrlParams({ status: val === "all" ? "" : val, page: "1" })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(allStatuses || []).map((s) =>
              s?.value?.current ? (
                <SelectItem key={s?.value?.current} value={s?.value?.current}>
                  {s?.title}
                </SelectItem>
              ) : null,
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
