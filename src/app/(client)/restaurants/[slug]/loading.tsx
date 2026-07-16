import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantPageSkeleton() {
  return (
    <div className="min-h-screen bg-muted/10 pb-20 animate-in fade-in duration-500">
      <Skeleton className="relative h-[400px] w-full rounded-none" />

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <Skeleton className="h-32 w-full rounded-xl bg-muted/40" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-48 bg-muted/50" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24 rounded-full bg-muted/40" />
                <Skeleton className="h-10 w-24 rounded-full bg-muted/40" />
                <Skeleton className="h-10 w-24 rounded-full bg-muted/40" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-48 rounded-xl bg-muted/30" />
                <Skeleton className="h-48 rounded-xl bg-muted/30" />
                <Skeleton className="h-48 rounded-xl bg-muted/30" />
                <Skeleton className="h-48 rounded-xl bg-muted/30" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="space-y-6">
              <Skeleton className="h-64 rounded-xl bg-muted/40" />
              <Skeleton className="h-64 rounded-xl bg-muted/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
