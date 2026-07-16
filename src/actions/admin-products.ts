"use server";

import { assertAdmin, checkAdmin } from "@/lib/auth-guard";
import { ProductSummary } from "@/types/admin";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { ServiceError } from "@/lib/services/errors";
import {
  fetchAllVarietiesService,
  fetchAllSizesService,
  fetchAllIngredientsService,
  fetchAdminProductsPagedService,
  fetchAllCategoriesService,
  toggleProductAvailabilityService,
  uploadProductImageService,
  saveProductService,
  createCategoryService,
  createSizeService,
  createVarietyService,
  createIngredientService,
  deleteProductService,
} from "@/lib/services/admin.product.service";

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
    return await fetchAllVarietiesService();
  } catch (error) {
    console.error("Failed to fetch varieties:", error);
    return [];
  }
}

export async function fetchAllSizes() {
  await checkAdmin();
  try {
    return await fetchAllSizesService();
  } catch (error) {
    console.error("Failed to fetch sizes:", error);
    return [];
  }
}

export async function fetchAllIngredients() {
  await checkAdmin();
  try {
    return await fetchAllIngredientsService();
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
    return await fetchAdminProductsPagedService({ page, pageSize, search, category, available });
  } catch (error) {
    console.error("Failed to fetch products on server:", error);
    return { totalItems: 0, products: [] };
  }
}

export async function fetchAllCategories() {
  await checkAdmin();
  try {
    return await fetchAllCategoriesService();
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

    await toggleProductAvailabilityService(productId, available);

    // @ts-ignore
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

    const assetId = await uploadProductImageService(buffer, file);

    return { success: true, assetId };
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

    await saveProductService(parsed.data);

    // @ts-ignore
    revalidateTag("products", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
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

    await createCategoryService(name, description);

    // @ts-ignore
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
    
    await createSizeService(parsed.data);
    
    // @ts-ignore
    revalidateTag("sizes", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
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
    
    await createVarietyService(parsed.data);
    
    // @ts-ignore
    revalidateTag("varieties", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
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
    
    await createIngredientService(parsed.data);
    
    // @ts-ignore
    revalidateTag("ingredients", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
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
    // 3. Call the service layer
    await deleteProductService(productId);

    // 4. Force cache revalidation
    // @ts-ignore
    revalidateTag("products", "max");
    return { success: true };
  } catch (error) {
    // 5. Hide database/technical details from client payload
    console.error(`Failed to delete product ${productId} in Sanity:`, error);
    return { success: false, error: "Failed to delete product from database" };
  }
}
