import { client } from "@/sanity/lib/client";
import {
  FEATURED_RESTAURANTS_QUERY,
  ALL_RESTAURANTS_QUERY,
  GET_RESTAURANT_BY_SLUG_QUERY,
} from "../query";

import { Restaurant } from "../../../types/sanityTypes";

export async function getFeaturedRestaurants() {
  return await client.fetch<Restaurant[]>(FEATURED_RESTAURANTS_QUERY);
}

export async function getRestaurants() {
  return await client.fetch<Restaurant[]>(ALL_RESTAURANTS_QUERY);
}

export async function getRestaurantBySlug(slug: string) {
  return await client.fetch<Restaurant>(GET_RESTAURANT_BY_SLUG_QUERY, {
    slug,
  });
}
