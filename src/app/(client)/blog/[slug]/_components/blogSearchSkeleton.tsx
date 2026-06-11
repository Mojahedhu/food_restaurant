import { Skeleton } from "@/components/ui/skeleton";

function BlogSearchSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <Skeleton className="h-6 w-28 mb-4" />

      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  );
}

export default BlogSearchSkeleton;
