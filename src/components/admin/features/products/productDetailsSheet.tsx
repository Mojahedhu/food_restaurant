// src/components/admin/features/products/productDetailsSheet.tsx
"use client";

import { useReducer, useEffect, useState } from "react";
import { ProductSummary } from "@/types/admin";
import { getImageUrl } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, ImageIcon } from "lucide-react";
import Image from "next/image";

// --- Form State Types & Reducer ---
interface EditProductState {
  name: string;
  price: string;
  categoryRefId: string;
  description: string;
}

type EditProductAction =
  | { type: "SET_FIELD"; field: keyof EditProductState; value: string }
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

// --- Props Definition ---
interface ProductDetailsSheetProps {
  product: ProductSummary | null;
  categories: Array<{ _id: string; name: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    productId: string | undefined,
    updates: {
      name: string;
      price: number;
      categoryRefId: string;
      description?: string;
      imageFile?: File;
    },
  ) => Promise<void>;
  isPending: boolean;
}

export function ProductDetailsSheet({
  product,
  categories,
  isOpen,
  onClose,
  onSave,
  isPending,
}: ProductDetailsSheetProps) {
  // 1. Initialize Reducer for Text fields
  const [state, dispatch] = useReducer(editProductReducer, {
    name: "",
    price: "",
    categoryRefId: "",
    description: "",
  });

  // 2. Initialize Image & Preview state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // 3. Reset form states when target product changes
  useEffect(() => {
    if (product) {
      dispatch({
        type: "RESET",
        payload: {
          name: product.name || "",
          price: String(product.price || ""),
          categoryRefId: product.category?._id || "",
          description: product.description || "",
        },
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImageFile(null);

      // Determine initial image preview
      const foodImage = product.images?.[0] || "";
      const displayImage = getImageUrl(foodImage);
      setPreviewUrl(displayImage || "");
    }
  }, [product]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle local image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      // Revert to database image if cleared
      const foodImage = product?.images?.[0] || "";
      const displayImage = getImageUrl(foodImage);
      setPreviewUrl(displayImage || "");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    await onSave(product._id, {
      name: state.name,
      price: parseFloat(state.price) || 0,
      categoryRefId: state.categoryRefId,
      description: state.description,
      imageFile: imageFile || undefined,
    });

    onClose();
  };

  if (!product) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md lg:max-w-xl flex flex-col h-full p-6">
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="text-2xl font-bold">Edit Product</SheetTitle>
          <SheetDescription>
            Update the food item name, price, category, or availability status.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSave}
          className="flex-1 space-y-6 overflow-y-auto pr-1"
        >
          {/* Image Upload Box with Live Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Food Image</Label>
            <div className="flex flex-col items-center gap-4 p-4 border border-dashed border-border rounded-xl bg-slate-50/50">
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-border bg-slate-100 flex items-center justify-center shadow-sm">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <ImageIcon className="size-8 text-muted-foreground opacity-40" />
                )}
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card border border-border text-sm font-semibold rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 transition-colors duration-200">
                <Upload className="size-4 text-muted-foreground" />
                Upload New Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isPending}
                />
              </label>
            </div>
          </div>
          <div className="px-1">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="prod-name" className="text-sm font-medium">
                Food Name
              </Label>
              <Input
                id="prod-name"
                placeholder="e.g. Garlic Cheese Bread"
                value={state.name}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "name",
                    value: e.target.value,
                  })
                }
                required
                disabled={isPending}
              />
            </div>

            {/* Price Field */}
            <div className="space-y-2">
              <Label htmlFor="prod-price" className="text-sm font-medium">
                Price ($)
              </Label>
              <Input
                id="prod-price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={state.price}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "price",
                    value: e.target.value,
                  })
                }
                required
                disabled={isPending}
              />
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <Label htmlFor="prod-category" className="text-sm font-medium">
                Category
              </Label>
              <Select
                value={state.categoryRefId}
                onValueChange={(val) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "categoryRefId",
                    value: val,
                  })
                }
                disabled={isPending}
              >
                <SelectTrigger
                  id="prod-category"
                  className="bg-background hover:cursor-pointer"
                >
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {(categories || []).map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="prod-desc" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="prod-desc"
                placeholder="Enter product description..."
                rows={4}
                value={state.description}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "description",
                    value: e.target.value,
                  })
                }
                className="resize-none"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              className=" hover:cursor-pointer"
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[110px] hover:cursor-pointer"
            >
              {isPending && <Loader2 className="size-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
