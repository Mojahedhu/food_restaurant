import { CategoryWithCount } from "@/../types/sanityTypes";
import CategoryFoodItemCard from "./categoryFoodItemCard";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

interface CategoryFoodItemsProps {
  category: CategoryWithCount;
  props?: React.ComponentProps<"div">;
}
function CategoryFoodItems({ category, props }: CategoryFoodItemsProps) {
  const hasItems = category.foodItems && category.foodItems.length > 0;

  // 3. Resilient Fallback State
  if (!hasItems) {
    return (
      <div className="container mx-auto px-4 py-32 text-center animate-in zoom-in-95 duration-300">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
          <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          No items found
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          We are currently updating our menu for {category.name}. Please check
          back shortly or explore our other categories.
        </p>
        <Link
          href="/categories"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View All Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16" {...props}>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {category.foodItems?.map((item, index) => (
          // 4. Stagger Animation implemented here using index delay
          <div
            key={item._id}
            className="animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-both"
            style={{ animationDelay: `${(index % 12) * 75}ms` }}
          >
            <CategoryFoodItemCard
              food={item}
              itemsCount={category.itemsCount || 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryFoodItems;
