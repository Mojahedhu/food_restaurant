# Admin Dashboard Implementation Plan

This document outlines the architectural recommendation and the integration plan for **Phase 6: Orders Pagination Integration** for the Quick Food admin dashboard.

---

## User Review Required

> [!NOTE]
> We recommend **Option A: Implement Pagination for Orders First** over Option B (scaffolding the other dashboard modules).
> Completing pagination for Orders creates a robust **"Golden Standard"** component template. Once this pattern is fully working, it becomes a simple copy-and-paste design to roll out to Users, Products, and Reviews. Doing it horizontally first would duplicate the pagination integration effort across multiple pages, resulting in more code churn and potential bugs.

---

## 1. Architectural Strategy: Option A vs. Option B

| Strategy                                               | Pros                                                                                                                                                                                                                                 | Cons                                                                                                                    | Recommendation       |
| :----------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :------------------- |
| **Option A: Orders Pagination First (Vertical Slice)** | • Establishes a complete, production-ready "Golden Standard" design system.<br>• Resolves all hook integrations and URL synchronization bugs in a single, simple scope.<br>• Prevents duplicate refactoring of multiple pages later. | • Horizontal dashboard modules (Users, Products, Reviews) remain placeholders in the meantime.                          | **★ Recommended**    |
| **Option B: Horizontal Dashboard Expansion**           | • Provides immediate visibility of other routes (Products, Users, Reviews).                                                                                                                                                          | • Introduces unpaginated tables fetching large datasets.<br>• Duplicates pagination wiring effort across 4 pages later. | Not recommended yet. |

---

## 2. Phase 6: Orders Pagination Integration

This phase integrates the pagination hooks (`usePagination` and `usePaginationRange`) directly into the Orders Page, the Sanity fetching actions, and a new custom UI control.

### Proposed Changes

#### [MODIFY] [admin-orders.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-orders.ts)

Add a server action `fetchAdminOrdersPaged` that queries both the total count and the sliced items in parallel using GROQ.

```typescript
// src/actions/admin-orders.ts
// Add this interface and function to handle paged queries

interface FetchOrdersParams {
  page: number;
  pageSize: number;
}

export async function fetchAdminOrdersPaged({
  page,
  pageSize,
}: FetchOrdersParams): Promise<{ totalItems: number; orders: OrderSummary[] }> {
  try {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const countQuery = groq`count(*[_type == "order"])`;
    const dataQuery = groq`
      *[_type == "order"] | order(_createdAt desc) {
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

    // Fetch count and page content in parallel
    const [totalItems, orders] = await Promise.all([
      client.fetch<number>(countQuery),
      client.fetch<any[]>(dataQuery, { start, end }),
    ]);

    return {
      totalItems,
      orders: orders as OrderSummary[],
    };
  } catch (error) {
    console.error("Failed to fetch paged admin orders:", error);
    return { totalItems: 0, orders: [] };
  }
}
```

#### [NEW] [paginationControls.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/orders/paginationControls.tsx)

Build a responsive client-side pagination UI component that handles page change navigation by pushing new page query parameters to the URL Router.

```tsx
"use client";

import { usePagination } from "@/hooks/usePagination";
import { DOTS } from "@/hooks/usePaginationRange";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
}

export function PaginationControls({
  totalItems,
  currentPage,
  pageSize,
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { totalPages, hasPrevPage, hasNextPage, paginationRange } =
    usePagination({
      totalItems,
      currentPage,
      pageSize,
    });

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6 rounded-xl shadow-sm mt-4">
      {/* Mobile view */}
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          disabled={!hasPrevPage}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={!hasNextPage}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing Page{" "}
            <span className="font-semibold text-foreground">{currentPage}</span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={!hasPrevPage}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>

          {paginationRange.map((pageNumber, index) => {
            if (pageNumber === DOTS) {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-3 py-2 text-sm text-muted-foreground select-none"
                >
                  &#8230;
                </span>
              );
            }

            return (
              <Button
                key={pageNumber}
                variant={pageNumber === currentPage ? "default" : "outline"}
                className="size-9"
                onClick={() => handlePageChange(pageNumber as number)}
              >
                {pageNumber}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="icon"
            disabled={!hasNextPage}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

#### [MODIFY] [page.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/app/admin/orders/page.tsx)

Read search params, parse `page`, call `fetchAdminOrdersPaged`, and mount the pagination control below the orders table.

```tsx
import { Suspense } from "react";
import { fetchAdminOrdersPaged } from "@/actions/admin-orders";
import OrdersTableSkeleton from "./_components/ordersTableSkeleton";
import { OrdersTable } from "@/components/admin/features/orders/ordersTable";
import { PaginationControls } from "@/components/admin/features/orders/paginationControls";

export const metadata = {
  title: "Admin | Orders Management",
  description: "Manage and update customer orders.",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page || "1");
  const pageSize = 10;

  const { totalItems, orders } = await fetchAdminOrdersPaged({
    page: currentPage,
    pageSize,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your recent orders, update statuses, and view details.
          </p>
        </div>
      </div>

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

## 3. Verification Plan

### Automated Tests

Verify typescript and compile soundness of the updated files:

- Run `npm run build` or `npx tsc --noEmit` to ensure type safety.

### Manual Verification

1. Open the `/admin/orders` page.
2. Confirm the page loads the first 10 items.
3. Click "Next" or specific page buttons to verify navigation.
4. Verify the URL query parameter updates to `?page=2`.
5. Ensure the table updates to show the next slice of orders.
