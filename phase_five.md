# Phase 5: Logic & Mutations (Optimistic UI & Server Actions)

This phase ties the entire dashboard together by implementing the secure server action to mutate our Sanity order document, creating a custom React 19 hook to handle concurrent state transitions and optimistic UI updates, and connecting the components.

Below is the complete code blueprint for your manual implementation:

1. The Server Action Mutation (src/actions/admin-orders.ts)
   We will add a new server mutation action. It imports the write-configured client (writeClient) from @/sanity/lib/client to update the status, payment status, dynamic items, and total order price inside Sanity, then revalidates cache tags to trigger the Live Preview sync instantly.

```typescript
// Add to src/actions/admin-orders.ts
"use server";
import { writeClient } from "@/sanity/lib/client";
import { revalidateTag } from "next/cache";
/**

- Mutates an order document in Sanity CMS using the writeClient.
- Revalidates the 'orders' cache tag to update the live preview sync.
*/
export async function updateOrderAction(
  orderId: string,
  updates: {
    paymentStatus: string;
    statusRefId: string;
    items: Array<{
      foodId?: string;
      name?: string;
      image?: string;
      price?: number;
      quantity?: number;
      size?: string;
      variety?: string;
      _key: string;
    }>;
    total: number;
  },
) {
  try {
    // Perform standard transaction patch using the authorized write client
    await writeClient
      .patch(orderId)
      .set({
        paymentStatus: updates.paymentStatus,
        status: {
          _type: "reference",
          _ref: updates.statusRefId,
        },
        items: updates.items,
        total: updates.total,
      })
      .commit();
    // Revalidate tag for live previews sync
    revalidateTag("orders");
    return { success: true };
  } catch (error) {
    console.error("Failed to update order in Sanity:", error);
    return { success: false, error: "Failed to save updates in database" };
  }
}
```

2. Custom React Hook for Optimistic Updates (src/hooks/useOrdersLogic.ts)
   We use React 19's native useTransition hook to perform seamless background operations and provide instantaneous visual feedback in the UI list via an eventually-consistent override dictionary pattern.

```typescript
// src/hooks/useOrdersLogic.ts
"use client";

import { useTransition, useState, useEffect } from "react";
import { OrderSummary } from "@/types/admin";
import { updateOrderAction } from "@/actions/admin-orders";
import { toast } from "sonner"; // Assuming you have sonner installed based on project standard

export function useOrdersLogic(initialOrders: OrderSummary[]) {
  // 1. Setup useTransition for non-blocking server mutations
  const [isPending, startTransition] = useTransition();

  // 2. Dictionary to store local overrides: { [orderId]: Partial<OrderSummary> }
  const [localUpdates, setLocalUpdates] = useState<
    Record<string, Partial<OrderSummary>>
  >({});

  // Sync and clean up local overrides when server data catches up
  useEffect(() => {
    setLocalUpdates((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const orderId in next) {
        const serverOrder = initialOrders.find((o) => o._id === orderId);
        const localUpdate = next[orderId];

        if (serverOrder) {
          const isPaymentSynced =
            serverOrder.paymentStatus === localUpdate.paymentStatus;
          const isStatusSynced =
            !localUpdate.status ||
            serverOrder.status?._ref === localUpdate.status?._ref;

          // If the server props have caught up to our updates, remove the local override
          if (isPaymentSynced && isStatusSynced) {
            delete next[orderId];
            changed = true;
          }
        }
      }

      return changed ? next : prev;
    });
  }, [initialOrders]);

  // 3. Merge server data with active local overrides
  const orders = initialOrders.map((order) => {
    const update = localUpdates[order._id];
    return update ? { ...order, ...update } : order;
  });

  const handleUpdateOrder = async (
    orderId: string,
    updates: {
      paymentStatus: string;
      statusRefId: string;
      items: OrderSummary["items"];
      total: number;
    }
  ) => {
    // 1. Instantly apply local override (optimistic UI update)
    setLocalUpdates((prev) => ({
      ...prev,
      [orderId]: {
        paymentStatus: updates.paymentStatus as "paid" | "pending" | "failed",
        status: {
          _type: "reference",
          _ref: updates.statusRefId,
        },
        items: updates.items,
        total: updates.total,
      },
    }));

    // 2. Perform background update inside transition
    startTransition(async () => {
      const result = await updateOrderAction(orderId, updates);

      if (result.success) {
        toast.success("Order updated successfully! 🎉");
      } else {
        toast.error("Failed to update order. Reverting changes.");
        // Revert local override on failure
        setLocalUpdates((prev) => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
      }
    });
  };

  return {
    orders,
    isPending,
    handleUpdateOrder,
  };
}
```

