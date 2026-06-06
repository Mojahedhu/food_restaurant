import { getFoodByCategory, getFoodBySlug } from "@/lib/data/food";
import { urlFor } from "@/sanity/lib/image";
import { Utensils } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface RelatedFoodProps {
  foodSlug: string;
}

const RelatedFood = async ({ foodSlug }: RelatedFoodProps) => {
  const foodDetails = await getFoodBySlug(foodSlug);
  const foodByCategory = await getFoodByCategory(
    foodDetails?.category?._id as string,
    foodDetails._id,
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        You May Also Like
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {foodByCategory.map((food) => (
          <Link key={food._id} className="group" href={`/food/${food.slug}`}>
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
              {food.images?.[0]?.asset ? (
                <Image
                  alt={food.name || "Food image"}
                  loading="lazy"
                  width="300"
                  height="300"
                  decoding="async"
                  data-nimg="1"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  src={urlFor(food.images?.[0]?.asset).url()}
                  style={{ color: "transparent" }}
                />
              ) : (
                <Utensils className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              )}
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {food.name}
            </h3>
            <span className="text-base text-primary font-bold">
              ${food.price?.toFixed(2) || "N/A"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedFood;
