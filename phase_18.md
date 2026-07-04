# Implementation Plan: Drag-and-Drop Image Upload Feature (Logic Decoupled)

To strictly follow **Separation of Concerns (Rule 7)**, we will delegate all Drag-and-Drop state hook variables, drag/drop event handlers, file selection bindings, and Zod validations out of the presentation component and into our existing custom hook: `useProductImageGallery.ts`.

This keeps `productFormImageViewer.tsx` completely presentation-only.

---

## 1. Decoupled Logic: `src/hooks/useProductImageGallery.ts`

Modify the custom hook to handle the `dragActiveIndex` state, drag-over triggers, dropped files Zod validation, and file-select mappings:

```typescript
"use client";

import { useState, useEffect } from "react";
import { compressImage } from "@/lib/image-compressor";
import { uploadProductImageAction } from "@/actions/admin-products";
import { toast } from "sonner";
import { ProductSummary } from "@/types/admin";
import { z } from "zod";

export interface ImageItem {
  assetId: string;
  url: string;
  isUploading?: boolean;
}

// 1. Zod File validation schema
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const ClientFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= MAX_FILE_SIZE,
    "File size must be less than 5MB",
  )
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only JPG, JPEG, PNG, and WEBP formats are supported",
  );

export function useProductImageGallery(
  product: ProductSummary | null,
  isOpen: boolean,
) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [dragActiveIndex, setDragActiveIndex] = useState<number | null>(null);

  // Initialize and pad to exactly 6 slots
  useEffect(() => {
    if (isOpen) {
      const initialImages = (product?.images || []) as {
        asset?: { _id: string; url: string } | undefined;
        _key: string;
        assetId?: string;
        url?: string;
      }[];
      const loadedImages = (initialImages || []).map((img) => ({
        assetId: img.asset?._id || img.assetId || "",
        url: img.asset?.url || img.url || "",
      }));

      const paddedImages: ImageItem[] = [
        ...loadedImages,
        ...Array.from(
          { length: Math.max(0, 6 - loadedImages.length) },
          (): ImageItem => ({ assetId: "", url: "" }),
        ),
      ].slice(0, 6);
      setImages(paddedImages);
    }
  }, [product?._id, isOpen]);

  // Core upload execution action
  const executeUpload = async (index: number, file: File) => {
    setImages((prev) =>
      prev.map((img, idx) =>
        idx === index ? { ...img, isUploading: true } : img,
      ),
    );

    try {
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
        const oldImage = next[index];
        if (oldImage.url && oldImage.url.startsWith("blob:")) {
          URL.revokeObjectURL(oldImage.url);
        }
        next[index] = newImage;
        return next;
      });
      toast.success(`Image ${index + 1} uploaded successfully!`);
    } catch (err) {
      console.error(`Image upload failed for slot ${index + 1}:`, err);
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image.",
      );

      // Reset slot states
      setImages((prev) =>
        prev.map((img, idx) =>
          idx === index ? { assetId: "", url: "" } : img,
        ),
      );
    }
  };

  // Drag event listeners
  const handleDrag = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveIndex(index);
    } else if (e.type === "dragleave") {
      setDragActiveIndex(null);
    }
  };

  // Drop event listeners
  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveIndex(null);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const parsed = ClientFileSchema.safeParse(file);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        return;
      }
      executeUpload(index, file);
    }
  };

  // File Select event listeners
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const parsed = ClientFileSchema.safeParse(file);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        return;
      }
      executeUpload(index, file);
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
      const target = next[index];
      if (target.url && target.url.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
      }
      next[index] = { assetId: "", url: "" };
      return next;
    });
  };

  return {
    images,
    dragActiveIndex,
    handleDrag,
    handleDrop,
    handleFileSelect,
    handleMakeCover,
    handleDeleteSlot,
  };
}
```

---

## 2. Lean Presentation UI: `src/components/admin/features/products/productFormImageViewer.tsx`

Refactor the presentation component to simply bind layout properties to parameters. It is now completely layout-only:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Trash2, Star, Loader2 } from "lucide-react";
import Image from "next/image";
import { ImageItem } from "@/hooks/useProductImageGallery";

interface ProductFormImageViewerProps {
  images: ImageItem[];
  dragActiveIndex: number | null;
  handleDrag: (e: React.DragEvent, index: number) => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  handleFileSelect: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => void;
  handleMakeCover: (index: number) => void;
  handleDeleteSlot: (index: number) => void;
  isPending: boolean;
}

function ProductFormImageViewer({
  images,
  dragActiveIndex,
  handleDrag,
  handleDrop,
  handleFileSelect,
  handleMakeCover,
  handleDeleteSlot,
  isPending,
}: ProductFormImageViewerProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        Product Image Gallery (Up to 6)
      </Label>

      <div className="grid grid-cols-3 gap-3">
        {images.map((img, index) => {
          const isCover = index === 0;
          const hasImage = !!img.url;
          const isDragActive = dragActiveIndex === index;

          return (
            <div
              key={index}
              className={`relative group border border-dashed rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all duration-200 ${
                isCover
                  ? "col-span-3 h-48 bg-slate-50/50 dark:bg-slate-900/10"
                  : "col-span-1 aspect-square bg-slate-50 dark:bg-slate-900/20"
              } ${hasImage ? "border-solid border-border" : "border-slate-300 hover:border-primary/50"} ${
                isDragActive ? "border-primary bg-primary/5 scale-[1.01]" : ""
              }`}
            >
              {img.isUploading ? (
                <div className="flex flex-col items-center gap-1.5 p-4">
                  <Loader2 className="size-5 animate-spin text-primary" />
                  <span className="text-[10px] text-muted-foreground font-medium animate-pulse">
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
                  {/* Hover Actions Overlay */}
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
                <label
                  tabIndex={0}
                  role="button"
                  aria-label={
                    isCover
                      ? "Upload Cover Image"
                      : `Upload Image Slot ${index + 1}`
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.currentTarget.querySelector("input")?.click();
                    }
                  }}
                  onDragEnter={(e) => handleDrag(e, index)}
                  onDragOver={(e) => handleDrag(e, index)}
                  onDragLeave={(e) => handleDrag(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
                >
                  <Camera
                    className={`size-5 mb-1 transition-colors ${isDragActive ? "text-primary" : "text-slate-400 group-hover:text-primary"}`}
                  />
                  <span
                    className={`text-[10px] text-center transition-colors ${isDragActive ? "text-primary font-medium" : "text-slate-500 group-hover:text-primary"}`}
                  >
                    {isDragActive
                      ? "Drop file here"
                      : isCover
                        ? "Upload Cover Image"
                        : `Slot ${index + 1}`}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, index)}
                    disabled={isPending}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProductFormImageViewer;
```

---

## 3. Form Sheet Integration: `src/components/admin/features/products/productDetailsSheet.tsx`

Pass down the newly decoupled drag states and events to the layout viewer element:

```tsx
// --- In productDetailsSheet.tsx ---
// inside ProductDetailsSheet layout rendering:

<ProductFormImageViewer
  images={images}
  dragActiveIndex={dragActiveIndex} // 👈 Added parameters
  handleDrag={handleDrag} // 👈 Added parameters
  handleDrop={handleDrop} // 👈 Added parameters
  handleFileSelect={handleFileSelect} // 👈 Added parameters
  handleMakeCover={handleMakeCover}
  handleDeleteSlot={handleDeleteSlot}
  isPending={isPending}
/>
```
