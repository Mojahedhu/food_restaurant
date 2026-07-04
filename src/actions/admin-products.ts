"use server";

import { assertAdmin, checkAdmin } from "@/lib/auth-guard";
import { client, writeClient } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { ProductSummary } from "@/types/admin";
import { groq } from "next-sanity";
import { revalidateTag } from "next/cache";
import { z } from "zod";

// Zod validation schemas
const ToggleAvailabilitySchema = z.object({
  productId: z.string().trim().min(1),
  available: z.boolean(),
});

const CreateCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters"),
  description: z.string().trim().optional(),
});

//  Updated Save Product Validation Schema:
const SaveProductSchema = z.object({
  productId: z.string().trim().optional(),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  price: z.number().positive("Price must be a positive number"),
  order: z
    .number()
    .int()
    .min(0, "Display order must be a non-negative integer"),
  categoryRefId: z
    .string()
    .trim()
    .min(1, "Category is required, please select a category"),
  description: z.string().trim().min(5, "Description is required"),
  preparationTime: z.number().optional().nullable(),
  spiceLevel: z
    .enum(["mild", "medium", "hot", "extra-Hot", "none"])
    .optional()
    .nullable(),
  enableAllSizes: z.boolean(),
  featured: z.boolean(),
  imageAssetIds: z
    .array(z.string())
    .min(1, "At least one image is required")
    .max(6, "Maximum of 6 images allowed"), // 👈 New array field
  sizeIds: z.array(z.string().trim()).default([]),
  varietyIds: z.array(z.string().trim()).default([]),
  ingredientIds: z.array(z.string().trim()).default([]),
});

const DeleteProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

const CreateSizeSchema = z.object({
  name: z.string().trim().min(2, "Size name must be at least 2 characters"),
  code: z.string().trim().min(1, "Size code is required (e.g. S, M, L)"),
  description: z.string().trim().optional(),
  serveSize: z.number().int().min(1, "Serve size must be at least 1 person"),
  order: z
    .number()
    .int()
    .min(0, "Display order must be a non-negative integer"),
});
const CreateVarietySchema = z.object({
  name: z.string().trim().min(2, "Variety name must be at least 2 characters"),
  description: z.string().trim().optional(),
  order: z
    .number()
    .int()
    .min(0, "Display order must be a non-negative integer"),
});
const CreateIngredientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ingredient name must be at least 2 characters"),
  description: z.string().trim().optional(),
  order: z
    .number()
    .int()
    .min(0, "Display order must be a non-negative integer"),
});

interface FetchProductsParams {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  available?: string;
}

// --- Fetching helper functions ---->
export async function fetchAllVarieties() {
  await checkAdmin();
  try {
    const query = groq`*[_type == "foodVariety"] | order(name asc) { _id, name }`;
    const { data } = await sanityFetch({
      query,
      params: {},
      tags: ["varieties"],
    });
    return data as Array<{ _id: string; name: string }>;
  } catch (error) {
    console.error("Failed to fetch varieties:", error);
    return [];
  }
}

export async function fetchAllSizes() {
  await checkAdmin();
  try {
    const query = groq`*[_type == "size"] | order(name asc) { _id, name }`;
    const { data } = await sanityFetch({ query, params: {}, tags: ["sizes"] });
    return data as Array<{ _id: string; name: string }>;
  } catch (error) {
    console.error("Failed to fetch sizes:", error);
    return [];
  }
}

export async function fetchAllIngredients() {
  await checkAdmin();
  try {
    const query = groq`*[_type == "ingredient"] | order(name asc) { _id, name }`;
    const { data } = await sanityFetch({
      query,
      params: {},
      tags: ["ingredients"],
    });
    return data as Array<{ _id: string; name: string }>;
  } catch (error) {
    console.error("Failed to fetch ingredients:", error);
    return [];
  }
}
// ---- Fetch Products ---->

