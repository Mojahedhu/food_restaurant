import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import type { PostCard } from "@/../types/sanityTypes";

export const POSTS_PER_PAGE = 8;

export async function fetchBlogPosts(
  page: number = 1,
  searchQuery: string = "",
) {
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = page * POSTS_PER_PAGE;

  // We conditionally apply GROQ filtering if a search query is present
  const searchFilter = searchQuery
    ? `&& (title match $searchQuery + "*" || author->name match $searchQuery + "*" || categories[]->title match $searchQuery + "*")`
    : "";

  const query = groq`
    {
      "posts": *[_type == "post" ${searchFilter}] | order(publishedAt desc) [$start...$end] {
        _id,
        title,
        slug,
        mainImage,
        publishedAt,
        author->{ _id, name, image, bio},
        categories[]->{_id, title, slug}
      },
      "totalCount": count(*[_type == "post" ${searchFilter}])
    }
  `;

  const { data } = await sanityFetch({
    query,
    params: { start, end, searchQuery },
  });

  return data as { posts: PostCard[]; totalCount: number };
}
