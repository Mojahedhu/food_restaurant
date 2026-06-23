# Phase 8: Products (Foods) Management Dashboard & Category Creator

This phase builds the Products Management dashboard in `/admin/products`. It integrates dynamic category loading, a dialog-based **Category Creator**, and a client-side **Image Compressor** with Sanity asset uploads via Server Actions.

All designs are built in compliance with the zero-trust, input validation, and crash elimination rules in [plan.md](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/plan.md).

---

## User Review Required

> [!IMPORTANT]
>
> - **Canvas-based Image Compression:** Prior to uploading a new product image, the client-side helper compresses the file using a canvas exporter (reducing it to 70% JPEG quality) to prevent uploading heavy mobile-camera images.
> - **Sanity Asset Upload Pipeline:** The compressed image is sent via `FormData` to the Server Action `uploadProductImageAction`, which writes the buffer directly to Sanity's image assets database and returns a referencable asset ID.
> - **Dynamic Category Loading:** Hardcoded category lists are removed. The dashboard now queries categories dynamically from Sanity and caches them using the `"categories"` tag, ensuring any newly created category instantly appears in the dropdowns.

---

## Proposed Changes

### 1. Client-Side Image Compressor (`src/lib/image-compressor.ts`)

Create a canvas helper utility that resizes and compresses image files in the browser before upload.

```typescript
// [NEW] src/lib/image-compressor.ts

/**
 * Resizes and compresses an image file using HTML5 Canvas.
 * Returns a JPEG Blob at the specified quality (0.0 to 1.0).
 */
export function compressImage(
  file: File,
  quality = 0.7,
  maxWidth = 1200,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize down if it exceeds the maximum width
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context creation failed"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas image export failed"));
            }
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
```

---

### 2. Backend Actions (`src/actions/admin-products.ts`)

Implement Server Actions to fetch products/categories, upload image assets, toggle availability, create products, and create categories with strict Zod parsing.

```typescript
// [NEW] src/actions/admin-products.ts
"use server";

import { writeClient } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
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
  try {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    let filterClauses = `_type == "food"`;
    const params: Record<string, any> = { start, end };

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
      products: products as any[],
    };
  } catch (error) {
    console.error("Failed to fetch products on server:", error);
    return { totalItems: 0, products: [] };
  }
}

export async function fetchAllCategories() {
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

export async function toggleProductAvailability(payload: unknown) {
  try {
    const parsed = ToggleAvailabilitySchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: "Invalid payload parameters" };
    }

    const { productId, available } = parsed.data;

    await writeClient.patch(productId).set({ available }).commit();

    revalidateTag("products");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle product availability:", error);
    return { success: false, error: "Server update failed" };
  }
}

export async function uploadProductImageAction(formData: FormData) {
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

export async function saveProductAction(payload: unknown) {
  try {
    const parsed = SaveProductSchema.safeParse(payload);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg };
    }

    const { productId, name, price, categoryRefId, description, imageAssetId } =
      parsed.data;

    const documentFields: Record<string, any> = {
      name,
      price,
      category: {
        _type: "reference",
        _ref: categoryRefId,
      },
      description: description || "",
    };

    if (imageAssetId) {
      documentFields.images = [
        {
          _type: "image",
          _key: `img_${Date.now()}`,
          asset: {
            _type: "reference",
            _ref: imageAssetId,
          },
        },
      ];
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

    revalidateTag("products");
    return { success: true };
  } catch (error) {
    console.error("Failed to save product:", error);
    return { success: false, error: "Database save failed" };
  }
}

export async function createCategoryAction(payload: unknown) {
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

    await writeClient.create({
      _type: "category",
      name,
      description: description || "",
      slug: {
        _type: "slug",
        current: slug,
      },
    });

    revalidateTag("categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Category creation failed" };
  }
}
```

---

### 3. Custom Products Logic Hook (`src/hooks/useProductsLogic.ts`)

Update logic hook to incorporate product save operations (with conditional image upload triggers) and availability toggles.

