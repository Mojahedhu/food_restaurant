# Implementation Plan: Add Delete Action to Admin Orders Table

This plan outlines the conceptual and structural design for adding a delete order action to the admin dashboard, complying with the security, type safety, and optimistic UI standards defined in `plan.md`.

---

## 1. Architectural Flow

---

## 2. Proposed Changes

### A. Server Action: `src/actions/admin-orders.ts`

Implement a new server action `deleteOrderAction` to validate the payload and perform the write action on the database.

- **Security Guard:** Invoke `await assertAdmin()`.
- **Input Validation:** Enforce string validation using a Zod schema.
- **Cache Invalidation:** Call `revalidateTag("orders")` to purge stale server caches.
- **Error Masking:** Capture exceptions in a `try/catch` block, logging the raw trace to the server terminal while returning a standardized `{ success: false, error: ... }` response.

```typescript
import { z } from "zod";

const deleteOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export async function deleteOrderAction(
  orderIdInput: string,
): Promise<{ success: boolean; error?: string }> {
  // 1. Authenticate user role
  const guard = await assertAdmin();
  if (!guard.success) return guard;

  // 2. Validate input format
  const parsed = deleteOrderSchema.safeParse({ orderId: orderIdInput });
  if (!parsed.success) {
    return { success: false, error: "Invalid Order ID structure" };
  }

  const { orderId } = parsed.data;

  try {
    // 3. Perform write mutation on database
    await client.delete(orderId);

    // 4. Force Next.js cache revalidation
    revalidateTag("orders");
    return { success: true };
  } catch (error) {
    // 5. Hide database/technical details from client payload
    console.error(`Failed to delete order ${orderId} in Sanity:`, error);
    return { success: false, error: "An unexpected database error occurred" };
  }
}
```

---

### B. Custom Hook: `src/hooks/useOrdersLogic.ts`

Extend the hook to manage optimistic delete lists.

- **Optimistic Filtering:** Maintain a local `deletedOrderIds` state set.
- **Merge State:** Filter the rendered list to exclude orders pending deletion.
- **Reversion Logic:** Restore the deleted order ID back to the state list if the server request fails.

```typescript
// 1. New state variable in hook:
const [deletedOrderIds, setDeletedOrderIds] = useState<Set<string>>(new Set());

// 2. Filter list in hook:
const orders = initialOrders
  .filter((order) => !deletedOrderIds.has(order._id))
  .map((order) => {
    const update = localUpdates[order._id];
    return update ? { ...order, ...update } : order;
  });

// 3. New handleDeleteOrder method:
const handleDeleteOrder = async (orderId: string) => {
  // Optimistically hide the order from layout
  setDeletedOrderIds((prev) => {
    const next = new Set(prev);
    next.add(orderId);
    return next;
  });

  startTransition(async () => {
    const result = await deleteOrderAction(orderId);

    if (result.success) {
      toast.success("Order deleted successfully! 🗑️");
    } else {
      toast.error(result.error || "Failed to delete order. Reverting changes.");
      // Revert optimistic deletion on failure
      setDeletedOrderIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  });
};
```

---

### C. UI Table Component: `src/components/admin/features/orders/ordersTable.tsx`

Integrate the delete option into the existing dropdown context menu.

- **Dropdown Addition:** Add a **Delete** action trigger with appropriate styling (e.g. `text-destructive`).
- **Modal Confirmation:** Integrate an `AlertDialog` (or confirmation state) to satisfy the **Polished Form UX** rule in `plan.md`, ensuring users do not trigger deletions accidentally.
- **Pending Interaction Lock:** Disable buttons and inputs when `isPending` is active to block concurrent click storms.

```tsx
// Inside ordersTable.tsx:
// 1. Register a state to track which order is queued for deletion
const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

// 2. Add Delete option in DropdownMenuContent:
<DropdownMenuItem
  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
  onClick={() => setDeletingOrderId(order._id)}
  disabled={isPending}
>
  <Trash className="mr-2 h-4 w-4" />
  Delete Order
</DropdownMenuItem>

// 3. Add AlertDialog component at the bottom of the page container:
<AlertDialog open={!!deletingOrderId} onOpenChange={(open) => !open && setDeletingOrderId(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete order #{deletingOrderId?.slice(0, 8).toUpperCase()} from the database.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
      <AlertDialogAction
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        disabled={isPending}
        onClick={async () => {
          if (deletingOrderId) {
            await handleDeleteOrder(deletingOrderId);
            setDeletingOrderId(null);
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

| Constraint                  | Adherence Strategy                                                                                |
| :-------------------------- | :------------------------------------------------------------------------------------------------ |
| **Backend Enforcement**     | The write operation uses Sanity's `.delete(id)` wrapped in a server action.                       |
| **Zero-Trust Role Check**   | `await assertAdmin()` ensures only authenticated administrators trigger the endpoint.             |
| **Zod Input Validation**    | The `orderId` is verified for structure and minimum length before execution.                      |
| **Optimistic UI Updates**   | `deletedOrderIds` hides the order instantly. Toast triggers rollback if the request fails.        |
| **Polished UX Transitions** | Confirmation modals prevent accidental triggers, and input locks block clicking during execution. |
| **Data Consistency**        | Revalidates the page cache using `revalidateTag("orders")` immediately after mutations.           |
