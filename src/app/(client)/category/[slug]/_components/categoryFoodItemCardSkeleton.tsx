import { Skeleton } from "@/components/ui/skeleton";

function CategoryFoodItemCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Image */}
      <Skeleton className="aspect-square" />

      {/* Content */}
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 rounded mb-3" />

        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

export default CategoryFoodItemCardSkeleton;
