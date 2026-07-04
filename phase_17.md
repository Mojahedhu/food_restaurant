# Implementation Plan: 6-Slot Product Image Gallery & Form Integration

This plan details the implementation for transitioning from a single cover image model to a multi-image gallery supporting up to 6 images per dish.

We will detail the database validation constraints, server action updates, client-side state management, and the bento-style gallery grid UI layout.

**No files in the workspace have been modified.**

---

## 1. Schema Constraints & Validations (Sanity)

Update the schema definition in [food.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/schemaTypes/food.ts) to enforce a minimum of 1 and a maximum of 6 images.

```typescript
// --- src/sanity/schemaTypes/food.ts (replace images field validation) ---
    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
      description: "Upload up to 6 images. The first image in the grid will be used as the primary cover image.",
      validation: (Rule) => Rule.required().min(1).max(6).error("A product must have between 1 and 6 images."),
    }),
```

---

## 2. Server Action Refactoring

We will modify `saveProductAction` inside `src/actions/admin-products.ts` to accept an ordered array of `imageAssetIds` and map them directly to the document fields.

### A. Update Zod Schema

Modify `SaveProductSchema` to replace `imageAssetId` (single string) with `imageAssetIds` (string array):

```typescript
const SaveProductSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.number().positive("Price must be positive"),
  order: z
    .number()
    .int()
    .min(0, "Display order must be a non-negative integer"),
  categoryRefId: z.string().min(1, "Category is required"),
  description: z.string().min(5, "Description is required"),
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
  sizeIds: z.array(z.string()).default([]),
  varietyIds: z.array(z.string()).default([]),
  ingredientIds: z.array(z.string()).default([]),
});
```

### B. Update Document Mapping

Update the `images` field construction inside `saveProductAction`:

```typescript
// B. Build images array from ordered asset IDs
const updatedImages = imageAssetIds.map((assetId, idx) => ({
  _type: "image",
  _key: `img_${assetId}_${idx}`,
  asset: {
    _type: "reference",
    _ref: assetId,
  },
}));

const documentFields: any = {
  name,
  price,
  order,
  category: { _type: "reference", _ref: categoryRefId },
  description,
  PreparationTime: preparationTime || null,
  spiceLevel: spiceLevel === "none" ? null : spiceLevel,
  enableAllSizes,
  featured,
  images: updatedImages, // 👈 Directly assign the mapped array
  sizes: sizeObjects,
  varieties: varietyRefs,
  ingredients: ingredientRefs,
};
```

---

## 3. Client State & Form Architecture

### A. Custom Logic Hook: `src/hooks/useProductsLogic.ts`

We update the parameters of `handleSaveProduct` to pass the ordered array of string asset IDs directly to `saveProductAction`.

```typescript
// --- In useProductsLogic hook ---
interface SaveUpdates {
  name: string;
  price: number;
  order: number;
  categoryRefId: string;
  description: string;
  preparationTime?: number;
  spiceLevel?: string;
  enableAllSizes: boolean;
  featured: boolean;
  imageAssetIds: string[]; // 👈 Array of uploaded Sanity asset IDs
  sizeIds: string[];
  varietyIds: string[];
  ingredientIds: string[];
}

const handleSaveProduct = async (
  productId: string | undefined,
  updates: SaveUpdates,
) => {
  // Note: Individual image uploads are handled on-the-fly when selected.
  // The hook simply passes the compiled list of completed asset IDs.
  startTransition(async () => {
    const result = await saveProductAction({
      productId,
      name: updates.name,
      price: updates.price,
      order: updates.order,
      categoryRefId: updates.categoryRefId,
      description: updates.description,
      preparationTime: updates.preparationTime,
      spiceLevel: updates.spiceLevel,
      enableAllSizes: updates.enableAllSizes,
      featured: updates.featured,
      imageAssetIds: updates.imageAssetIds,
      sizeIds: updates.sizeIds,
      varietyIds: updates.varietyIds,
      ingredientIds: updates.ingredientIds,
    });

    // ... Toast success/error triggers
  });
};
```

