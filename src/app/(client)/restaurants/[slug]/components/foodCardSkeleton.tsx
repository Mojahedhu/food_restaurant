import { Skeleton } from "@/components/ui/skeleton";

export function FoodCardSkeleton() {
  return (
    <div className="group">
      {/* Image */}
      <Skeleton className="w-full h-56 rounded-lg" />

      {/* Content */}
      <div className="py-3 space-y-3">
        <Skeleton className="h-3 w-20" />

        <Skeleton className="h-6 w-40" />

        <div className="flex gap-2 items-center">
          <Skeleton className="h-4 w-24" />
        </div>

        <Skeleton className="h-5 w-16" />

        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
