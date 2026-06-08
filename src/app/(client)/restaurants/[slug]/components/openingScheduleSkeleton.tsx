import { Skeleton } from "@/components/ui/skeleton";

export function OpeningScheduleSkeleton() {
  return (
    <div className="flex justify-between p-3 rounded-md border">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-28" />
    </div>
  );
}
