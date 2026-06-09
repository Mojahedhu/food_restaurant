import { Skeleton } from "@/components/ui/skeleton";

export function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-2 py-2">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-2" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
