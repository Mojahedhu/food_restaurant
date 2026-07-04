# Implementation Plan: Rich Product Form & Split Deletion Component

This updated plan details the implementation for:

1.  **Comprehensive Product Creation Form:** Extending the form sheet to support all fields from the Sanity `food` schema (including Category, Varieties, Sizes, Ingredients, Prep Time, Spice Level, Display Order, and Featured flag).
2.  **Split Delete Dialog (`AlertFoodDelete`):** Factoring the deletion confirmation modal out into a standalone reusable component.

**No files in the workspace have been modified.**

---

## 1. Directory Structure

Ensure the following new file is created:

- `src/components/admin/features/products/AlertFoodDelete.tsx` (New component)

---

## 2. Architectural Data Mapping

### Schema Fields to Form UI Inputs

| Sanity Schema Field | Form UI Field Type                        | Source Data (Parallel Server Fetch)     |
| :------------------ | :---------------------------------------- | :-------------------------------------- |
| `name`              | Text Input (Required)                     | -                                       |
| `price`             | Number Input (Required)                   | -                                       |
| `order`             | Number Input (Required)                   | Checked for database uniqueness on save |
| `PreparationTime`   | Number Input (Optional)                   | -                                       |
| `category`          | Select Dropdown (Required)                | `*[_type == "category"]`                |
| `spiceLevel`        | Select Dropdown (Optional)                | Mild, Medium, Hot, Extra Hot            |
| `description`       | Textarea (Required)                       | -                                       |
| `enableAllSizes`    | Switch/Toggle                             | -                                       |
| `sizes`             | Checkbox Group (Hidden if enableAllSizes) | `*[_type == "size"]`                    |
| `varieties`         | Checkbox Group (Optional)                 | `*[_type == "foodVariety"]`             |
| `ingredients`       | Checkbox Group (Optional)                 | `*[_type == "ingredient"]`              |
| `featured`          | Switch/Toggle                             | -                                       |
| `images`            | File Upload Box                           | Uploads to Sanity writeClient assets    |

---

## 3. Component & File Blueprints

### A. New Component: `src/components/admin/features/products/AlertFoodDelete.tsx`

A standalone delete action dialog component.

```tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AlertFoodDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  isPending: boolean;
}

export function AlertFoodDelete({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isPending,
}: AlertFoodDeleteProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-slate-900">
            Confirm Product Deletion
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
            Are you absolutely sure you want to delete{" "}
            <strong>{productName}</strong>? This will permanently purge this
            dish from the menu catalog and website.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel disabled={isPending} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete Dish"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

### B. Server Actions Updates: `src/actions/admin-products.ts`

Add reference fetching functions and update `saveProductAction` to process the new fields.

```typescript
// 1. Fetching helper functions:
export async function fetchAllVarieties() {
  await checkAdmin();
  try {
    const query = groq`*[_type == "foodVariety"] | order(name asc) { _id, name }`;
    const { data } = await sanityFetch({
      query,
      params: {},
      tags: ["varieties"],
    });
    return data as Array<{ _id: string; name: string }>;
  } catch (error) {
    console.error("Failed to fetch varieties:", error);
    return [];
  }
}

export async function fetchAllSizes() {
  await checkAdmin();
  try {
    const query = groq`*[_type == "size"] | order(name asc) { _id, name }`;
    const { data } = await sanityFetch({ query, params: {}, tags: ["sizes"] });
    return data as Array<{ _id: string; name: string }>;
  } catch (error) {
    console.error("Failed to fetch sizes:", error);
    return [];
  }
}

export async function fetchAllIngredients() {
  await checkAdmin();
  try {
    const query = groq`*[_type == "ingredient"] | order(name asc) { _id, name }`;
    const { data } = await sanityFetch({
      query,
      params: {},
      tags: ["ingredients"],
    });
    return data as Array<{ _id: string; name: string }>;
  } catch (error) {
    console.error("Failed to fetch ingredients:", error);
    return [];
  }
}

// 2. Updated Save Product Validation Schema:
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
  imageAssetId: z.string().optional(),
  sizeIds: z.array(z.string()).default([]),
  varietyIds: z.array(z.string()).default([]),
  ingredientIds: z.array(z.string()).default([]),
});

