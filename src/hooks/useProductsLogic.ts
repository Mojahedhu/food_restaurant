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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      } catch (err: unknown) {
        console.error("err in useProductsLogic: ", err);
        if (err instanceof Error) {
          toast.error(`Image upload failed: ${err.message}`);
        } else {
          toast.error("Image upload failed");
        }
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
