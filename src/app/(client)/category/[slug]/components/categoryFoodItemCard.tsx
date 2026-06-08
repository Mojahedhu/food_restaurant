import Link from "next/link";
import { FoodWithDetails } from "../../../../../../types/sanityTypes";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Utensils } from "lucide-react";
import { PriceFormatter } from "@/components/foods/priceFormatter";

interface CategoryFoodItemCardProps {
  food: FoodWithDetails;
  itemsCount: number;
}

const CategoryFoodItemCard = ({
  food,
  itemsCount,
}: CategoryFoodItemCardProps) => {
  const optionFormatter = (itemsCount: number) => {
    return itemsCount >= 1 && itemsCount < 2
      ? `${itemsCount} option`
      : itemsCount > 2
        ? "+2 options"
        : "2 options";
  };
  return (
    <Link href={`/food/${food.slug}`}>
      <div className="group relative h-full overflow-hidden rounded-2xl bg-card shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-border">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent z-10"></div>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {food.images && food.images[0] ? (
            <Image
              src={urlFor(food.images[0]).url()}
              alt={food.name || "Food Image"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <Utensils className="w-20 h-20 text-primary group-hover:scale-110 transition-transform duration-300" />
          )}
        </div>
        <div className="relative p-4 z-10">
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-2">
            {food.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {food.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary">
                <PriceFormatter amount={food.basePrice || 0} />
              </span>
              <span className="text-xs text-muted-foreground">
                {optionFormatter(itemsCount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryFoodItemCard;
