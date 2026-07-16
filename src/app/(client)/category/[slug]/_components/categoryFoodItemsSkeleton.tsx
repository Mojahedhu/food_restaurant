import CategoryFoodItemCardSkeleton from "./categoryFoodItemCardSkeleton";

export function CategoryFoodItemsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="animate-in fade-in duration-500 fill-mode-both"
            style={{ animationDelay: `${(index % 8) * 50}ms` }}
          >
            <CategoryFoodItemCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