3. Integrating into the Main Table (src/components/admin/features/orders/ordersTable.tsx)
   Finally, update ordersTable.tsx to pull and render the optimistic dataset and hook the Sheet's save handler to the logic hook:

```tsx
// Inside src/components/admin/features/orders/ordersTable.tsx
"use client";
import { useState } from "react";
import { OrderSummary } from "@/types/admin";
import { useOrdersLogic } from "@/hooks/useOrdersLogic"; // Import logic hook
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { MoreHorizontal, FileText, CheckCircle2, Truck } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderDetailsSheet } from "./orderDetailsSheet";
interface OrdersTableProps {
  initialOrders: OrderSummary[];
}
export function OrdersTable({ initialOrders }: OrdersTableProps) {
  // Use custom optimistic hook
  const { orders, isPending, handleUpdateOrder } =
    useOrdersLogic(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case "paid":
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-accent";
      case "failed":
        return "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20";
      case "pending":
      default:
        return "bg-amber-100/80 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
    }
  };

  const getOrderStatusLabel = (refId?: string) => {
    switch (refId) {
      case "status-placed":
        return "Placed";
      case "status-confirmed":
        return "Confirmed";
      case "status-preparing":
        return "Preparing";
      case "status-out-for-delivery":
        return "Out for Delivery";
      case "status-delivered":
        return "Delivered";
      case "status-cancelled":
        return "Cancelled";
      default:
        return "Pending";
    }
  };

  const getOrderStatusColor = (refId?: string) => {
    switch (refId) {
      case "status-delivered":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30";
      case "status-cancelled":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30";
      case "status-placed":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/30";
      case "status-confirmed":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30";
      case "status-preparing":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30";
      case "status-out-for-delivery":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/30";
      default:
        return "bg-slate-50 text-slate-700 dark:bg-slate-950/20 dark:text-slate-400 border-slate-200/50 dark:border-slate-900/30";
    }
  };
  return (
    <div className="relative w-full overflow-auto">
      {/* Visual pulse indicator when transition is pending */}
      {isPending && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 animate-pulse z-50" />
      )}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-transparent">
            <TableHead className="pl-2 sm:pl-6 font-medium">Order ID</TableHead>
            <TableHead className="font-medium w-fit">Customer</TableHead>
            <TableHead className="font-medium">Date</TableHead>
            <TableHead className="font-medium">Total</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Payment</TableHead>
            <TableHead className="text-right font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const shortId = order._id.slice(0, 8).toUpperCase();
            const displayId = order.orderNumber || `ORD-${shortId}`;
            return (
              <TableRow key={order._id} className="group">
                <TableCell className="text-start pl-2 sm:pl-6 font-medium text-foreground">
                  #{displayId}
                </TableCell>
                <TableCell className="w-fit text-start">
                  <div className="font-medium w-fit">
                    {order.userName || "Guest"}
                  </div>
                  <div className="text-xs text-muted-foreground w-fit">
                    {order.userEmail || "No email"}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm text-start">
                  {format(new Date(order._createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="font-medium text-start">
                  {formatCurrency(order.total || 0)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getOrderStatusColor(order.status?._ref)}
                  >
                    {getOrderStatusLabel(order.status?._ref)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getPaymentStatusColor(order.paymentStatus)}
                  >
                    {order.paymentStatus || "pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-foreground hover:bg-secondary/50"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateOrder(order._id, {
                            paymentStatus: "paid",
                            statusRefId: order.status?._ref || "",
                            items: order.items || [],
                            total: order.total || 0,
                          })
                        }
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                        Mark as Paid
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <OrderDetailsSheet
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onSave={handleUpdateOrder} // Hook save updates up directly
      />
    </div>
  );
}
```