```typescript
// [NEW] src/hooks/useProductsLogic.ts
"use client";

import { useTransition, useState, useEffect } from "react";
import { ProductSummary } from "@/types/admin";
import {
  toggleProductAvailability,
  saveProductAction,
  uploadProductImageAction,
} from "@/actions/admin-products";
import { compressImage } from "@/lib/image-compressor";
import { toast } from "sonner";

export function useProductsLogic(initialProducts: ProductSummary[]) {
  const [isPending, startTransition] = useTransition();
  const [localUpdates, setLocalUpdates] = useState<
    Record<string, Partial<ProductSummary>>
  >({});

  useEffect(() => {
    setLocalUpdates((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const productId in next) {
        const serverProduct = initialProducts.find((p) => p._id === productId);
        const localUpdate = next[productId];

        if (serverProduct) {
          const isAvailabilitySynced =
            localUpdate.available === undefined ||
            serverProduct.available === localUpdate.available;
          const isPriceSynced =
            localUpdate.price === undefined ||
            serverProduct.price === localUpdate.price;

          if (isAvailabilitySynced && isPriceSynced) {
            delete next[productId];
            changed = true;
          }
        }
      }

      return changed ? next : prev;
    });
  }, [initialProducts]);

  const products = (initialProducts || []).map((product) => {
    const update = localUpdates[product._id];
    return update ? { ...product, ...update } : product;
  });

  const handleToggleAvailability = async (
    productId: string,
    currentAvailable: boolean,
  ) => {
    const nextAvailable = !currentAvailable;

    setLocalUpdates((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], available: nextAvailable },
    }));

    startTransition(async () => {
      const result = await toggleProductAvailability({
        productId,
        available: nextAvailable,
      });
      if (result.success) {
        toast.success(`Availability updated!`);
      } else {
        toast.error("Failed to update availability. Reverting.");
        setLocalUpdates((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      }
    });
  };

  const handleSaveProduct = async (
    productId: string | undefined, // undefined for new creations
    updates: {
      name: string;
      price: number;
      categoryRefId: string;
      description?: string;
      imageFile?: File;
    },
  ) => {
    if (productId) {
      setLocalUpdates((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          name: updates.name,
          price: updates.price,
        },
      }));
    }

    let imageAssetId: string | undefined = undefined;

    // 1. Compress & Upload image if selected
    if (updates.imageFile) {
      try {
        const compressedBlob = await compressImage(updates.imageFile);
        const compressedFile = new File(
          [compressedBlob],
          updates.imageFile.name,
          {
            type: "image/jpeg",
          },
        );

        const formData = new FormData();
        formData.append("image", compressedFile);

        const uploadResult = await uploadProductImageAction(formData);
        if (!uploadResult.success || !uploadResult.assetId) {
          throw new Error(uploadResult.error || "Upload failed");
        }
        imageAssetId = uploadResult.assetId;
      } catch (err: any) {
        toast.error(`Image upload failed: ${err.message || err}`);
        if (productId) {
          setLocalUpdates((prev) => {
            const next = { ...prev };
            delete next[productId];
            return next;
          });
        }
        return;
      }
    }

    // 2. Save product metadata
    startTransition(async () => {
      const result = await saveProductAction({
        productId,
        name: updates.name,
        price: updates.price,
        categoryRefId: updates.categoryRefId,
        description: updates.description,
        imageAssetId,
      });

      if (result.success) {
        toast.success("Product saved successfully! 🎉");
      } else {
        toast.error(result.error || "Failed to save product. Reverting.");
        if (productId) {
          setLocalUpdates((prev) => {
            const next = { ...prev };
            delete next[productId];
            return next;
          });
        }
      }
    });
  };

  return {
    products,
    isPending,
    handleToggleAvailability,
    handleSaveProduct,
  };
}
```

---

### 4. Create Category Dialog Component (`src/components/admin/features/products/createCategoryDialog.tsx`)

Create a dialog popup to add new categories dynamically from the dashboard.

