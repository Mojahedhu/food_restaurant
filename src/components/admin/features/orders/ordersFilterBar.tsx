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

export function OrdersFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const orderStatus = searchParams.get("orderStatus") || "all";
  const paymentStatus = searchParams.get("paymentStatus") || "all";

  // Debounce search typing
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      // eslint-disable-next-line react-hooks/immutability
      updateUrlParam("search", search);
    }, 400);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset to page 1 on filter change
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    router.push(pathname); // Clear all search queries
  };

  const hasActiveFilters =
    search || orderStatus !== "all" || paymentStatus !== "all";

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border">
      {/* Search Input */}
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer name, email, or order number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4"
        />
      </div>

      {/* Select Dropdowns */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <Select
          value={orderStatus}
          onValueChange={(val) => updateUrlParam("orderStatus", val)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="status-placed">Placed</SelectItem>
            <SelectItem value="status-confirmed">Confirmed</SelectItem>
            <SelectItem value="status-preparing">Preparing</SelectItem>
            <SelectItem value="status-out-for-delivery">
              Out for Delivery
            </SelectItem>
            <SelectItem value="status-delivered">Delivered</SelectItem>
            <SelectItem value="status-cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentStatus}
          onValueChange={(val) => updateUrlParam("paymentStatus", val)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-9 px-3 gap-1"
          >
            <X className="size-4" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
