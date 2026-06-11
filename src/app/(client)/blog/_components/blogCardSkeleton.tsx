import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BlogCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col h-full py-0">
      {/* Image */}
      <Skeleton className="h-48 w-full rounded-none" />

      <CardHeader className="p-4 pb-2">
        {/* Date */}
        <Skeleton className="h-4 w-32 mb-3" />

        {/* Title */}
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>

      <CardContent className="p-4 pt-0 grow">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0">
        <Skeleton className="h-5 w-24" />
      </CardFooter>
    </Card>
  );
}
