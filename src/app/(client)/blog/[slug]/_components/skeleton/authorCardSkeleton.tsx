import { Skeleton } from "@/components/ui/skeleton";

function AuthorCardSkeleton() {
  return (
    <div className="mt-16 p-8 bg-gray-50 rounded-xl border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6">
      <Skeleton className="w-24 h-24 rounded-full shrink-0" />

      <div className="flex-1 space-y-3 w-full">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />

        <div className="flex gap-4 pt-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default AuthorCardSkeleton;
