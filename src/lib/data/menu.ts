import { sanityFetch } from "@/sanity/lib/live";
import { FoodWithDetails } from "@/../types/sanityTypes";

export const FOODS_PER_PAGE = 12;

export type SortOption =
  | "latest"
  | "name-asc"
  | "name-desc"
  | "price-low"
  | "price-high";

export async function getMenuFoods(
  page: number,
  sortBy: SortOption,
): Promise<FoodWithDetails[]> {
  const offset = page * FOODS_PER_PAGE;

  let orderClause = "_createdAt desc";
  if (sortBy === "name-asc") orderClause = "name asc";
  if (sortBy === "name-desc") orderClause = "name desc";
  if (sortBy === "price-low") orderClause = "price asc";
  if (sortBy === "price-high") orderClause = "price desc";

  const query = `
    *[_type == "food" && available == true]
    | order(${orderClause})
    [${offset}...${offset + FOODS_PER_PAGE}] {
      _id,
      _createdAt,
      name,
      "slug": slug.current,
      description,
      "basePrice": price,
      images,
      preparationTime,
      spiceLevel,
      available,
      featured,
      "averageRating": coalesce(math::avg(*[_type == "review" && food._ref == ^._id && approved == true].rating), 0),
      "totalReviews": count(*[_type == "review" && food._ref == ^._id && approved == true]),
      category->{ _id, name, "slug": slug.current, description },
      varieties[]->{ _id, name }
    }
  `;

  // Rule 8: Explicit caching/revalidation support via sanityFetch tags
  const response = await sanityFetch({ query, params: {}, tags: ["products"] });
  return response.data as FoodWithDetails[];
}

export async function getMenuTotalCount(): Promise<number> {
  const countQuery = `count(*[_type == "food" && available == true])`;
  const response = await sanityFetch({
    query: countQuery,
    params: {},
    tags: ["products"],
  });
  return response.data as number;
}
