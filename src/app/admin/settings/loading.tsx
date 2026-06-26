import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SettingsCenterLoading() {
  return (
    <div className="space-y-6">
      {/* Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="h-px bg-border" />

      {/* Filter skeleton */}
      <Skeleton className="h-9 w-64 rounded-lg" />

      {/* Table skeleton */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Restaurant</TableHead>
              <TableHead>Location & Contact</TableHead>
              <TableHead className="w-[120px]">Delivery rules</TableHead>
              <TableHead className="w-[100px] text-center">Featured</TableHead>
              <TableHead className="w-[100px] text-center">
                Order status
              </TableHead>
              <TableHead className="w-[80px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-lg shrink-0" />
                    <div className="space-y-1 w-full">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-12 ml-auto rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
