// src/app/admin/products/_components/productsTableSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProductsTableSkeleton() {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="w-[80px] pl-4">
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead className="text-right w-[80px] pr-4">
              <Skeleton className="h-4 w-12 ml-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, idx) => (
            <TableRow key={idx} className="border-b last:border-b-0">
              {/* Image Skeleton */}
              <TableCell className="pl-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
              </TableCell>

              {/* Name Skeleton */}
              <TableCell>
                <Skeleton className="h-5 w-44" />
              </TableCell>

              {/* Category Skeleton */}
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>

              {/* Price Skeleton */}
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>

              {/* Status Switch & Badge Skeletons */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-11 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </TableCell>

              {/* Action Button Skeleton */}
              <TableCell className="text-right pr-4">
                <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
