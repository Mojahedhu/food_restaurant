import { Skeleton } from "@/components/ui/skeleton";

export function BreadcrumbSkeleton() {
  return (
    <div className="border-b border-border bg-muted/10 py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-2 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}
