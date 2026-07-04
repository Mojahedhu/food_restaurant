# Implementation Plan: Add Product Deletion & Add Product Form

This plan outlines the conceptual and architectural blueprint for adding a **Delete Product Action** and an **Add New Product Form** to the Admin Products management section.

**No files in the workspace have been modified.**

---

## 1. Architectural Flow Diagrams

### Feature 1: Delete Product (Optimistic UI & Cache Revalidation)

### Feature 2: Add New Product Form (Reusing ProductDetailsSheet)

## 2. Proposed Changes

### A. Server Actions: `src/actions/admin-products.ts`

Add a new `deleteProductAction` to safely delete food records from Sanity.

- **Security Guard:** Verify role authorization via `await assertAdmin()`.
- **Input Validation:** Enforce string validation using a Zod schema.
- **Cache Invalidation:** Force cache revalidation using `revalidateTag("products", "max")`.
- **Error Obfuscation:** Capture exceptions in a `try/catch` block, logging details to the server terminal while returning a clean error payload.

```typescript
const DeleteProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

export async function deleteProductAction(
  payload: unknown,
): Promise<{ success: boolean; error?: string }> {
  // 1. Enforce Admin verification
  const guard = await assertAdmin();
  if (!guard.success) return guard;

  // 2. Validate input parameters via Zod
  const parsed = DeleteProductSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: "Invalid Product ID structure" };
  }

  const { productId } = parsed.data;

  try {
    // 3. Delete document from Sanity
    await writeClient.delete(productId);

    // 4. Force cache revalidation
    revalidateTag("products", "max");
    return { success: true };
  } catch (error) {
    // 5. Hide database/technical details from client payload
    console.error(`Failed to delete product ${productId} in Sanity:`, error);
    return { success: false, error: "Failed to delete product from database" };
  }
}
```

---

### B. Custom Hook: `src/hooks/useProductsLogic.ts`

Extend the hook to manage product deletion and optimistic lists.

- **deletedProductIds Set:** Local state tracking optimistically deleted IDs.
- **List Filter:** Filters the computed products array returned to the UI.
- **Delete Transition Handler:** Performs background updates inside `startTransition` and rolls back on failure.

```typescript
// 1. Add deleted IDs state inside useProductsLogic:
const [deletedProductIds, setDeletedProductIds] = useState<Set<string>>(
  new Set(),
);

// 2. Filter the products array inside useProductsLogic:
const products = (initialProducts || [])
  .filter((product) => !deletedProductIds.has(product._id))
  .map((product) => {
    const update = localUpdates[product._id];
    return update ? { ...product, ...update } : product;
  });

// 3. Implement handleDeleteProduct transition:
const handleDeleteProduct = async (productId: string) => {
  // Optimistically remove product from view instantly
  setDeletedProductIds((prev) => {
    const next = new Set(prev);
    next.add(productId);
    return next;
  });

  startTransition(async () => {
    const result = await deleteProductAction({ productId });

    if (result.success) {
      toast.success("Product deleted successfully. 🗑️");
    } else {
      toast.error(result.error || "Failed to delete product. Reverting.");
      // Rollback optimistic update on failure
      setDeletedProductIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  });
};

// 4. Return new properties in the hook's return statement:
return {
  products,
  isPending,
  handleToggleAvailability,
  handleSaveProduct,
  handleDeleteProduct, // Return delete handler
};
```

---

### C. Refactoring the Edit Details Sheet: `src/components/admin/features/products/productDetailsSheet.tsx`

Refactor the existing sheet to support both **Edit Mode** and **Creation Mode** (triggered when `product` is `null` but `isOpen` is `true`).

1.  **Replace Guard Clause:** Swap `if (!product) return null;` at the top of render with `if (!isOpen) return null;`.
2.  **Reset Values on Mode Shift:** Modify `useEffect` to clear form values and preview state if `product` is `null` (creation mode).
3.  **Condition Label Formatting:**
    - Sheet Title: `{product ? "Edit Product" : "Add New Product"}`
    - Description: `{product ? "Update the food item details" : "Create a new food dish and add it to the menu catalog"}`
    - Submit Button Text: `{isPending ? "Saving..." : (product ? "Save Changes" : "Create Product")}`
4.  **Update Save Handler:** Pass `product?._id` (which translates to `undefined` for new products) to the save handler:
    ```typescript
    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      await onSave(product?._id, {
        name: state.name,
        price: parseFloat(state.price) || 0,
        categoryRefId: state.categoryRefId,
        description: state.description,
        imageFile: imageFile || undefined,
      });
      onClose();
    };
    ```

---

### D. Table Component UI: `src/components/admin/features/products/productsTable.tsx`

Refactor `productsTable.tsx` to handle the trigger states, render the Add Product layout, and include deletion warnings.

1.  **Introduce Separate Open State:**
    ```typescript
    const [selectedProduct, setSelectedProduct] =
      useState<ProductSummary | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [deletingProduct, setDeletingProduct] =
      useState<ProductSummary | null>(null);
    ```
2.  **Create "Add Product" Button Control Header:**
    Insert a clean layout header above the `<Table>` component:
    ```tsx
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold text-slate-900">Menu Items</h2>
      <Button
        onClick={() => {
          setSelectedProduct(null); // Creation mode
          setIsSheetOpen(true);
        }}
        className="hover:cursor-pointer shadow-xs"
      >
        <Plus className="size-4 mr-2" /> Add Product
      </Button>
    </div>
    ```
3.  **Insert Delete Action Row Button:**
    Add a red Trash icon next to the Edit icon inside the actions cell:
    ```tsx
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setDeletingProduct(product)}
      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
      disabled={isPending}
    >
      <Trash2 className="size-4" />
    </Button>
    ```
4.  **Include AlertDialog Confirmation Dialog:**
    Prevent accidental deletions by rendering an `<AlertDialog>` component at the bottom of the container:
    ```tsx
    <AlertDialog
      open={!!deletingProduct}
      onOpenChange={(open) => !open && setDeletingProduct(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <strong>{deletingProduct?.name || "Unnamed"}</strong> from the menu
            database. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
            onClick={async () => {
              if (deletingProduct) {
                await handleDeleteProduct(deletingProduct._id);
                setDeletingProduct(null);
              }
            }}
          >
            {isPending ? "Deleting..." : "Confirm Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    ```

---

## 3. Adherence to `plan.md`

| Section in `plan.md`          | Compliance Strategy                                                                 |
| :---------------------------- | :---------------------------------------------------------------------------------- |
| **Backend Enforcement**       | Product mutations and deletions are executed securely via Next.js server actions.   |
| **Zero-Trust Role Check**     | Protects all actions via `assertAdmin()` before modifying the database.             |
| **Zod Input Validation**      | Uses `SafeProductSchema` and `DeleteProductSchema` to guarantee type security.      |
| **Optimistic State updates**  | Immediately filters deleted product items on the client to ensure instant feedback. |
| **UX Polish & Layout shifts** | Implements transaction loading locks and explicit destructive dialog confirmations. |
| **Cache Sync**                | Purges caching layers immediately using `revalidateTag("products")`.                |
