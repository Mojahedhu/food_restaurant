"use server";

import { fetchBlogPosts } from "@/lib/data/blog";
import type { PostCard } from "@/../types/sanityTypes";

export type FetchBlogResult =
  | { success: true; posts: PostCard[]; totalCount: number }
  | { success: false; error: string };

export async function fetchBlogPostsAction(params: {
  page: number;
  searchQuery?: string;
}): Promise<FetchBlogResult> {
  try {
    const data = await fetchBlogPosts(params.page, params.searchQuery || "");
    return {
      success: true,
      posts: data.posts,
      totalCount: data.totalCount,
    };
  } catch (err) {
    const error = err as Error;
    console.error("Error fetching blog posts:", error);
    return { success: false, error: error.message || "Failed to fetch posts" };
  }
}
