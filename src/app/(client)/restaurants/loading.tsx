import { Skeleton } from "@/components/ui/skeleton";
import { RestaurantCardSkeleton } from "./_components/restaurantCardSkeleton";
import { BreadcrumbSkeleton } from "./_components/breadcrumbSkeleton";

export default function RestaurantsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 pb-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <BreadcrumbSkeleton />
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-10 w-56" />
        </div>

        <Skeleton className="h-5 w-80 max-w-full" />
      </div>

      {/* Count */}
      <div className="mb-4">
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <RestaurantCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
