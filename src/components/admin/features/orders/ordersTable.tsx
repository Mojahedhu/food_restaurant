"use client";

import { OrderSummary } from "@/types/admin";
import { formatCurrency, getPaymentStatusColor } from "@/lib/utils"; // Your format utility
import { format } from "date-fns"; // Standard date formatting package
import {
  MoreHorizontal,
  FileText,
  CheckCircle2,
  Truck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

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
import { useState } from "react";
import { OrderDetailsSheet } from "./orderDetailsSheet";
import { useOrdersLogic } from "@/hooks/useOrdersLogic";
import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface OrdersTableProps {
  initialOrders: OrderSummary[];
}

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSortBy = searchParams.get("sortBy") || "date";
  const currentSortOrder = searchParams.get("sortOrder") || "desc";

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (currentSortBy === field) {
      // Toggle sort order
      params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      // Default to desc on new field
      params.set("sortBy", field);
      params.set("sortOrder", "desc");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const renderSortIcon = (field: string) => {
    if (currentSortBy !== field)
      return <ArrowUpDown className="ml-1 size-3 opacity-50" />;
    return currentSortOrder === "asc" ? (
      <ArrowUp className="ml-1 size-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 size-3 text-primary" />
    );
  };

  // Phase 5 will introduce useOrdersLogic hook here for optimistic updates
  // Use custom optimistic hook
  const { orders, isPending, handleUpdateOrder } =
    useOrdersLogic(initialOrders);
  // Add state to track the currently selected order for the Sheet
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  // For Phase 3, we simply render the initial data.
  // const orders = initialOrders;

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
        <h3 className="text-lg font-medium text-foreground">No orders found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Wait for customers to place some orders.
        </p>
      </div>
    );
  }

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
            <TableHead
              className="font-medium cursor-pointer select-none hover:text-primary transition-colors"
              onClick={() => handleSort("date")}
            >
              <div className="flex items-center">
                Date {renderSortIcon("date")}
              </div>
            </TableHead>
            <TableHead
              className="font-medium cursor-pointer select-none hover:text-primary transition-colors"
              onClick={() => handleSort("total")}
            >
              <div className="flex items-center">
                Total {renderSortIcon("total")}
              </div>
            </TableHead>
            <TableHead className="font-medium text-center">Status</TableHead>
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
                <TableCell className="text-start pl-2 sm:pl-6 font-medium text-foreground">
                  #{shortId}
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
                        className="h-8 w-8 p-0 text-foreground hover:text-primary hover:bg-secondary/50 transition-colors duration-300 focus:text-primary focus:bg-secondary/50"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {/* Inside the DropdownMenu mapping: */}
                      <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          if (order.paymentStatus === "paid") {
                            toast.warning("Order is already paid");
                            return;
                          }

                          handleUpdateOrder(order._id, {
                            paymentStatus: "paid",
                            statusRefId: order.status?._ref || "",
                            items: order.items || [],
                            total: order.total || 0,
                          });
                        }}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                        Mark as Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Truck className="mr-2 h-4 w-4 text-primary" />
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
      {/* Mount the Sheet outside the table, passing the selected order */}
      <OrderDetailsSheet
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        // onSave={async (orderId, updates) => {
        //   // In Phase 5, we will call our server action here!
        //   console.log("Saving updates for", orderId, updates);
        // }}
        onSave={handleUpdateOrder} // Hook save updates up directly
        isPending={isPending}
      />
    </div>
  );
}
