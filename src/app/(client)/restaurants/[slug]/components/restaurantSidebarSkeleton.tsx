import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { OpeningScheduleSkeleton } from "./openingScheduleSkeleton";

export function RestaurantSidebarSkeleton() {
  return (
    <div className="space-y-6 sticky top-24">
      {/* Restaurant Info */}
      <Card>
        <div className="h-2 bg-muted" />

        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>

          <Skeleton className="h-px w-full" />

          <div className="space-y-5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Opening Hours */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>

        <CardContent className="space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <OpeningScheduleSkeleton key={index} />
          ))}
        </CardContent>
      </Card>
      {/* verify */}
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
