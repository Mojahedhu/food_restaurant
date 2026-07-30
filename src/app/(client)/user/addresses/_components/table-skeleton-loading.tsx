import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function TableSkeletonLoading() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow
      key={`skeleton-${i}`}
      className="hover:border-primary transition-colors"
    >
      {/* Icon */}
      <TableCell className="animate-pulse">
        <div className="h-10 w-10 rounded-full bg-muted"></div>
      </TableCell>

      {/* Type */}
      <TableCell className="animate-pulse">
        <div className="flex flex-col space-y-1">
          <span className="font-medium capitalize flex items-center gap-2">
            <div className="h-4 w-30 rounded bg-muted"></div>
          </span>

          <span className="text-sm text-muted-foreground">
            <div className="h-3 w-10 rounded bg-muted"></div>
          </span>
        </div>
      </TableCell>

      {/* Address */}
      <TableCell className="animate-pulse">
        <div className="max-w-75 text-sm space-y-1">
          <div className="h-4 w-50 rounded bg-muted"></div>
          <div className="h-4 w-20 rounded bg-muted"></div>
        </div>
      </TableCell>

      {/* Phone */}

      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
        <div className="h-4 w-30 rounded bg-muted"></div>
      </TableCell>

      {/* Actions */}

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2 animate-pulse">
          <Button variant={"ghost"} size={"icon"} title="Edit address">
            <div className="h-8 w-8 rounded bg-muted"></div>
          </Button>

          <Button variant={"ghost"} size={"icon"} title="Delete address">
            <div className="h-8 w-8 rounded bg-muted"></div>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ));
}