### B. Slide-out Sheet: `src/components/admin/features/products/productDetailsSheet.tsx`

We update the local state to hold a list of images (with previews and asset IDs). We design a bento-style grid where the first slot is twice as large as the other five slots.

#### 1. TypeScript Form State & Reducer

```typescript
interface ImageItem {
  assetId: string;
  url: string;
  isUploading?: boolean;
}

interface EditProductState {
  name: string;
  price: string;
  order: string;
  categoryRefId: string;
  description: string;
  preparationTime: string;
  spiceLevel: string;
  enableAllSizes: boolean;
  featured: boolean;
  sizeIds: Array<{ _id: string; name: string }>;
  varietyIds: Array<{ _id: string; name: string }>;
  ingredientIds: Array<{ _id: string; name: string }>;
  images: ImageItem[]; // 👈 Local array for gallery slots
}
```

#### 2. Slot Interactions: Upload, Swap Cover, and Delete

Add handlers to compress and upload images individually as they are selected, and to manipulate the slot positions:

```typescript
// --- In ProductDetailsSheet component ---
const handleUploadSlot = async (index: number, file: File) => {
  // A. Show slot spinner
  dispatch({
    type: "SET_FIELD",
    field: "images",
    value: state.images.map((img, idx) =>
      idx === index ? { ...img, isUploading: true } : img,
    ),
  });

  try {
    // B. Compress and upload
    const compressedBlob = await compressImage(file);
    const compressedFile = new File([compressedBlob], file.name, {
      type: "image/jpeg",
    });
    const formData = new FormData();
    formData.append("image", compressedFile);

    const result = await uploadProductImageAction(formData);
    if (!result.success || !result.assetId) throw new Error(result.error);

    // C. Update slot with returned asset ID
    const newImage: ImageItem = {
      assetId: result.assetId,
      url: URL.createObjectURL(file),
    };

    const updatedImages = [...state.images];
    updatedImages[index] = newImage;

    dispatch({ type: "SET_FIELD", field: "images", value: updatedImages });
    toast.success(`Image ${index + 1} uploaded!`);
  } catch (err) {
    toast.error("Failed to upload image.");
    // Reset slot loading state
    dispatch({
      type: "SET_FIELD",
      field: "images",
      value: state.images.map((img, idx) =>
        idx === index ? { assetId: "", url: "" } : img,
      ),
    });
  }
};

const handleMakeCover = (index: number) => {
  if (index === 0) return;
  const updatedImages = [...state.images];

  // Swap target slot with Slot 0 (cover slot)
  const temp = updatedImages[0];
  updatedImages[0] = updatedImages[index];
  updatedImages[index] = temp;

  dispatch({ type: "SET_FIELD", field: "images", value: updatedImages });
  toast.success("Cover image updated!");
};

const handleDeleteSlot = (index: number) => {
  const updatedImages = [...state.images];
  updatedImages[index] = { assetId: "", url: "" }; // Reset slot to empty

  dispatch({ type: "SET_FIELD", field: "images", value: updatedImages });
};
```

#### 3. Bento Grid UI Render (Tailwind CSS)