// 3. Updated saveProductAction implementation:
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

    const {
      productId,
      name,
      price,
      order,
      categoryRefId,
      description,
      preparationTime,
      spiceLevel,
      enableAllSizes,
      featured,
      imageAssetId,
      sizeIds,
      varietyIds,
      ingredientIds,
    } = parsed.data;

    // A. Enforce Order uniqueness (Admin validation check)
    const orderConflict = await client.fetch(
      groq`*[_type == "food" && order == $order && !(_id in [$id, "drafts." + $id])][0]`,
      { order, id: productId || "" },
    );
    if (orderConflict) {
      return {
        success: false,
        error: `Display Order ${order} is already assigned to "${orderConflict.name}"`,
      };
    }

    // B. Build image object if newly uploaded
    let updatedImages: any = undefined;
    if (imageAssetId) {
      const newImageObj = {
        _type: "image",
        _key: `img_${Date.now()}`,
        asset: { _type: "reference", _ref: imageAssetId },
      };
      if (productId) {
        const existingDoc = await client.fetch(
          groq`*[_id == $id][0] { images }`,
          { id: productId },
        );
        const currentImages = existingDoc?.images || [];
        updatedImages = [newImageObj, ...currentImages.slice(1)];
      } else {
        updatedImages = [newImageObj];
      }
    }

    // C. Format reference lists
    const sizeObjects = sizeIds.map((sid) => ({
      _key: `sz_${sid}`,
      size: { _type: "reference", _ref: sid },
    }));

    const varietyRefs = varietyIds.map((vid) => ({
      _type: "reference",
      _ref: vid,
      _key: `var_${vid}`,
    }));

    const ingredientRefs = ingredientIds.map((iid) => ({
      _type: "reference",
      _ref: iid,
      _key: `ing_${iid}`,
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
      sizes: sizeObjects,
      varieties: varietyRefs,
      ingredients: ingredientRefs,
    };

    if (updatedImages) {
      documentFields.images = updatedImages;
    }

    if (productId) {
      await writeClient.patch(productId).set(documentFields).commit();
    } else {
      // Auto-generate a clean slug from name
      const slugValue = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-");
      await writeClient.create({
        _type: "food",
        slug: { _type: "slug", current: slugValue },
        available: true,
        ...documentFields,
      });
    }

    revalidateTag("products", "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to save product:", error);
    return { success: false, error: "Failed to persist product metadata." };
  }
}
```

---

### C. Server Page: `src/app/admin/products/page.tsx`

Fetch reference datasets in parallel and pass them to the client table wrapper.

```tsx
export default async function AdminProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page || "1");
  const search = resolvedParams.search || "";
  const category = resolvedParams.category || "";
  const available = resolvedParams.available || "";
  const pageSize = 10;

  // Fetch product items and all reference data sets in parallel on the server
  const [{ totalItems, products }, categories, varieties, sizes, ingredients] =
    await Promise.all([
      fetchAdminProductsPaged({
        page: currentPage,
        pageSize,
        search,
        category,
        available,
      }),
      fetchAllCategories(),
      fetchAllVarieties(),
      fetchAllSizes(),
      fetchAllIngredients(),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your food items catalog ({totalItems} items).
          </p>
        </div>
      </div>

      <ProductsFilterBar categories={categories} />

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden p-6">
        <Suspense fallback={<ProductsTableSkeleton />}>
          <ProductsTable
            initialProducts={products}
            categories={categories}
            varieties={varieties}
            sizes={sizes}
            ingredients={ingredients}
          />
          <PaginationControls
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
          />
        </Suspense>
      </div>
    </div>
  );
}
```

---

### D. Custom Hook: `src/hooks/useProductsLogic.ts`

Expand `handleSaveProduct` to accept the extended fields array.

```typescript
const handleSaveProduct = async (
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
    imageFile?: File;
    sizeIds: string[];
    varietyIds: string[];
    ingredientIds: string[];
  },
) => {
  // Compress and Upload asset triggers (same logic)
  // ...
  startTransition(async () => {
    const result = await saveProductAction({
      productId,
      ...updates,
      imageAssetId,
    });
    // ...
  });
};
```

---

### E. Expanded Product Form: `src/components/admin/features/products/productDetailsSheet.tsx`

Fully styled with responsive form controls matching the design guidelines.

```tsx
// Form State Reducer Type
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
  sizeIds: string[];
  varietyIds: string[];
  ingredientIds: string[];
}