export async function fetchAdminProductsPaged({
  page,
  pageSize,
  search = "",
  category = "",
  available = "",
}: FetchProductsParams) {
  await checkAdmin();
  try {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    let filterClauses = `_type == "food"`;
    const params: Record<string, string | number> = { start, end };

    if (search.trim()) {
      filterClauses += ` && name match $search`;
      params.search = `*${search.trim()}*`;
    }

    if (category && category !== "all") {
      filterClauses += ` && category._ref == $category`;
      params.category = category;
    }

    if (available === "true") {
      filterClauses += ` && available == true`;
    } else if (available === "false") {
      filterClauses += ` && available == false`;
    }

    const countQuery = groq`count(*[${filterClauses}])`;
    const dataQuery = groq`
      *[${filterClauses}] | order(name asc) {
        _id,
        _createdAt,
        name,
        price,
        order,
        available,
        description,
        preparationTime,
        spiceLevel,
        enableAllSizes,
        featured,
        category->{
          _id,
          name
        },
        images[] {
          asset-> {
            _id,
            url
          }
        },
        "sizes": sizes[].size->{
          _id,
          name
        },
        varieties[]->{
          _id,
          name
        },
        ingredients[]->{
          _id,
          name
        }
      }[$start...$end]
    `;

    const [{ data: totalItems }, { data: products }] = await Promise.all([
      sanityFetch({ query: countQuery, params, tags: ["products"] }),
      sanityFetch({ query: dataQuery, params, tags: ["products"] }),
    ]);

    return {
      totalItems: totalItems as number,
      products: products as ProductSummary[],
    };
  } catch (error) {
    console.error("Failed to fetch products on server:", error);
    return { totalItems: 0, products: [] };
  }
}

export async function fetchAllCategories() {
  await checkAdmin();
  try {
    const query = groq`*[_type == "category"] | order(name asc) { _id, name }`;
    const { data: categories } = await sanityFetch({
      query,
      params: {},
      tags: ["categories"],
    });
    return categories as Array<{ _id: string; name: string }>;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function toggleProductAvailability(
  payload: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  try {
    const parsed = ToggleAvailabilitySchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: "Invalid payload parameters" };
    }

    const { productId, available } = parsed.data;

    await client.patch(productId).set({ available }).commit();

    revalidateTag("products", "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle product availability:", error);
    return { success: false, error: "Server update failed" };
  }
}

export async function uploadProductImageAction(
  formData: FormData,
): Promise<{ success: boolean; error?: string; assetId?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  try {
    const file = formData.get("image") as File;
    if (!file) {
      return { success: false, error: "No image file provided" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload asset to Sanity
    const asset = await writeClient.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
    });

    return { success: true, assetId: asset._id };
  } catch (error) {
    console.error("Failed to upload image asset:", error);
    return { success: false, error: "Image upload failed" };
  }
}

export async function saveProductAction(
  payload: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  try {
    const parsed = SaveProductSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    const {
      productId,
      name,
      price,
      order,
      categoryRefId,
      description,
      preparationTime,
      spiceLevel,
      enableAllSizes,
      featured,
      imageAssetIds,
      sizeIds,
      varietyIds,
      ingredientIds,
    } = parsed.data;

    // A. Enforce Order uniqueness (Admin validation check)
    const orderConflict = await client.fetch(
      groq`*[_type == "food" && order == $order && !(_id in [$id, "drafts." + $id])][0]`,
      { order, id: productId || "" },
    );
    if (orderConflict) {
      return {
        success: false,
        error: `Display Order ${order} is already assigned to "${orderConflict.name}"`,
      };
    }

    type DocumentFieldsValue =
      | string
      | number
      | boolean
      | "mild"
      | "medium"
      | "hot"
      | "extra-Hot"
      | null
      | undefined
      | string[]
      | {
          _type: string;
          _ref: string;
        }
      | {
          _type: string;
          _key: string;
          asset: {
            _type: string;
            _ref: string;
          };
        }[]
      | {
          _key: string;
          size: {
            _type: string;
            _ref: string;
          };
        }[]
      | {
          _type: string;
          _ref: string;
          _key: string;
        }[];

    let updatedImages: DocumentFieldsValue | undefined = undefined;

    if (imageAssetIds) {
      const newImageObj = imageAssetIds.map((assetId, idx) => ({
        _type: "image",
        _key: `img_${assetId}_${idx}`,
        asset: {
          _type: "reference",
          _ref: assetId,
        },
      }));

      // No conditional check needed, directly assign the full ordered set
      updatedImages = newImageObj;
    }

    // C. Format reference lists
    const sizeObjects = sizeIds.map((sid) => ({
      _key: `sz_${sid}`,
      size: { _type: "reference", _ref: sid },
    }));

    const varietyRefs = varietyIds.map((vid) => ({
      _type: "reference",
      _ref: vid,
      _key: `var_${vid}`,
    }));

    const ingredientRefs = ingredientIds.map((iid) => ({
      _type: "reference",
      _ref: iid,
      _key: `ing_${iid}`,
    }));

    const documentFields: Record<string, DocumentFieldsValue> = {
      name,
      price,
      order,
      category: { _type: "reference", _ref: categoryRefId },
      description,
      preparationTime: preparationTime || null,
      spiceLevel: spiceLevel === "none" ? null : spiceLevel,
      enableAllSizes,
      featured,
      sizes: sizeObjects,
      varieties: varietyRefs,
      ingredients: ingredientRefs,
    };

    if (updatedImages) {
      documentFields.images = updatedImages;
    }

    if (productId) {
      // Update existing
      await writeClient.patch(productId).set(documentFields).commit();
    } else {
      // Create new food item
      // Auto-generate a clean slug from name
      const slugValue = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-");

      await writeClient.create({
        _type: "food",
        available: true,
        slug: {
          _type: "slug",
          current: slugValue,
        },
        ...documentFields,
      });
    }

    revalidateTag("products", "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to save product:", error);
    return { success: false, error: "Database save failed" };
  }
}

