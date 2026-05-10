import { client } from "@/sanity/lib/client";
import { cache } from "react";
import { FoodWithCategory, FoodWithDetails } from "../../../types/sanityTypes";
import { GET_FOOD_BY_CATEGORY_QUERY, GET_FOOD_BY_SLUG_QUERY } from "../query";

export const getFoodBySlug = cache(async (slug: string) => {
  return client.fetch<FoodWithDetails>(GET_FOOD_BY_SLUG_QUERY, { slug });
});

export const getFoodByCategory = cache(
  async (categoryId: string, excludeFoodId?: string) => {
    return client.fetch<FoodWithCategory[]>(GET_FOOD_BY_CATEGORY_QUERY, {
      categoryId,
      excludeFoodId,
    });
  },
);
