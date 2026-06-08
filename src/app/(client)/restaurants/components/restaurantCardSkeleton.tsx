import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RestaurantCardSkeleton() {
  return (
    <Card className="py-0 overflow-hidden ">
      {/* Image */}
      <Skeleton className="h-48 w-full rounded-none" />

      <CardContent className="p-4 space-y-3">
        {/* Name */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />

          {/* Rating */}
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* Address */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>

        {/* Delivery Time */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      </CardContent>
    </Card>
  );
}
