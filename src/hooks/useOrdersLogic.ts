"use client";
import { useTransition, useState, useEffect } from "react";
import { OrderSummary } from "@/types/admin";
import { deleteOrderAction, updateOrderAction } from "@/actions/admin-orders";
import { toast } from "sonner"; // Using standard toast component alerts
export function useOrdersLogic(initialOrders: OrderSummary[]) {
  // 1. Concurrent transitions handler
  const [isPending, startTransition] = useTransition();

  // Dictionary to store local overrides: { [orderId]: Partial<OrderSummary> }
  const [localUpdates, setLocalUpdates] = useState<
    Record<string, Partial<OrderSummary>>
  >({});
  // 1. New state variable in hook:
  const [deletedOrderIds, setDeletedOrderIds] = useState<Set<string>>(
    new Set(),
  );

  // Sync and clean up local overrides when server data catches up
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Filter list in hook and merge server data with active local overrides
  const orders = initialOrders
    .filter((order) => !deletedOrderIds.has(order._id))
    .map((order) => {
      const update = localUpdates[order._id];
      return update ? { ...order, ...update } : order;
    });

  // 3. UI save handler
  const handleUpdateOrder = async (
    orderId: string,
    updates: {
      paymentStatus: string;
      statusRefId: string;
      items: OrderSummary["items"];
      total: number;
    },
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
      // 2. Call the server action to persist data
      const result = await updateOrderAction(orderId, updates);

      // 3. Handle success or failure
      if (result.success) {
        // On success, we can do nothing further (or show a success toast)
        // The UI is already updated optimistically.
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
    // Execute background update
  };

  // 4. New handleDeleteOrder method:
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
        toast.error(
          result.error || "Failed to delete order. Reverting changes.",
        );
        // Revert optimistic deletion on failure
        setDeletedOrderIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }
    });
  };

  return {
    orders,
    isPending,
    handleUpdateOrder,
    handleDeleteOrder,
  };
}
