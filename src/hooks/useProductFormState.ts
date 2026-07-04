"use client";

import { useReducer, useEffect } from "react";
import { ProductSummary } from "@/types/admin";
import { useProductImageGallery } from "./useProductImageGallery";
import { toast } from "sonner";

export interface EditProductState {
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

type EditProductAction =
  | {
      type: "SET_FIELD";
      field: keyof EditProductState;
      value: EditProductState[keyof EditProductState];
    }
  | { type: "RESET"; payload: EditProductState };

function editProductReducer(
  state: EditProductState,
  action: EditProductAction,
): EditProductState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return action.payload;
    default:
      return state;
  }
}

interface UseProductFormStateParams {
  product: ProductSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    productId: string | undefined,
    updates: {
      name: string;
      price: number;
      order: number;
      categoryRefId: string;
      description: string;
      preparationTime?: number;
      spiceLevel?: string;
      enableAllSizes: boolean;
      featured: boolean;
      imageAssetIds: string[];
      sizeIds: string[];
      varietyIds: string[];
      ingredientIds: string[];
    },
  ) => Promise<void>;
}

export function useProductFormState({
  product,
  isOpen,
  onClose,
  onSave,
}: UseProductFormStateParams) {
  // 1. Local Reducer for form fields
  const [state, dispatch] = useReducer(editProductReducer, {
    name: "",
    price: "",
    order: "",
    categoryRefId: "",
    description: "",
    preparationTime: "",
    spiceLevel: "none",
    enableAllSizes: false,
    featured: false,
    sizeIds: [],
    varietyIds: [],
    ingredientIds: [],
  });

  // 2. Consume specialized image gallery hook
  const {
    images,
    dragActiveIndex,
    handleDrag,
    handleDrop,
    handleFileSelect,
    handleMakeCover,
    handleDeleteSlot,
  } = useProductImageGallery(product, isOpen);

  // 3. Sync states on product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        dispatch({
          type: "RESET",
          payload: {
            name: product.name || "",
            price: String(product.price || ""),
            order: String(product.order || "0"),
            categoryRefId: product.category?._id || "",
            description: product.description || "",
            preparationTime: String(product.preparationTime || ""),
            spiceLevel: product.spiceLevel || "none",
            enableAllSizes: product.enableAllSizes || false,
            featured: product.featured || false,
            sizeIds: product.sizes || [],
            varietyIds: product.varieties || [],
            ingredientIds: product.ingredients || [],
          },
        });
      } else {
        dispatch({
          type: "RESET",
          payload: {
            name: "",
            price: "",
            order: "",
            categoryRefId: "",
            description: "",
            preparationTime: "",
            spiceLevel: "none",
            enableAllSizes: false,
            featured: false,
            sizeIds: [],
            varietyIds: [],
            ingredientIds: [],
          },
        });
      }
    }
  }, [product, isOpen]);

  // 4. Checkbox toggler logic
  const handleToggleCheckbox = (
    field: "sizeIds" | "varietyIds" | "ingredientIds",
    item: { _id: string; name: string },
    checked: boolean | "indeterminate",
  ) => {
    const list = state[field];
    const nextList =
      checked === true
        ? [...list, item]
        : list.filter((x) => x._id !== item._id);

    dispatch({
      type: "SET_FIELD",
      field,
      value: nextList,
    });
  };

  // 5. Submit validation and mapping logic
  const handleSave = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent saving if uploads are currently active
    const isUploading = images.some((img) => img.isUploading);
    if (isUploading) {
      toast.error("Please wait for all images to finish uploading.");
      return;
    }

    // Require Slot 1 (Cover) presence
    const coverImage = images[0];
    if (!coverImage || !coverImage.assetId) {
      toast.error("A main Cover Image (Slot 1) is required to save.");
      return;
    }

    const sizeStringIds = state.sizeIds.map((s) => s._id);
    const varietyStringIds = state.varietyIds.map((v) => v._id);
    const ingredientStringIds = state.ingredientIds.map((i) => i._id);
    const validAssetIds = images.map((img) => img.assetId).filter(Boolean);

    await onSave(product?._id, {
      name: state.name,
      price: parseFloat(state.price) || 0,
      order: parseInt(state.order, 10) || 0,
      categoryRefId: state.categoryRefId,
      description: state.description,
      preparationTime: state.preparationTime
        ? parseInt(state.preparationTime, 10)
        : undefined,
      spiceLevel: state.spiceLevel,
      enableAllSizes: state.enableAllSizes,
      featured: state.featured,
      imageAssetIds: validAssetIds,
      sizeIds: sizeStringIds,
      varietyIds: varietyStringIds,
      ingredientIds: ingredientStringIds,
    });

    onClose();
  };

  const isImageUploading = images.some((img) => img.isUploading);

  return {
    state,
    images,
    isImageUploading,
    dispatch,
    handleToggleCheckbox,
    handleSave,
    dragActiveIndex,
    handleDrag,
    handleDrop,
    handleFileSelect,
    handleMakeCover,
    handleDeleteSlot,
  };
}
