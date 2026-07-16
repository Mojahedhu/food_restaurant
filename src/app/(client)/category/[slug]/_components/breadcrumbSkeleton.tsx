import { Skeleton } from "@/components/ui/skeleton";

export function BreadcrumbSkeleton() {
  return (
    <div className="py-3 border-b border-border bg-muted/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-2 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-2 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}
