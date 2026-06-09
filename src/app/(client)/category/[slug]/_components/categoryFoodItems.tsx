import { Category } from "../../../../../../sanity.types";
import CategoryFoodItemCard from "./categoryFoodItemCard";

interface CategoryFoodItemsProps {
  category: Category;
  props?: React.ComponentProps<"div">;
}
function CategoryFoodItems({ category, props }: CategoryFoodItemsProps) {
  return (
    <div className="container mx-auto px-4 py-16" {...props}>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {category.foodItems.map((item) => (
          <CategoryFoodItemCard
            key={item._id}
            food={item}
            itemsCount={category.itemsCount || 0}
          />
        ))}
      </div>
    </div>
  );
}

export default CategoryFoodItems;
