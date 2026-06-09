import { Separator } from "@/components/ui/separator";
import {
  FoodDetailsSkeleton,
  FoodReviewSkeleton,
  RelatedFoodSkeleton,
} from "./_components/skeleton";

const loading = () => {
  return (
    <div className="bg-background">
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="py-4 flex items-center gap-2">
            <div className="h-4 w-12 bg-muted-foreground/20 rounded animate-pulse"></div>
            <div className="h-4 w-1 bg-muted-foreground/20 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-muted-foreground/20 rounded animate-pulse"></div>
            <div className="h-4 w-1 bg-muted-foreground/20 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-muted-foreground/20 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
      <main className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <FoodDetailsSkeleton />
          <div className="space-y-12">
            <Separator />
            <FoodReviewSkeleton />
            <Separator />
            <RelatedFoodSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
};

export default loading;
