import { client } from "@/sanity/lib/client";
import {
  AVAILABLE_FOODS_QUERY,
  BANNERS_QUERY,
  CATEGORIES_QUERY,
  CATEGORIES_WITH_COUNT_QUERY,
  FEATURED_FOODS_QUERY,
  GET_CATEGORY_BY_SLUG_QUERY,
} from "./query";
import type { Banner, Category, Food } from "@/../sanity.types";

//================================================================

// Get all active banners ordered by order field
export async function getBanners(): Promise<Banner[]> {
  const data = await client.fetch(BANNERS_QUERY);
  return data;
}
//================================================================

// CATEGORY FUNCTIONS

/**
 * Get all active categories
 */
export async function getCategories(): Promise<Category[]> {
  return client.fetch(CATEGORIES_WITH_COUNT_QUERY);
}

/**
 * Get all active categories (full details)
 */
export async function getAllCategories(): Promise<Category[]> {
  return client.fetch(CATEGORIES_QUERY);
}

/**
 * Get category by slug with food item details
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  return client.fetch(GET_CATEGORY_BY_SLUG_QUERY, { slug });
}

//================================================================
/**
 * Get all foods
 */
export async function getFoods(): Promise<Food[]> {
  return client.fetch(FEATURED_FOODS_QUERY);
}

/**
 * Get featured foods (limited to 8)
 */
export async function getFeaturedFoods(): Promise<Food[]> {
  return client.fetch(FEATURED_FOODS_QUERY);
}

/**
 * Get available foods with limit
 */
export async function getAvailableFoods(limit: number = 12): Promise<Food[]> {
  return client.fetch(AVAILABLE_FOODS_QUERY, { limit });
}
