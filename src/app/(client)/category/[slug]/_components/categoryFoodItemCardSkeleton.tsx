import { Skeleton } from "@/components/ui/skeleton";

function CategoryFoodItemCardSkeleton() {
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl border border-border bg-card">
      {/* Image */}
      <Skeleton className="aspect-square w-full rounded-none bg-muted/50" />

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <Skeleton className="h-6 w-3/4 rounded-md mb-3 bg-muted/50" />

        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-full rounded bg-muted/40" />
          <Skeleton className="h-4 w-2/3 rounded bg-muted/40" />
        </div>

        <div className="mt-auto pt-4 border-t border-border/50 flex flex-col gap-2">
          <Skeleton className="h-7 w-24 rounded-md bg-muted/50" />
          <Skeleton className="h-3 w-16 rounded-md bg-muted/40" />
        </div>
      </div>
    </div>
  );
}

export default CategoryFoodItemCardSkeleton;
