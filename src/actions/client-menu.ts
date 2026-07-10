"use server";
import { z } from "zod";
import { FoodWithDetails } from "../../types/sanityTypes";
import { getMenuFoods, getMenuTotalCount, SortOption } from "@/lib/data/menu";

const FetchMenuSchema = z.object({
  page: z.number().int().min(0).default(0),
  sortBy: z
    .enum(["latest", "name-asc", "name-desc", "price-low", "price-high"])
    .default("latest"),
});

// Rule 6: Strict TypeScript (No any)
export type FetchMenuResult =
  | { success: true; foods: FoodWithDetails[]; totalCount: number }
  | { success: false; error: string };

export async function fetchMenuProductsAction(
  payload: unknown,
): Promise<FetchMenuResult> {
  try {
    // Rule 2: Compile-Time & Runtime Safety with Zod safeParse
    const parsed = FetchMenuSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error("Invalid query parameters");
    }

    const { page, sortBy } = parsed.data;

    const [foods, totalCount] = await Promise.all([
      getMenuFoods(page, sortBy as SortOption),
      getMenuTotalCount(),
    ]);

    return { success: true, foods, totalCount };
  } catch (error) {
    // Rule 3: Isolate Technical Logs & Data Leak Isolation
    console.error("Failed to fetch menu items:", error);
    return { success: false, error: "Unable to retrieve menu products" };
  }
}