export function ProductDetailsSheet({
  product,
  categories,
  varieties,
  sizes,
  ingredients,
  isOpen,
  onClose,
  onSave,
  isPending,
}: ProductDetailsSheetProps) {
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

  // Handle image selections ...

  useEffect(() => {
    if (isOpen) {
      if (product) {
        // Load Edit Mode
        dispatch({
          type: "RESET",
          payload: {
            name: product.name || "",
            price: String(product.price || ""),
            order: String(product.order || "0"),
            categoryRefId: product.category?._id || "",
            description: product.description || "",
            preparationTime: String(product.PreparationTime || ""),
            spiceLevel: product.spiceLevel || "none",
            enableAllSizes: product.enableAllSizes || false,
            featured: product.featured || false,
            sizeIds: (product.sizes || []).map((s: any) => s.size?._ref).filter(Boolean),
            varietyIds: (product.varieties || []).map((v: any) => v._ref).filter(Boolean),
            ingredientIds: (product.ingredients || []).map((i: any) => i._ref).filter(Boolean),
          }
        });
      } else {
        // Reset for Creation Mode
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
          }
        });
      }
    }
  }, [product, isOpen]);

  // Form rendering incorporating all fields
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md lg:max-w-xl flex flex-col h-full p-6">
        <SheetHeader className="text-left mb-4">
          <SheetTitle>{product ? "Edit Menu Dish" : "Add New Dish"}</SheetTitle>
          <SheetDescription>Set pricing, custom sizes, spice levels, and catalog identifiers.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSave} className="flex-1 space-y-5 overflow-y-auto pr-1">
          {/* Inputs for Name, Price, Display Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="order">Display Order</Label>
              <Input id="order" type="number" value={state.order} onChange={...} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prep">Prep Time (mins)</Label>
              <Input id="prep" type="number" value={state.preparationTime} onChange={...} />
            </div>
          </div>

          {/* Spice Level select */}
          <div className="space-y-1.5">
            <Label htmlFor="spice">Spice Level</Label>
            <Select value={state.spiceLevel} onValueChange={...}>
               <SelectItem value="none">Not Spicy</SelectItem>
               <SelectItem value="mild">Mild</SelectItem>
               <SelectItem value="medium">Medium</SelectItem>
               <SelectItem value="hot">Hot</SelectItem>
               <SelectItem value="extra-Hot">Extra Hot</SelectItem>
            </Select>
          </div>

          {/* Checkbox multi-selectors for Sizes, Varieties, Ingredients */}
          <div className="space-y-2">
            <Label>Link Menu Varieties</Label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border">
              {varieties.map((v) => (
                 <label key={v._id} className="flex items-center gap-2 text-xs">
                   <Checkbox checked={state.varietyIds.includes(v._id)} onCheckedChange={...} />
                   {v.name}
                 </label>
              ))}
            </div>
          </div>

          {/* Toggles for Enable All Sizes & Featured */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
            <div>
              <Label>Enable All Sizes</Label>
              <p className="text-[10px] text-muted-foreground">Ignore size selector check list</p>
            </div>
            <Switch checked={state.enableAllSizes} onCheckedChange={...} />
          </div>

          {/* Submit buttons */}
        </form>
      </SheetContent>
    </Sheet>
  );
}
```

---

### F. Table Component UI: `src/components/admin/features/products/productsTable.tsx`

Render the split `AlertFoodDelete` component instead of inline alert elements.

```tsx
import { AlertFoodDelete } from "./AlertFoodDelete";

export function ProductsTable({
  initialProducts,
  categories,
  varieties,
  sizes,
  ingredients,
}) {
  const {
    products,
    isPending,
    handleToggleAvailability,
    handleSaveProduct,
    handleDeleteProduct,
  } = useProductsLogic(initialProducts);

  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductSummary | null>(
    null,
  );

  return (
    <div className="relative w-full overflow-auto">
      {/* Control Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Menu Items</h2>
        <Button
          onClick={() => {
            setSelectedProduct(null);
            setIsSheetOpen(true);
          }}
        >
          <Plus className="size-4 mr-2" /> Add Product
        </Button>
      </div>

      <Table>...</Table>

      <ProductDetailsSheet
        product={selectedProduct}
        categories={categories}
        varieties={varieties}
        sizes={sizes}
        ingredients={ingredients}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSave={handleSaveProduct}
        isPending={isPending}
      />

      <AlertFoodDelete
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        productName={deletingProduct?.name || ""}
        isPending={isPending}
        onConfirm={async () => {
          if (deletingProduct) {
            await handleDeleteProduct(deletingProduct._id);
            setDeletingProduct(null);
          }
        }}
      />
    </div>
  );
}
```