```tsx
// [NEW] src/components/admin/features/products/createCategoryDialog.tsx
"use client";

import { useState } from "react";
import { createCategoryAction } from "@/actions/admin-products";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CreateCategoryDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await createCategoryAction({ name, description });
    setLoading(false);

    if (result.success) {
      toast.success("Category created successfully! 🎉");
      setName("");
      setDescription("");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to create category.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 h-9">
          <Plus className="size-4" /> Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>
            Create a new menu category document in Sanity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Category Name</Label>
            <Input
              id="cat-name"
              placeholder="e.g. Beverages, Pizzas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              placeholder="Provide a brief description of this food category..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[100px]">
              {loading && <Loader2 className="size-4 animate-spin mr-2" />}
              Save Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 5. Update Product Details Sheet (`src/components/admin/features/products/productDetailsSheet.tsx`)

Upgrade the edit sheet to support selecting dynamic category options and choosing image files for canvas compression.

```tsx
// [MODIFY] src/components/admin/features/products/productDetailsSheet.tsx
// Add Category type property and file selector elements:

interface ProductDetailsSheetProps {
  product: ProductSummary | null;
  categories: Array<{ _id: string; name: string }>; // Passed dynamically from server page
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string | undefined, updates: any) => Promise<void>;
  isPending: boolean;
}

// Inside form rendering, add:
// 1. File selector:
const [imageFile, setImageFile] = useState<File | null>(null);

// Inside handleSave:
await onSave(product?._id, {
  name: state.name,
  price: parseFloat(state.price) || 0,
  categoryRefId: state.categoryRefId,
  description: state.description,
  imageFile: imageFile || undefined,
});

// Render Select list dynamically using categories prop:
<Select
  value={state.categoryRefId}
  onValueChange={(val) => dispatch({ type: "SET_FIELD", field: "categoryRefId", value: val })}
>
  <SelectTrigger id="prod-category">
    <SelectValue placeholder="Select Category" />
  </SelectTrigger>
  <SelectContent>
    {(categories || []).map((cat) => (
      <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
    ))}
  </SelectContent>
</Select>

// Render File Selector input:
<div className="space-y-2">
  <Label htmlFor="prod-image" className="text-sm font-medium">Food Image</Label>
  <Input
    id="prod-image"
    type="file"
    accept="image/*"
    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
    className="cursor-pointer"
  />
</div>
```

---

### 6. Update Filter Bar (`src/components/admin/features/products/productsFilterBar.tsx`)

Modify filter bar to accept dynamic categories and render the `CreateCategoryDialog`.

```tsx
// [MODIFY] src/components/admin/features/products/productsFilterBar.tsx
import { CreateCategoryDialog } from "./createCategoryDialog";

interface ProductsFilterBarProps {
  categories: Array<{ _id: string; name: string }>;
}

export function ProductsFilterBar({ categories }: ProductsFilterBarProps) {
  // Render Category Select dynamically:
  <Select value={category} onValueChange={(val) => updateUrlParam("category", val)}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Category" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Categories</SelectItem>
      {(categories || []).map((cat) => (
        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
      ))}
    </SelectContent>
  </Select>

  // Render Dialog next to filters:
  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
     ...
     <CreateCategoryDialog />
  </div>
}
```

---

### 7. Page Integration (`src/app/admin/products/page.tsx`)

Update server page to fetch dynamic categories and pass down parameters.

```tsx
// [MODIFY] src/app/admin/products/page.tsx
import { fetchAdminProductsPaged, fetchAllCategories } from "@/actions/admin-products";

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page || "1");
  const search = resolvedParams.search || "";
  const category = resolvedParams.category || "";
  const available = resolvedParams.available || "";

  const pageSize = 10;

  // Parallel fetch products and categories
  const [{ totalItems, products }, categories] = await Promise.all([
    fetchAdminProductsPaged({
      page: currentPage,
      pageSize,
      search,
      category,
      available,
    }),
    fetchAllCategories(),
  ]);

  return (
     ...
     <ProductsFilterBar categories={categories} />
     ...
     <ProductsTable initialProducts={products} categories={categories} />
  )
}
```

---

## Verification Plan

### Automated Checks

- Compiles successfully: `pnpm tsc --noEmit`

### Manual Scenarios

1. **Category Seeding/Adding:** Click "Add Category" dialog. Create a new category `Pizzas`. Verify that `Pizzas` instantly appears in the search dropdown filters and Product details category selector list.
2. **Product Edit & Compress Image:** Open product sheet, change price, select a 5MB raw image file, and save. Verify that:
   - Client canvas compress runs.
   - The file size is reduced (checked in Sanity database asset size details).
   - Price updates on row instantly.
