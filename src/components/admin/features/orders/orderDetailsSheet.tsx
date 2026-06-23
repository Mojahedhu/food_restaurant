"use client";

import { useReducer, useEffect } from "react";
import { OrderSummary } from "@/types/admin";
import {
  cn,
  formatCurrency,
  formatPaymentMethod,
  getImageUrl,
  getPaymentStatusColor,
} from "@/lib/utils";

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
  DollarSign,
  Loader2,
  LucideWallet,
  MapPin,
  Minus,
  Pencil,
  Plus,
  Trash2,
  User,
  Utensils,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// --- 1. Define the Reducer for Complex Local State ---

// The state represents the editable fields of the order
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
  isPending: boolean;
}

export function OrderDetailsSheet({
  order,
  isOpen,
  onClose,
  onSave,
  isPending,
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
    itemsTotal + (order?.deliveryFee || 0) + itemsTotal * 0.05;

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
      <SheetContent className="w-full sm:max-w-md! md:max-w-lg! lg:max-w-xl! flex flex-col h-full p-0 gap-0">
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
                    <SelectItem value="status-cancelled">Cancelled</SelectItem>
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
                  {}
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
              <div className="font-medium text-xs flex items-center gap-1">
                <Pencil className="size-3 text-amber-600" />
                <span className="text-primary">Editable</span>
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
            <Separator />
            {/* Order Summary */}
            <div className="flex gap-2">
              <div className="flex justify-center items-start">
                <DollarSign className="size-4" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex gap-4 items-center">
                  <div className="text-sm font-semibold text-foreground">
                    Order Summary
                  </div>
                  <div className="font-medium text-xs flex items-center gap-1">
                    <Pencil className="size-3 text-amber-600" />
                    <span className="text-primary">Editable</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div>Subtotal</div>

                  <div>{formatCurrency(itemsTotal)}</div>
                </div>
                <div className="flex justify-between">
                  <div>Delivery Fee</div>

                  <div>{formatCurrency(order?.deliveryFee || 0)}</div>
                </div>
                <div className="flex justify-between">
                  <div>Taxes and fees</div>

                  <Badge variant={"outline"} className="mr-4">
                    {formatCurrency(itemsTotal * 0.05 || 0)}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <div className="font-semibold">Total:</div>

                  <div className="font-semibold">
                    {formatCurrency(currentTotal || 0)}
                  </div>
                </div>
              </div>
            </div>
            <Separator />
            {/* Payment Info */}
            <div className="flex gap-2">
              <div className="flex justify-center items-start">
                <LucideWallet className="size-4" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="font-semibold">
                  <div>Payment Information</div>
                </div>
                <div className="">
                  <span className="font-semibold text-[12px]">Method: </span>
                  <span>{formatPaymentMethod(order?.paymentMethod || "")}</span>
                </div>
                <div className="text-[12px]">
                  <span className="font-semibold">Payment Status: </span>
                  <Badge
                    variant={"outline"}
                    className={getPaymentStatusColor(order.paymentStatus)}
                  >
                    {order?.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>
            <Separator />
          </section>
        </div>

        {/* Sticky Actions Footer */}
        <div className="border-t border-border bg-card p-4 flex gap-3 sticky bottom-0 w-full z-10">
          <Button
            onClick={handleSave}
            disabled={!state.hasChanges || isPending}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-xl transition-all"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
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
