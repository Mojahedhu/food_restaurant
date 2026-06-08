import { Skeleton } from "@/components/ui/skeleton";

export function RestaurantHeroSkeleton() {
  return (
    <div className="relative h-[400px] w-full">
      <Skeleton className="absolute inset-0 rounded-none" />

      <div className="absolute bottom-0 left-0 w-full container mx-auto px-4 py-8">
        <div className="space-y-4 max-w-3xl">
          <Skeleton className="h-8 w-24 rounded-full" />

          <Skeleton className="h-14 w-96 max-w-full" />

          <div className="flex gap-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