```tsx
import { Camera, Trash2, Star, Loader2, ImageIcon } from "lucide-react";

// --- Inside Form Render ---
<div className="space-y-3">
  <Label className="text-sm font-medium">Product Image Gallery (Up to 6)</Label>

  <div className="grid grid-cols-3 gap-3">
    {state.images.map((img, index) => {
      const isCover = index === 0;
      const hasImage = !!img.url;

      return (
        <div
          key={index}
          className={`relative group border border-dashed rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all duration-200 ${
            isCover
              ? "col-span-3 h-48 bg-slate-50/50"
              : "col-span-1 aspect-square bg-slate-50"
          } ${hasImage ? "border-solid border-border" : "border-slate-300 hover:border-primary/50 cursor-pointer"}`}
        >
          {img.isUploading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span className="text-[10px] text-muted-foreground">
                Uploading...
              </span>
            </div>
          ) : hasImage ? (
            <>
              <Image
                src={img.url}
                alt={`Slot ${index + 1}`}
                fill
                className="object-cover"
                sizes={isCover ? "500px" : "150px"}
              />
              {/* Hover Overlay Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                {!isCover && (
                  <Button
                    type="button"
                    onClick={() => handleMakeCover(index)}
                    variant="secondary"
                    size="icon-sm"
                    className="h-8 w-8 hover:cursor-pointer"
                    title="Set as Main Cover"
                  >
                    <Star className="size-4 text-amber-500 fill-current" />
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => handleDeleteSlot(index)}
                  variant="destructive"
                  size="icon-sm"
                  className="h-8 w-8 hover:cursor-pointer"
                  title="Remove Image"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              {isCover && (
                <span className="absolute bottom-2 left-2 px-2.5 py-1 bg-primary text-[10px] font-bold text-white rounded-md shadow-xs">
                  COVER IMAGE
                </span>
              )}
            </>
          ) : (
            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 select-none">
              <Camera className="size-5 text-slate-400 mb-1 group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-slate-500 group-hover:text-primary transition-colors text-center">
                {isCover ? "Upload Cover Image" : `Slot ${index + 1}`}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadSlot(index, file);
                }}
                disabled={isPending}
              />
            </label>
          )}
        </div>
      );
    })}
  </div>
</div>;
```

---

## 4. Reset & Save Mappings

- **Initialization (Reset Action):** When the details sheet is loaded in edit mode, map the existing `product.images` to the first positions in the local images array, and fill the remaining slots with empty items:

  ```typescript
  const loadedImages = (product.images || []).map((img: any) => ({
    assetId: img.asset?._id || "",
    url: img.asset?.url || "",
  }));

  // Pad array to always contain exactly 6 slots
  const paddedImages = [
    ...loadedImages,
    ...Array(Math.max(0, 6 - loadedImages.length))
      .fill(null)
      .map(() => ({ assetId: "", url: "" })),
  ].slice(0, 6);
  ```

- **Saving Payload:** Collect only valid uploaded image asset IDs (filtering out empty slots) and pass them as `imageAssetIds` to `onSave`:

  ```typescript
  const validAssetIds = state.images.map((img) => img.assetId).filter(Boolean); // Filter out empty string IDs

  await onSave(product?._id, {
    ...updates,
    imageAssetIds: validAssetIds,
  });
  ```

# Implementation Plan: 6-Slot Product Image Gallery & Form Integration

This plan details the implementation for transitioning from a single cover image model to a multi-image gallery supporting up to 6 images per dish.

We will detail the database validation constraints, server action updates, client-side state management, image compression rules, and the bento-style gallery grid UI layout.

**No files in the workspace have been modified.**

---

# ==================================================

# Implementation Plan: 6-Slot Product Image Gallery & Form Integration

This plan details the implementation for transitioning from a single cover image model to a multi-image gallery supporting up to 6 images per dish.

We will introduce a dedicated custom hook (`useProductImageGallery.ts`) to manage image compression, upload side effects, slot swapping, and deletions, fully satisfying the Separation of Concerns constraint.

**No files in the workspace have been modified.**

---

## 1. Directory Structure

Ensure the following new file is created:

- `src/hooks/useProductImageGallery.ts` (New custom hook)

---

## 2. Schema Constraints & Validations (Sanity)

Update the schema definition in [food.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/schemaTypes/food.ts) to enforce a minimum of 1 and a maximum of 6 images.

```typescript
// --- src/sanity/schemaTypes/food.ts (replace images field validation) ---
    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
      description: "Upload up to 6 images. The first image in the grid will be used as the primary cover image.",
      validation: (Rule) => Rule.required().min(1).max(6).error("A product must have between 1 and 6 images."),
    }),
```

---

