import CategoryFoodItemCardSkeleton from "./categoryFoodItemCardSkeleton";

export function CategoryFoodItemsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <CategoryFoodItemCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
