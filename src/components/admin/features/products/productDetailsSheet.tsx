// src/components/admin/features/products/productDetailsSheet.tsx
"use client";
import { ProductSummary } from "@/types/admin";
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
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateSizeDialog } from "./CreateSizeDialog";
import { CreateVarietyDialog } from "./CreateVarietyDialog";
import { CreateIngredientDialog } from "./CreateIngredientDialog";
import ProductFormImageViewer from "./productFormImageViewer";

import { useProductFormState } from "@/hooks/useProductFormState";

// --- Props Definition ---
interface ProductDetailsSheetProps {
  product: ProductSummary | null;
  categories: Array<{ _id: string; name: string }>;
  sizes: Array<{ _id: string; name: string }>;
  varieties: Array<{ _id: string; name: string }>;
  ingredients: Array<{ _id: string; name: string }>;
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

  isPending: boolean;
}

export function ProductDetailsSheet({
  product,
  categories,
  sizes,
  varieties,
  ingredients,
  isOpen,
  onClose,
  onSave,
  isPending,
}: ProductDetailsSheetProps) {
  // Bind form handlers and state to decoupled hook
  const {
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
  } = useProductFormState({ product, isOpen, onClose, onSave });
  if (!isOpen) return null;
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md lg:max-w-xl flex flex-col h-full p-6">
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="text-2xl font-bold">
            {product ? "Edit Menu Dish" : "Add New Dish"}
          </SheetTitle>
          <SheetDescription>
            Set pricing, custom sizes, spice levels, and catalog identifiers.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSave}
          className="flex-1 space-y-6 overflow-y-auto pr-1"
        >
          {/* Image Upload Box with Live Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Food Image</Label>
            {/* <div className="flex flex-col items-center gap-4 p-4 border border-dashed border-border rounded-xl bg-slate-50/50">
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
            </div> */}
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
          </div>
          <div className="px-1 space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="prod-name" className="text-sm font-semibold">
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
              <Label htmlFor="prod-price" className="text-sm font-semibold">
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
              <Label htmlFor="prod-category" className="text-sm font-semibold">
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
              <Label htmlFor="prod-desc" className="text-sm font-semibold">
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

            {/* Inputs for Preparation time and Display Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="order" className="font-semibold">
                  Display Order
                </Label>
                <Input
                  id="order"
                  type="number"
                  value={state.order}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "order",
                      value: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prep" className="font-semibold">
                  Prep Time (mins)
                </Label>
                <Input
                  id="prep"
                  type="number"
                  value={state.preparationTime}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "preparationTime",
                      value: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Spice Level select */}
            <div className="space-y-1.5">
              <Label htmlFor="spice" className="font-semibold">
                Spice Level
              </Label>
              <Select
                value={state.spiceLevel}
                onValueChange={(val) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "spiceLevel",
                    value: val,
                  })
                }
              >
                <SelectTrigger
                  id="spice"
                  className="bg-background hover:cursor-pointer"
                >
                  <SelectValue placeholder="Select Spice Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not Spicy</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="extra-Hot">Extra Hot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Checkbox multi-selectors for Varieties */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Link Menu Varieties</Label>
                <CreateVarietyDialog /> {/* Inline shortcut trigger */}
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-border">
                {varieties.map((v) => {
                  const isChecked = state.varietyIds.some(
                    (id) => id._id === v._id,
                  );
                  return (
                    <label
                      key={v._id}
                      htmlFor={`var-${v._id}`} // 👈 Explicit binding
                      className="flex items-center gap-2.5 text-sm font-normal text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      <Checkbox
                        id={`var-${v._id}`}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleToggleCheckbox("varietyIds", v, checked)
                        }
                      />
                      <span className="leading-none">{v.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Checkbox multi-selectors for Sizes (visible only when enableAllSizes is false) */}
            {/* --- Replace lines 336-386 with this cleaned structure --- */}

            {/* A. Reusable Size Toggles (Always Visible) */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-border">
              {/* Featured Item Switch (NEW) */}
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="featured-toggle"
                    className="font-semibold text-sm"
                  >
                    Featured Product
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Display this food item on the featured landing page
                  </p>
                </div>
                <Switch
                  id="featured-toggle"
                  checked={state.featured}
                  onCheckedChange={(checked) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "featured",
                      value: checked,
                    })
                  }
                />
              </div>

              <hr className="border-border" />

              {/* Enable All Sizes Switch */}
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="enable-all-sizes"
                    className="font-semibold text-sm"
                  >
                    Enable All Sizes
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Ignore custom size lists and serve all options
                  </p>
                </div>
                <Switch
                  id="enable-all-sizes"
                  checked={state.enableAllSizes}
                  onCheckedChange={(checked) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "enableAllSizes",
                      value: checked,
                    })
                  }
                />
              </div>
            </div>

            {/* B. Conditional Sizes Selection List */}
            {!state.enableAllSizes && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Available Sizes</Label>
                  <CreateSizeDialog /> {/* Aligned on the same line */}
                </div>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-border">
                  {sizes.map((s) => {
                    const isChecked = state.sizeIds.some(
                      (id) => id._id === s._id,
                    );
                    return (
                      <label
                        key={s._id}
                        htmlFor={`size-${s._id}`} // 👈 Explicit binding
                        className="flex items-center gap-2.5 text-sm font-normal text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                      >
                        <Checkbox
                          id={`size-${s._id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleToggleCheckbox("sizeIds", s, checked)
                          }
                        />
                        <span className="leading-none">{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Checkbox multi-selectors for Ingredients */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Link Ingredients
                </Label>
                <CreateIngredientDialog /> {/* Inline shortcut trigger */}
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-border">
                {ingredients.map((i) => {
                  const isChecked = state.ingredientIds.some(
                    (stateIng) => stateIng._id === i._id,
                  );
                  return (
                    <label
                      key={i._id}
                      htmlFor={`ing-${i._id}`} // 👈 Explicit binding
                      className="flex items-center gap-2.5 text-sm font-normal text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      <Checkbox
                        id={`ing-${i._id}`}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleToggleCheckbox("ingredientIds", i, checked)
                        }
                      />
                      <span className="leading-none">{i.name}</span>
                    </label>
                  );
                })}
              </div>
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
              disabled={isPending || isImageUploading}
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
