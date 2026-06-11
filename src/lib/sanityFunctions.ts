import { client } from "@/sanity/lib/client";
import {
  ALL_POSTS_QUERY,
  AVAILABLE_FOODS_QUERY,
  BANNERS_QUERY,
  CATEGORIES_QUERY,
  CATEGORIES_WITH_COUNT_QUERY,
  FEATURED_FOODS_QUERY,
  FEATURED_POSTS_QUERY,
  GET_CATEGORY_BY_SLUG_QUERY,
  GET_POST_DETAILS_BY_SLUG_QUERY,
  LATEST_POSTS_QUERY,
} from "./query";
import type { Banner, Category, Food, Post } from "@/../sanity.types";
import { LatestPost, PostDetails } from "../../types/sanityTypes";
import { sanityFetch } from "@/sanity/lib/live";

//================================================================

// Get all active banners ordered by order field
export async function getBanners(): Promise<Banner[]> {
  const { data } = await sanityFetch({ query: BANNERS_QUERY });
  return data as Banner[];
}
//================================================================

// CATEGORY FUNCTIONS

/**
 * Get all active categories
 */
export async function getCategories(): Promise<Category[]> {
  const { data } = await sanityFetch({ query: CATEGORIES_WITH_COUNT_QUERY });
  return data as Category[];
}

/**
 * Get all active categories (full details)
 */
export async function getAllCategories(): Promise<Category[]> {
  const { data } = await sanityFetch({ query: CATEGORIES_QUERY });
  return data as Category[];
}

/**
 * Get category by slug with food item details
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  const { data } = await sanityFetch({
    query: GET_CATEGORY_BY_SLUG_QUERY,
    params: { slug },
  });
  return data as Category;
}

//================================================================
/**
 * Get all foods
 */
export async function getFoods(): Promise<Food[]> {
  const { data } = await sanityFetch({ query: FEATURED_FOODS_QUERY });
  return data as Food[];
}

/**
 * Get featured foods (limited to 8)
 */
export async function getFeaturedFoods(): Promise<Food[]> {
  const { data } = await sanityFetch({ query: FEATURED_FOODS_QUERY });
  return data as Food[];
}

/**
 * Get available foods with limit
 */
export async function getAvailableFoods(limit: number = 12): Promise<Food[]> {
  const { data } = await sanityFetch({
    query: AVAILABLE_FOODS_QUERY,
    params: { limit },
  });
  return data as Food[];
}

/**
 * Get all posts
 */
export async function getAllPosts(): Promise<Post[]> {
  const { data } = await sanityFetch({ query: ALL_POSTS_QUERY });
  return data as Post[];
}

/**
 * Get featured posts  (limited to 4)
 */
export async function getFeaturedPosts(): Promise<Post[]> {
  const { data } = await sanityFetch({ query: FEATURED_POSTS_QUERY });
  return data as Post[];
}

/**
 * Get full details post by slug
 */
export async function getPostDetailsBySlug(slug: string): Promise<PostDetails> {
  const { data } = await sanityFetch({
    query: GET_POST_DETAILS_BY_SLUG_QUERY,
    params: { slug },
  });
  return data as PostDetails;
}

/**
 * Get lates posts
 */
export async function getLatestPosts(): Promise<LatestPost[]> {
  const { data } = await sanityFetch({ query: LATEST_POSTS_QUERY });
  return data as LatestPost[];
}
