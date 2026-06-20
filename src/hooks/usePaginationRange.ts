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
