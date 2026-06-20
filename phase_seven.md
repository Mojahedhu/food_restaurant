# Phase 7: Orders Search, Filtering, and Sorting

This phase implements robust, URL-driven searching, filtering, and sorting for the Orders page. It updates the server-side GROQ queries to dynamically filter results and adds search/filter inputs and sortable table headers.

---

## User Review Required

> [!IMPORTANT]
> All search, filter, and sorting states will be **URL-driven** (e.g., `?search=john&orderStatus=status-preparing&sortBy=total&sortOrder=desc`).
> This aligns with standard Next.js App Router design patterns:
>
> 1. Admins can bookmark filtered views (e.g. bookmarked link for all preparing orders).
> 2. Back/Forward buttons in the browser behave correctly.
> 3. Server-side rendering (SSR) fetches the pre-filtered slice immediately on initial page load.

---

## Proposed Changes

### 1. Update Server Actions (`src/actions/admin-orders.ts`)

Modify the paged fetching action to build a dynamic GROQ filter string and sort clause based on the search term, statuses, and sort parameters.

```typescript
// Add to src/actions/admin-orders.ts

interface FetchOrdersParams {
  page: number;
  pageSize: number;
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
  sortBy?: string;
  sortOrder?: string;
}

export async function fetchAdminOrdersPaged({
  page,
  pageSize,
  search = "",
  orderStatus = "",
  paymentStatus = "",
  sortBy = "date",
  sortOrder = "desc",
}: FetchOrdersParams): Promise<{ totalItems: number; orders: OrderSummary[] }> {
  try {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    // 1. Build dynamic filters
    let filterClauses = `_type == "order"`;
    const params: Record<string, number> = { start, end };

    if (search.trim()) {
      filterClauses += ` && (userName match $search || userEmail match $search || orderNumber match $search)`;
      params.search = `*${search.trim()}*`;
    }

    if (orderStatus && orderStatus !== "all") {
      filterClauses += ` && status._ref == $orderStatus`;
      params.orderStatus = orderStatus;
    }

    if (paymentStatus && paymentStatus !== "all") {
      filterClauses += ` && paymentStatus == $paymentStatus`;
      params.paymentStatus = paymentStatus;
    }

    // 2. Build sorting clause
    let sortClause = `_createdAt desc`;
    if (sortBy === "total") {
      sortClause = `total ${sortOrder === "asc" ? "asc" : "desc"}`;
    } else if (sortBy === "date") {
      sortClause = `_createdAt ${sortOrder === "asc" ? "asc" : "desc"}`;
    }

    const countQuery = groq`count(*[${filterClauses}])`;
    const dataQuery = groq`
      *[${filterClauses}] | order(${sortClause}) {
        _id,
        _createdAt,
        orderNumber,
        status,
        total,
        paymentStatus,
        userName,
        userEmail,
        items
      }[$start...$end]
    `;

    const [{ data: totalItems }, { data: orders }] = await Promise.all([
      sanityFetch({ query: countQuery, params, tags: ["orders"] }),
      sanityFetch({ query: dataQuery, params, tags: ["orders"] }),
    ]);

    return {
      totalItems: totalItems as number,
      orders: orders as OrderSummary[],
    };
  } catch (error) {
    console.error("Failed to fetch filtered admin orders:", error);
    return { totalItems: 0, orders: [] };
  }
}
```

---

### 2. Create the Filter Bar Component (`src/components/admin/features/orders/ordersFilterBar.tsx`)

Create a filter bar component containing a debounced search input, select dropdowns for statuses, and a clear button.

```tsx
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
      updateUrlParam("search", search);
    }, 400);

    return () => clearTimeout(delayDebounce);
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
```

---

### 3. Add Header Click sorting to `OrdersTable`

Make column headers sortable by adding router triggers to [ordersTable.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/orders/ordersTable.tsx).

```tsx
// Inside src/components/admin/features/orders/ordersTable.tsx
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

// Add inside OrdersTable component:
const router = useRouter();
const pathname = usePathname();
const searchParams = useSearchParams();

const currentSortBy = searchParams.get("sortBy") || "date";
const currentSortOrder = searchParams.get("sortOrder") || "desc";

const handleSort = (field: string) => {
  const params = new URLSearchParams(searchParams.toString());

  if (currentSortBy === field) {
    // Toggle sort order
    params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc");
  } else {
    // Default to desc on new field
    params.set("sortBy", field);
    params.set("sortOrder", "desc");
  }

  router.push(`${pathname}?${params.toString()}`);
};

const renderSortIcon = (field: string) => {
  if (currentSortBy !== field)
    return <ArrowUpDown className="ml-1 size-3 opacity-50" />;
  return currentSortOrder === "asc" ? (
    <ArrowUp className="ml-1 size-3 text-primary" />
  ) : (
    <ArrowDown className="ml-1 size-3 text-primary" />
  );
};
```

Update headers inside rendering block:

```tsx
<TableHead
  className="font-medium cursor-pointer select-none hover:text-primary transition-colors"
  onClick={() => handleSort("date")}
>
  <div className="flex items-center">
    Date {renderSortIcon("date")}
  </div>
</TableHead>

<TableHead
  className="font-medium cursor-pointer select-none hover:text-primary transition-colors"
  onClick={() => handleSort("total")}
>
  <div className="flex items-center">
    Total {renderSortIcon("total")}
  </div>
</TableHead>
```

---

### 4. Connect page.tsx search parameters

Map all route parameters to the data fetching query.

```tsx
// Inside src/app/admin/orders/page.tsx

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    orderStatus?: string;
    paymentStatus?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  const currentPage = Number(resolvedParams.page || "1");
  const search = resolvedParams.search || "";
  const orderStatus = resolvedParams.orderStatus || "";
  const paymentStatus = resolvedParams.paymentStatus || "";
  const sortBy = resolvedParams.sortBy || "date";
  const sortOrder = resolvedParams.sortOrder || "desc";

  const pageSize = 10;

  const { totalItems, orders } = await fetchAdminOrdersPaged({
    page: currentPage,
    pageSize,
    search,
    orderStatus,
    paymentStatus,
    sortBy,
    sortOrder,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Orders
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your recent orders, update statuses, and view details.
        </p>
      </div>

      {/* Filter Bar */}
      <OrdersFilterBar />

      {/* Table & Pagination */}
      <div className="bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden p-6">
        <Suspense fallback={<OrdersTableSkeleton />}>
          <OrdersTable initialOrders={orders} />
          <PaginationControls
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
          />
        </Suspense>
      </div>
    </div>
  );
}
```

---

## Verification Plan

### Automated Checks

- Run `pnpm tsc --noEmit` to ensure TypeScript compilation passes.

### Manual Scenarios

1. **Search**: Type `"Guest"` in search bar; check that results filter automatically after typing pause.
2. **Filter**: Select `"Preparing"` order status; check that only preparing orders are displayed.
3. **Sort**: Click the `"Total"` column header; confirm sorting changes from descending to ascending.
4. **Reset**: Click `"Clear"` to clear all filters.
