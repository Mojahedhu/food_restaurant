import { Skeleton } from "@/components/ui/skeleton";
import { RestaurantCardSkeleton } from "./_components/restaurantCardSkeleton";
import { BreadcrumbSkeleton } from "./_components/breadcrumbSkeleton";

export default function RestaurantsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 pb-8">
        <div className="my-8">
          <BreadcrumbSkeleton />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-8 w-8 rounded-full bg-muted/50" />
            <Skeleton className="h-10 w-56 bg-muted/50" />
          </div>
          <Skeleton className="h-5 w-80 max-w-full bg-muted/40" />
        </div>

        <Skeleton className="h-20 w-full rounded-xl mb-8 bg-muted/30" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              style={{ animationDelay: `${(index % 8) * 50}ms` }}
              className="animate-pulse"
            >
              <RestaurantCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
