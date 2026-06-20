# Phase 3: The Data Table Implementation

This document contains the complete code for **Phase 3**. We are building a robust `OrdersTable.tsx` Client Component using `shadcn/ui` elements. It accepts the `OrderSummary[]` fetched in Phase 2 and displays it with status badges, formatted currency, and a dropdown for actions.

---

## 1. Helper Utility (`src/lib/utils.ts` or inline)

We need a quick helper to format the currency based on the order `total`.

```typescript
// Add this if you don't already have a currency formatter
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};
```

---

## 2. Orders Table Component (`src/components/admin/features/orders/OrdersTable.tsx`)

This component takes the data and renders the `shadcn/ui` Table. We also map out the badge colors for `paymentStatus` and the overall order status.

_Note: Since your `status` field is a Sanity reference (`_ref`), displaying its actual text name requires joining that data in your GROQ query in Phase 2, but we'll assume for now you are dealing with the reference ID or we'll display a generic text if the name isn't fetched yet._

```tsx
// src/components/admin/features/orders/OrdersTable.tsx
"use client";

import { OrderSummary } from "@/types/admin";
import { formatCurrency } from "@/lib/utils"; // Your format utility
import { format } from "date-fns"; // Standard date formatting package
import { MoreHorizontal, FileText, CheckCircle2, Truck } from "lucide-react";

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

interface OrdersTableProps {
  initialOrders: OrderSummary[];
}

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  // Phase 5 will introduce useOrdersLogic hook here for optimistic updates
  // For Phase 3, we simply render the initial data.
  const orders = initialOrders;

  // Helper to colorize payment status
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

  // Helper to get order status label
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

  // Helper to colorize order status badges
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

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <FileText className="size-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-foreground">
          No orders found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Wait for customers to place some orders.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-transparent">
            <TableHead className="w-[120px] font-medium">Order ID</TableHead>
            <TableHead className="font-medium">Customer</TableHead>
            <TableHead className="font-medium">Date</TableHead>
            <TableHead className="font-medium">Total</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Payment</TableHead>
            <TableHead className="text-right font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            // Trim Sanity ID for a cleaner display, e.g. "ORD-x8b2..."
            const shortId = order._id.slice(0, 8).toUpperCase();

            return (
              <TableRow key={order._id} className="group">
                <TableCell className="font-medium text-foreground">
                  #{shortId}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {order.userName || "Guest"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.userEmail || "No email"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(order._createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="font-medium">
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
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Mark as Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Truck className="mr-2 h-4 w-4 text-blue-500" />
                        Mark as Shipped
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

## 3. Connecting it to the Server Component (`src/app/admin/orders/page.tsx`)

Now that we have `OrdersTable`, you simply swap it into your `page.tsx` from Phase 2.

```tsx
// Inside src/app/admin/orders/page.tsx

import { OrdersTable } from "@/components/admin/features/orders/OrdersTable";

// ...

<div className="bg-card rounded-xl border shadow-sm overflow-hidden">
  <Suspense fallback={<OrdersTableSkeleton />}>
    {/* We now pass the exact fetched orders to our Client Table */}
    <OrdersTable initialOrders={orders} />
  </Suspense>
</div>;

// ...
```
