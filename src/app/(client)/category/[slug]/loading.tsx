import { BreadcrumbSkeleton } from "./_components/breadcrumbSkeleton";
import { CategoryDetailsHeroSkeleton } from "./_components/categoryDetailsHeroSkeleton";
import { CategoryFoodItemsSkeleton } from "./_components/categoryFoodItemsSkeleton";

export default function CategoryFoodPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbSkeleton />
      <CategoryDetailsHeroSkeleton />
      <CategoryFoodItemsSkeleton />
    </div>
  );
}
