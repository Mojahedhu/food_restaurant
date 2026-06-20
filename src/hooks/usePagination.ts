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
