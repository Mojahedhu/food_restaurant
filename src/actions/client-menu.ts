"use server";
import { z } from "zod";
import { FoodWithDetails } from "../../types/sanityTypes";
import { sanityFetch } from "@/sanity/lib/live";

const FOODS_PER_PAGE = 12;

const FetchMenuSchema = z.object({
  page: z.number().int().min(0).default(0),
  sortBy: z
    .enum(["latest", "name-asc", "name-desc", "price-low", "price-high"])
    .default("latest"),
});

export async function fetchMenuProductsAction(payload: unknown) {
  try {
    const parsed = FetchMenuSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error("Invalid query parameters");
    }

    const { page, sortBy } = parsed.data;
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

    const countQuery = `count(*[_type == "food" && available == true])`;

    const [result, countResult] = await Promise.all([
      sanityFetch({ query, params: {}, tags: ["products"] }),

      sanityFetch({ query: countQuery, params: {}, tags: ["products"] }),
    ]);

    const data = result.data as FoodWithDetails[];
    const count = countResult.data as number;

    return { success: true, foods: data, totalCount: count };
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return { success: false, error: "Unable to retrieve menu products" };
  }
}
