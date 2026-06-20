import { Skeleton } from "@/components/ui/skeleton";

function OrdersTableSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="border rounded-md">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="border-b p-4 flex items-center justify-between"
          >
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[50px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrdersTableSkeleton;
