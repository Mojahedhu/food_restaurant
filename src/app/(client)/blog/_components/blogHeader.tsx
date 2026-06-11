import { Skeleton } from "@/components/ui/skeleton";

export function BlogHeaderSkeleton() {
  return (
    <div className="my-8">
      <Skeleton className="h-10 w-64 mb-3" />
      <Skeleton className="h-5 w-full max-w-md" />
    </div>
  );
}
