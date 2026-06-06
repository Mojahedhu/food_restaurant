import React from "react";
import { FoodWithDetails } from "../../../types/sanityTypes";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { StarRating } from "./starRating";
import { PriceFormatter } from "./priceFormatter";
import AddToCart from "./addToCart";

const FoodCards = ({
  food,
  props,
}: {
  food: FoodWithDetails;
  props?: React.ComponentProps<"div">;
}) => {
  const hasRating = food.averageRating && food.totalReviews;
  const rating = food.averageRating || 0;
  const reviewCount = food.totalReviews || 0;

  return (
    <div className="group" {...props}>
      {/* Image */}
      <Link href={`/food/${food.slug}`}>
        {food?.images && food.images[0] && (
          <div className="relative w-full h-56 overflow-hidden rounded-lg">
            <Image
              src={urlFor(food.images[0]).url()}
              alt={"Food Image"}
              width={500}
              height={300}
              className="w-full h-full object-cover group-hover:scale-110 hover-effect"
              loading="eager"
            />
          </div>
        )}
      </Link>
      {/* Content */}
      <div className="py-2 space-y-1">
        <div>
          <div className="flex justify-start">
            {food.category && (
              <span className="text-xs font-medium">{food.category.name}</span>
            )}
          </div>
          <Link href={`/food/${food.slug}`} className="block">
            <h3 className="text-lg font-semibold tracking-wide line-clamp-1 text-primary">
              {food.name}
            </h3>
          </Link>
          {/* rating */}
          <div className="flex items-center gap-2 my-1">
            {hasRating ? (
              <>
                <StarRating rating={rating} showValue={false} size="sm" />
                <span className="text-xs text-muted-foreground">
                  ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
              </>
            ) : (
              <div className="flex items-center gap-2 my-1">
                <StarRating rating={0} showValue={false} size="sm" />
                <span className="text-xs text-muted-foreground">
                  (No reviews yet)
                </span>
              </div>
            )}
          </div>
          {/* price */}
          <PriceFormatter
            amount={food.basePrice || 0}
            className="text-foreground"
          />
        </div>
        {/* Add to cart */}
        <div className="mt-2">
          <AddToCart food={food} />
        </div>
      </div>
    </div>
  );
};

export default FoodCards;