## 3. Server Action Refactoring

We will modify `saveProductAction` inside `src/actions/admin-products.ts` to accept an ordered array of `imageAssetIds` and map them directly to the document fields.

### A. Update Zod Schema

Modify `SaveProductSchema` to replace `imageAssetId` (single string) with `imageAssetIds` (string array):

```typescript
const SaveProductSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.number().positive("Price must be positive"),
  order: z
    .number()
    .int()
    .min(0, "Display order must be a non-negative integer"),
  categoryRefId: z.string().min(1, "Category is required"),
  description: z.string().min(5, "Description is required"),
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
  sizeIds: z.array(z.string()).default([]),
  varietyIds: z.array(z.string()).default([]),
  ingredientIds: z.array(z.string()).default([]),
});
```

### B. Update Document Mapping

Update the `images` field construction inside `saveProductAction`:

```typescript
// B. Build images array from ordered asset IDs
const updatedImages = imageAssetIds.map((assetId, idx) => ({
  _type: "image",
  _key: `img_${assetId}_${idx}`,
  asset: {
    _type: "reference",
    _ref: assetId,
  },
}));

const documentFields: any = {
  name,
  price,
  order,
  category: { _type: "reference", _ref: categoryRefId },
  description,
  PreparationTime: preparationTime || null,
  spiceLevel: spiceLevel === "none" ? null : spiceLevel,
  enableAllSizes,
  featured,
  images: updatedImages, // 👈 Directly assign the mapped array
  sizes: sizeObjects,
  varieties: varietyRefs,
  ingredients: ingredientRefs,
};
```

---

## 4. Client State & Hook Architecture

### A. Custom Logic Hook: `src/hooks/useProductsLogic.ts`

We update the parameters of `handleSaveProduct` to pass the ordered array of string asset IDs directly to `saveProductAction`.

```typescript
// --- In useProductsLogic hook ---
interface SaveUpdates {
  name: string;
  price: number;
  order: number;
  categoryRefId: string;
  description: string;
  preparationTime?: number;
  spiceLevel?: string;
  enableAllSizes: boolean;
  featured: boolean;
  imageAssetIds: string[]; // 👈 Array of uploaded Sanity asset IDs
  sizeIds: string[];
  varietyIds: string[];
  ingredientIds: string[];
}

const handleSaveProduct = async (
  productId: string | undefined,
  updates: SaveUpdates,
) => {
  startTransition(async () => {
    const result = await saveProductAction({
      productId,
      name: updates.name,
      price: updates.price,
      order: updates.order,
      categoryRefId: updates.categoryRefId,
      description: updates.description,
      preparationTime: updates.preparationTime,
      spiceLevel: updates.spiceLevel,
      enableAllSizes: updates.enableAllSizes,
      featured: updates.featured,
      imageAssetIds: updates.imageAssetIds,
      sizeIds: updates.sizeIds,
      varietyIds: updates.varietyIds,
      ingredientIds: updates.ingredientIds,
    });

    // ... Toast success/error triggers
  });
};
```

### B. New Dedicated Image Gallery Hook: `src/hooks/useProductImageGallery.ts`

Isolates all image compression, slot uploads, cover swapping, and deletion handlers.

