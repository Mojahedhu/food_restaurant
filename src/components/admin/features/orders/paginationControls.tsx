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
