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
  productId: z.string().min(1),
  available: z.boolean(),
});

const CreateCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional(),
});

const SaveProductSchema = z.object({
  productId: z.string().optional(), // omitted for creations
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.number().positive("Price must be a positive number"),
  categoryRefId: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  imageAssetId: z.string().optional(),
});

interface FetchProductsParams {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  available?: string;
}

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
        available,
        description,
        category->{
          _id,
          name
        },
        images[0] {
          asset-> {
            _id,
            url
          }
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
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg };
    }

    const { productId, name, price, categoryRefId, description, imageAssetId } =
      parsed.data;
    type DocumentFieldsValue =
      | string
      | number
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
        }[];

    let updatedImages: DocumentFieldsValue | undefined = undefined;

    if (imageAssetId) {
      const newImageObj = {
        _type: "image",
        _key: `img_${Date.now()}`,
        asset: {
          _type: "reference",
          _ref: imageAssetId,
        },
      };

      if (productId) {
        // Fetch the current document to get the existing images list
        const existingDoc = await client.fetch(
          groq`*[_id == $id][0] { images }`,
          { id: productId },
        );
        const currentImages = existingDoc?.images || [];
        if (currentImages.length > 0) {
          // Replace only the first image in the array (the main image)
          updatedImages = [newImageObj, ...currentImages.slice(1)];
        } else {
          updatedImages = [newImageObj];
        }
      } else {
        // For new creation
        updatedImages = [newImageObj];
      }
    }

    const documentFields: Record<string, DocumentFieldsValue> = {
      name,
      price,
      category: {
        _type: "reference",
        _ref: categoryRefId,
      },
      description: description || "",
    };

    if (updatedImages) {
      documentFields.images = updatedImages;
    }

    if (productId) {
      // Update existing
      await writeClient.patch(productId).set(documentFields).commit();
    } else {
      // Create new food item
      await writeClient.create({
        _type: "food",
        available: true,
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