export async function createCategoryAction(
  payload: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  try {
    const parsed = CreateCategorySchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { name, description } = parsed.data;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

    await client.create({
      _type: "category",
      name,
      description: description || "",
      slug: {
        _type: "slug",
        current: slug,
      },
    });

    revalidateTag("categories", "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Category creation failed" };
  }
}

// --- Create Standalone Size Document ---
export async function createSizeAction(
  payload: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  try {
    const parsed = CreateSizeSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }
    const { name, code, description, serveSize, order } = parsed.data;
    // Check display order uniqueness
    const orderConflict = await client.fetch(
      groq`*[_type == "size" && order == $order][0]`,
      { order },
    );
    if (orderConflict) {
      return {
        success: false,
        error: `Display order ${order} is already assigned to "${orderConflict.name}"`,
      };
    }
    await writeClient.create({
      _type: "size",
      name,
      code,
      description: description || "",
      serveSize,
      order,
    });
    revalidateTag("sizes", "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to create size:", error);
    return { success: false, error: "Failed to save size configuration." };
  }
}
// --- Create Standalone Variety Document ---
export async function createVarietyAction(
  payload: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  try {
    const parsed = CreateVarietySchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }
    const { name, description, order } = parsed.data;
    const orderConflict = await client.fetch(
      groq`*[_type == "foodVariety" && order == $order][0]`,
      { order },
    );
    if (orderConflict) {
      return {
        success: false,
        error: `Display order ${order} is already assigned to "${orderConflict.name}"`,
      };
    }
    await writeClient.create({
      _type: "foodVariety",
      name,
      description: description || "",
      order,
    });
    revalidateTag("varieties", "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to create variety:", error);
    return { success: false, error: "Failed to save variety configuration." };
  }
}
// --- Create Standalone Ingredient Document ---
export async function createIngredientAction(
  payload: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  try {
    const parsed = CreateIngredientSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }
    const { name, description, order } = parsed.data;
    const orderConflict = await client.fetch(
      groq`*[_type == "ingredient" && order == $order][0]`,
      { order },
    );
    if (orderConflict) {
      return {
        success: false,
        error: `Display order ${order} is already assigned to "${orderConflict.name}"`,
      };
    }
    await writeClient.create({
      _type: "ingredient",
      name,
      description: description || "",
      order,
    });
    revalidateTag("ingredients", "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to create ingredient:", error);
    return {
      success: false,
      error: "Failed to save ingredient configuration.",
    };
  }
}

export async function deleteProductAction(
  payload: unknown,
): Promise<{ success: boolean; error?: string }> {
  // 1. Enforce Admin verification
  const guard = await assertAdmin();
  if (!guard.success) return guard;

  // 2. Validate input parameters via Zod
  const parsed = DeleteProductSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: "Invalid Product ID structure" };
  }

  const { productId } = parsed.data;

  try {
    // 3. Delete document from Sanity
    await writeClient.delete(productId);

    // 4. Force cache revalidation
    revalidateTag("products", "max");
    return { success: true };
  } catch (error) {
    // 5. Hide database/technical details from client payload
    console.error(`Failed to delete product ${productId} in Sanity:`, error);
    return { success: false, error: "Failed to delete product from database" };
  }
}