```typescript
"use client";

import { useState, useEffect } from "react";
import { compressImage } from "@/lib/image-compressor";
import { uploadProductImageAction } from "@/actions/admin-products";
import { toast } from "sonner";

export interface ImageItem {
  assetId: string;
  url: string;
  isUploading?: boolean;
}

export function useProductImageGallery(initialImages: any[], isOpen: boolean) {
  const [images, setImages] = useState<ImageItem[]>([]);

  // Initialize and pad to exactly 6 slots when sheet opens/changes
  useEffect(() => {
    if (isOpen) {
      const loadedImages = (initialImages || []).map((img: any) => ({
        assetId: img.asset?._id || img.assetId || "",
        url: img.asset?.url || img.url || "",
      }));

      const paddedImages = [
        ...loadedImages,
        ...Array(Math.max(0, 6 - loadedImages.length))
          .fill(null)
          .map(() => ({ assetId: "", url: "" })),
      ].slice(0, 6);

      setImages(paddedImages);
    }
  }, [initialImages, isOpen]);

  const handleUploadSlot = async (index: number, file: File) => {
    // Set slot uploading state
    setImages((prev) =>
      prev.map((img, idx) =>
        idx === index ? { ...img, isUploading: true } : img,
      ),
    );

    try {
      // Compress client-side before sending to server action
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name, {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("image", compressedFile);

      const result = await uploadProductImageAction(formData);
      if (!result.success || !result.assetId) throw new Error(result.error);

      const newImage: ImageItem = {
        assetId: result.assetId,
        url: URL.createObjectURL(file),
      };

      setImages((prev) => {
        const next = [...prev];
        next[index] = newImage;
        return next;
      });
      toast.success(`Image ${index + 1} uploaded successfully!`);
    } catch (err) {
      console.error(`Image upload failed for slot ${index + 1}:`, err);
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image.",
      );

      // Reset loading state for this slot
      setImages((prev) =>
        prev.map((img, idx) =>
          idx === index ? { assetId: "", url: "" } : img,
        ),
      );
    }
  };

  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[0];
      next[0] = next[index];
      next[index] = temp;
      return next;
    });
    toast.success("Cover image updated!");
  };

  const handleDeleteSlot = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = { assetId: "", url: "" };
      return next;
    });
  };

  return {
    images,
    handleUploadSlot,
    handleMakeCover,
    handleDeleteSlot,
  };
}
```

---

## 5. Slide-out Sheet Integration: `productDetailsSheet.tsx`

The presentation component consumes the new custom hook, keeping form logic clean.

### A. TypeScript Form State & Reducer

Remove images from `EditProductState` since they are managed by the specialized hook.

```typescript
interface EditProductState {
  name: string;
  price: string;
  order: string;
  categoryRefId: string;
  description: string;
  preparationTime: string;
  spiceLevel: string;
  enableAllSizes: boolean;
  featured: boolean;
  sizeIds: Array<{ _id: string; name: string }>;
  varietyIds: Array<{ _id: string; name: string }>;
  ingredientIds: Array<{ _id: string; name: string }>;
}
```

### B. Consuming the Hook & Save Trigger

```tsx
import { useProductImageGallery } from "@/hooks/useProductImageGallery";

export function ProductDetailsSheet({ product, categories, isOpen, onClose, onSave, isPending, sizes, varieties, ingredients }: ProductDetailsSheetProps) {
  const [state, dispatch] = useReducer(editProductReducer, { ... });

  // Consume image gallery custom hook
  const {
    images,
    handleUploadSlot,
    handleMakeCover,
    handleDeleteSlot,
  } = useProductImageGallery(product?.images || [], isOpen);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Map checkboxes to ID lists
    const sizeStringIds = state.sizeIds.map((s) => s._id);
    const varietyStringIds = state.varietyIds.map((v) => v._id);
    const ingredientStringIds = state.ingredientIds.map((i) => i._id);

    // Extract valid, ordered uploaded asset IDs from gallery hook
    const validAssetIds = images.map((img) => img.assetId).filter(Boolean);

    await onSave(product?._id, {
      name: state.name,
      price: parseFloat(state.price) || 0,
      order: parseInt(state.order, 10) || 0,
      categoryRefId: state.categoryRefId,
      description: state.description,
      preparationTime: state.preparationTime ? parseInt(state.preparationTime, 10) : undefined,
      spiceLevel: state.spiceLevel,
      enableAllSizes: state.enableAllSizes,
      featured: state.featured,
      imageAssetIds: validAssetIds, // 👈 Ordered asset IDs array
      sizeIds: sizeStringIds,
      varietyIds: varietyStringIds,
      ingredientIds: ingredientStringIds,
    });

    onClose();
  };
}
```
