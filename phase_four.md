# Phase 4: Order Details Sheet

This document contains the code for **Phase 4**. We are building `OrderDetailsSheet.tsx`, a slide-out panel that appears when an admin wants to view or edit a specific order.

We will use the `shadcn/ui` Sheet component for the sliding UI, and as requested, we will use `useReducer` to cleanly manage the complex local state (editing multiple fields like status, payment status, etc.) before saving.

---

## 1. Order Details Sheet Component (`src/components/admin/features/orders/OrderDetailsSheet.tsx`)

This component takes a selected `OrderSummary` (or full `Order`) and manages its edit state locally.

```tsx
// src/components/admin/features/orders/OrderDetailsSheet.tsx
"use client";

import { useReducer, useEffect } from "react";
import { OrderSummary } from "@/types/admin";
import { cn, formatCurrency, getImageUrl } from "@/lib/utils";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  MapPin,
  Minus,
  Pencil,
  Plus,
  Trash2,
  User,
  Utensils,
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- 1. Define the Reducer for Complex Local State ---

interface EditOrderState {
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
  hasChanges: boolean;
}

type EditOrderAction =
  | { type: "SET_PAYMENT_STATUS"; payload: string }
  | { type: "SET_ORDER_STATUS"; payload: string }
  | { type: "INCREMENT_QUANTITY"; payload: string }
  | { type: "DECREMENT_QUANTITY"; payload: string }
  | { type: "REMOVE_ITEM"; payload: string }
  | {
      type: "RESET";
      payload: {
        paymentStatus: string;
        statusRefId: string;
        items: EditOrderState["items"];
      };
    };

function editOrderReducer(
  state: EditOrderState,
  action: EditOrderAction,
): EditOrderState {
  switch (action.type) {
    case "SET_PAYMENT_STATUS":
      return { ...state, paymentStatus: action.payload, hasChanges: true };
    case "SET_ORDER_STATUS":
      return { ...state, statusRefId: action.payload, hasChanges: true };
    case "INCREMENT_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item._key === action.payload
            ? { ...item, quantity: (item.quantity || 0) + 1 }
            : item,
        ),
        hasChanges: true,
      };
    case "DECREMENT_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item._key === action.payload && (item.quantity || 0) > 1
            ? { ...item, quantity: (item.quantity || 0) - 1 }
            : item,
        ),
        hasChanges: true,
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item._key !== action.payload),
        hasChanges: true,
      };
    case "RESET":
      return {
        paymentStatus: action.payload.paymentStatus,
        statusRefId: action.payload.statusRefId,
        items: action.payload.items,
        hasChanges: false,
      };
    default:
      return state;
  }
}

// --- 2. Define Component Props ---

interface OrderDetailsSheetProps {
  order: OrderSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (
    orderId: string,
    updates: {
      paymentStatus: string;
      statusRefId: string;
      items: EditOrderState["items"];
      total: number;
    },
  ) => Promise<void>;
}

export function OrderDetailsSheet({
  order,
  isOpen,
  onClose,
  onSave,
}: OrderDetailsSheetProps) {
  // Initialize useReducer for local form state
  const [state, dispatch] = useReducer(editOrderReducer, {
    paymentStatus: order?.paymentStatus || "pending",
    statusRefId: order?.status?._ref || "",
    items: order?.items || [],
    hasChanges: false,
  });

  // Reset local state when a new order is selected
  useEffect(() => {
    if (order) {
      dispatch({
        type: "RESET",
        payload: {
          paymentStatus: order.paymentStatus || "pending",
          items: order?.items || [],
          statusRefId: order.status?._ref || "",
        },
      });
    }
  }, [order]);

  // Calculate dynamic subtotal and total based on local items
  const itemsTotal = state.items.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
    0,
  );
  const currentTotal =
    itemsTotal + (order?.deliveryFee || 0) + (order?.tax || 0);

  const handleSave = async () => {
    if (!order || !onSave) return;

    await onSave(order._id, {
      paymentStatus: state.paymentStatus,
      statusRefId: state.statusRefId,
      items: state.items,
      total: currentTotal,
    });

    // Close the sheet after saving
    onClose();
  };

  // If no order is selected, don't render the content
  if (!order) return null;

  const displayId =
    order.orderNumber || `ORD-${order._id.slice(0, 8).toUpperCase()}`;
  const isDelivered = state.statusRefId === "status-delivered";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md! flex flex-col h-full p-0 gap-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <SheetHeader className="text-left">
            <SheetTitle className="text-2xl font-bold">
              Order Details
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Order #{displayId}
            </SheetDescription>
          </SheetHeader>

          {/* Status Settings Card */}
          <Card className="bg-muted/30 shadow-sm p-4 rounded-xl border border-border space-y-4">
            <CardContent className="space-y-6">
              <div className="space-y-1.5">
                <Label
                  htmlFor="order-status"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Order Status
                </Label>
                <Select
                  value={state.statusRefId}
                  onValueChange={(val) =>
                    dispatch({ type: "SET_ORDER_STATUS", payload: val })
                  }
                >
                  <SelectTrigger
                    id="order-status"
                    className={cn(
                      "w-full bg-background transition-all",
                      isDelivered &&
                        "border-primary focus:ring-primary text-primary font-medium",
                    )}
                  >
                    <SelectValue placeholder="Select order status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status-placed">Order Placed</SelectItem>
                    <SelectItem value="status-confirmed">Confirmed</SelectItem>
                    <SelectItem value="status-preparing">Preparing</SelectItem>
                    <SelectItem value="status-out-for-delivery">
                      Out for Delivery
                    </SelectItem>
                    <SelectItem value="status-delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="payment-status"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Payment Status
                </Label>
                <Select
                  value={state.paymentStatus}
                  onValueChange={(val) =>
                    dispatch({ type: "SET_PAYMENT_STATUS", payload: val })
                  }
                >
                  <SelectTrigger
                    id="payment-status"
                    className="w-full bg-background"
                  >
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="bg-muted/30 gap-2 shadow-sm p-4 rounded-xl border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <User className="size-4 text-muted-foreground" />
                <span>Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <section className="space-y-3">
                <div className="pl-6 space-y-1 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium text-foreground">
                      {order.userName || "Guest Customer"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-foreground">
                      {order.userEmail || "No email provided"}
                    </span>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <Card className="bg-muted/30 gap-2 shadow-sm p-4 rounded-xl border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span>Delivery Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <section className="space-y-3">
                  <div className="pl-6 text-sm text-muted-foreground space-y-1">
                    <p>{order.deliveryAddress.street}</p>
                    {order.deliveryAddress.apartment && (
                      <p>{order.deliveryAddress.apartment}</p>
                    )}
                    <p>
                      {order.deliveryAddress.city}
                      {order.deliveryAddress.state
                        ? `, ${order.deliveryAddress.state}`
                        : ""}
                      {order.deliveryAddress.zipCode
                        ? ` ${order.deliveryAddress.zipCode}`
                        : ""}
                    </p>
                    {order.deliveryAddress.phone && (
                      <p className="pt-1 text-muted-foreground">
                        Phone:{" "}
                        <span className="text-foreground">
                          {order.deliveryAddress.phone}
                        </span>
                      </p>
                    )}
                  </div>
                </section>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-sm font-semibold text-foreground">
                Order Items
              </div>
              <div className="text-yellow-600 font-medium text-xs flex items-center gap-1">
                <Pencil className="size-3" />
                <span>Editable</span>
              </div>
            </div>

            <div className="space-y-3">
              {state.items.map((item, index) => {
                const imageUrl = getImageUrl(item.image);
                const itemPrice = item.price || 0;
                const quantity = item.quantity || 0;
                const itemSubtotal = itemPrice * quantity;

                return (
                  <Card
                    key={
                      typeof item._key === "string"
                        ? item._key
                        : `item-${index}`
                    }
                    className="flex-row items-center gap-4 p-3 bg-card border border-border rounded-xl relative group"
                  >
                    {/* Item Image */}
                    <div className="size-16 relative bg-muted rounded-lg overflow-hidden shrink-0">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.name || "Food Item"}
                          className="size-full object-cover"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center text-xs text-muted-foreground">
                          <Utensils className="text-primary h-10 w-10" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className="font-semibold text-sm text-foreground truncate">
                        {item.name || "Unnamed Item"}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatCurrency(itemPrice)} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2.5 mt-2 bg-muted/50 w-fit rounded-lg border border-border px-1 py-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-5 hover:bg-muted hover:cursor-pointer"
                          onClick={() =>
                            dispatch({
                              type: "DECREMENT_QUANTITY",
                              payload: item._key,
                            })
                          }
                          disabled={quantity <= 1}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="text-xs font-semibold min-w-[12px] text-center">
                          {quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-5 hover:bg-muted hover:cursor-pointer"
                          onClick={() =>
                            dispatch({
                              type: "INCREMENT_QUANTITY",
                              payload: item._key,
                            })
                          }
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Trash & Subtotal Container */}
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10 rounded-lg hover:cursor-pointer"
                        onClick={() =>
                          dispatch({
                            type: "REMOVE_ITEM",
                            payload: item._key,
                          })
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                      <span className="font-bold text-sm text-foreground">
                        {formatCurrency(itemSubtotal)}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>

        {/* Sticky Actions Footer */}
        <div className="border-t border-border bg-card p-4 flex gap-3 sticky bottom-0 w-full z-10">
          <Button
            onClick={handleSave}
            disabled={!state.hasChanges}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-xl transition-all"
          >
            Save Changes
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border-border text-foreground hover:bg-muted"
          >
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

---

## 2. Integration in `OrdersTable.tsx` (Phase 3 update)

To use the Sheet, we add state to `OrdersTable.tsx` to track which order is currently selected for viewing.

```tsx
// Inside src/components/admin/features/orders/OrdersTable.tsx

import { useState } from "react";
import { OrderDetailsSheet } from "./OrderDetailsSheet"; // Import the new component

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  // Add state to track the currently selected order for the Sheet
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);

  // ... (existing helper functions) ...

  return (
    <div className="w-full overflow-auto">
      {/* ... Existing Table JSX ... */}

      {/* Inside the DropdownMenu mapping: */}
      <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
        <FileText className="mr-2 h-4 w-4" />
        View Details
      </DropdownMenuItem>

      {/* ... Rest of Table JSX ... */}

      {/* Mount the Sheet outside the table, passing the selected order */}
      <OrderDetailsSheet
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onSave={async (orderId, updates) => {
          // In Phase 5, we will call our server action here!
          console.log("Saving updates for", orderId, updates);
        }}
      />
    </div>
  );
}
```
