"use client";

import { useState, useEffect } from "react";
import { compressImage } from "@/lib/image-compressor";
import { uploadProductImageAction } from "@/actions/admin-products";
import { toast } from "sonner";
import { ProductSummary } from "@/types/admin";
import z from "zod";

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

export interface InitialImages {
  _type?: string;
  _key?: string;
  asset?: {
    _id?: string;
    _type?: string;
    _ref?: string;
    url?: string;
  };
  assetId?: string;
  url?: string;
}

export function useProductImageGallery(
  product: ProductSummary | null,
  isOpen: boolean,
) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [dragActiveIndex, setDragActiveIndex] = useState<number | null>(null);

  // Initialize and pad to exactly 6 slots when sheet opens/changes
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImages(paddedImages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id, isOpen]);

  // Core upload execution action
  const executeUpload = async (index: number, file: File) => {
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

        // Revoke the old preview URL if it was a blob URL
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

      // Reset loading state for this slot
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

      // Revoke to free up browser memory
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
