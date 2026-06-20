# Pagination Strategy & Core Hooks Blueprint

This document details the best-practice pagination strategy for the Quick Food project. It covers pure range mathematics, URL search synchronization, and GROQ query slicing, complete with fully typed custom hooks.

---

## 1. Core Logic Hook (`src/hooks/usePaginationRange.ts`)

This hook manages the pure visual math required to render pagination items and insert ellipsis markers (`DOTS`) dynamically.

```typescript
// src/hooks/usePaginationRange.ts
import { useMemo } from "react";

export const DOTS = "DOTS" as const;
export type PaginationItem = number | typeof DOTS;

export interface UsePaginationRangeProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  siblingCount?: number;
}

/**
 * Generates an array of page numbers and ellipsis markers to render in the UI.
 * E.g., [1, "DOTS", 4, 5, 6, "DOTS", 10]
 */
export function usePaginationRange({
  totalItems,
  pageSize,
  currentPage,
  siblingCount = 1,
}: UsePaginationRangeProps): PaginationItem[] {
  return useMemo(() => {
    const totalPageCount = Math.ceil(totalItems / pageSize);

    // Minimum pages to show before introducing ellipses:
    // First page + Last page + Active page + 2 * siblings + 2 * dots
    const totalPageNumbersToShow = siblingCount + 5;

    // Case 1: Total pages fits within pagination window (no dots needed)
    if (totalPageNumbersToShow >= totalPageCount) {
      return generateRange(1, totalPageCount);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount,
    );

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    // Case 2: Only right dots showing
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = generateRange(1, leftItemCount);
      return [...leftRange, DOTS, totalPageCount];
    }

    // Case 3: Only left dots showing
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = generateRange(
        totalPageCount - rightItemCount + 1,
        totalPageCount,
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Case 4: Both left and right dots showing
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = generateRange(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return [];
  }, [totalItems, pageSize, currentPage, siblingCount]);
}

function generateRange(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
}
```

---

## 2. State & Data Layer Adapter Hook (`src/hooks/usePagination.ts`)

This hook takes your active page settings and generates offsets required by standard SQL databases (`limit`/`skip`) as well as Sanity's GROQ slicing parameters (`start`/`end`).

```typescript
// src/hooks/usePagination.ts
import { usePaginationRange, PaginationItem } from "./usePaginationRange";

export interface UsePaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize?: number;
  siblingCount?: number;
}

export interface UsePaginationResult {
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  paginationRange: PaginationItem[];
  // Offset parameters (e.g., standard SQL / REST API)
  offsets: {
    limit: number;
    skip: number;
  };
  // GROQ slicing limits (e.g., *[_type == "order"][start...end])
  groqRange: {
    start: number;
    end: number;
  };
}

export function usePagination({
  totalItems,
  currentPage,
  pageSize = 10,
  siblingCount = 1,
}: UsePaginationProps): UsePaginationResult {
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const activePage = Math.min(Math.max(currentPage, 1), totalPages);

  // 1. Generate UI range
  const paginationRange = usePaginationRange({
    totalItems,
    pageSize,
    currentPage: activePage,
    siblingCount,
  });

  // 2. Compute range slicing boundaries
  const limit = pageSize;
  const skip = (activePage - 1) * pageSize;

  const start = skip;
  // GROQ [start...end] slice is exclusive of the end index:
  // E.g., [0...10] returns indices 0-9 (10 items)
  const end = skip + pageSize;

  return {
    totalPages,
    hasPrevPage: activePage > 1,
    hasNextPage: activePage < totalPages,
    paginationRange,
    offsets: { limit, skip },
    groqRange: { start, end },
  };
}
```

---

## 3. Integration Patterns

### Pattern A: GROQ Query Fetching (Sanity API)

```typescript
// src/actions/admin-orders.ts
import { writeClient } from "@/sanity/lib/client";
import { groq } from "next-sanity";

interface FetchOrdersParams {
  page: number;
  pageSize: number;
}

export async function fetchAdminOrdersPaged({
  page,
  pageSize,
}: FetchOrdersParams) {
  try {
    // 1. Calculate offset parameters
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    // 2. Fetch the total count of documents in parallel
    const countQuery = groq`count(*[_type == "order"])`;
    const dataQuery = groq`
      *[_type == "order"] | order(_createdAt desc) {
        _id,
        _createdAt,
        orderNumber,
        total,
        paymentStatus
      }[$start...$end]
    `;

    const [totalItems, orders] = await Promise.all([
      writeClient.fetch<number>(countQuery),
      writeClient.fetch<any[]>(dataQuery, { start, end }),
    ]);

    return {
      totalItems,
      orders,
    };
  } catch (error) {
    console.error("Failed to fetch page:", error);
    return { totalItems: 0, orders: [] };
  }
}
```

### Pattern B: URL-Driven Next.js Page Integration

We use the URL query parameters (`?page=`) as the single source of truth.

```tsx
// src/app/admin/orders/page.tsx
import { fetchAdminOrdersPaged } from "@/actions/admin-orders";
import { OrdersTable } from "@/components/admin/features/orders/ordersTable";
import { PaginationControls } from "@/components/admin/features/orders/paginationControls";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page || "1");
  const pageSize = 10;

  // Fetch page data from server action
  const { totalItems, orders } = await fetchAdminOrdersPaged({
    page: currentPage,
    pageSize,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Orders</h1>
      <OrdersTable initialOrders={orders} />
      <PaginationControls
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
}
```

### Pattern C: Declarative UI Pagination Controls

```tsx
// src/components/admin/features/orders/paginationControls.tsx
"use client";

import { usePagination, DOTS } from "@/hooks/usePagination";
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

  // Instantiate the pagination helper hook
  const { totalPages, hasPrevPage, hasNextPage, paginationRange } =
    usePagination({
      totalItems,
      currentPage,
      pageSize,
    });

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6 rounded-xl shadow-sm">
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
          {/* Previous Page Button */}
          <Button
            variant="outline"
            size="icon"
            disabled={!hasPrevPage}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>

          {/* Page Number Sequence */}
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
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}

          {/* Next Page Button */}
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
