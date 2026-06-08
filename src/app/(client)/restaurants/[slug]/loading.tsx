import { Skeleton } from "@/components/ui/skeleton";
import { RestaurantHeroSkeleton } from "./components/restaurantHeroSkeleton";
import FoodCardSkeleton from "@/components/common/foodCardSkeleton";
import { RestaurantSidebarSkeleton } from "./components/restaurantSidebarSkeleton";

export default function RestaurantPageSkeleton() {
  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      <RestaurantHeroSkeleton />

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">
            {/* About */}
            <div className="bg-card rounded-xl p-6 border">
              <Skeleton className="h-6 w-32 mb-4" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Menu */}
            <div>
              <div className="flex justify-between mb-6">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-5 w-32" />
              </div>

              <Skeleton className="h-10 w-32 rounded-full mb-8" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <FoodCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <RestaurantSidebarSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
