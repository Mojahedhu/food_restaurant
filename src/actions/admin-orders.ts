"use server";

import { OrderSummary } from "@/types/admin";
import { revalidateTag } from "next/cache";
import { assertAdmin, checkAdmin } from "@/lib/auth-guard";
import { z } from "zod";
import { ServiceError } from "@/lib/services/errors";
import {
  fetchAdminOrdersService,
  fetchAdminOrdersPagedService,
  updateOrderService,
  deleteOrderService,
} from "@/lib/services/admin.order.service";

const deleteOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

const updateOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  updates: z.object({
    paymentStatus: z.string(),
    statusRefId: z.string(),
    items: z.array(z.any()).optional(),
    total: z.number(),
  }),
});

interface FetchOrdersParams {
  page: number;
  pageSize: number;
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
  sortBy?: string;
  sortOrder?: string;
}

export async function fetchAdminOrders(): Promise<OrderSummary[]> {
  await checkAdmin();
  try {
    return await fetchAdminOrdersService();
  } catch (error) {
    console.error("Failed to fetch admin orders:", error);
    return [];
  }
}

export async function updateOrderAction(
  orderId: string,
  updates: {
    paymentStatus: string;
    statusRefId: string;
    items: any[] | undefined;
    total: number;
  },
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  
  try {
    const parsed = updateOrderSchema.safeParse({ orderId, updates });
    if (!parsed.success) {
      return { success: false, error: "Invalid parameters provided" };
    }

    await updateOrderService(parsed.data.orderId, parsed.data.updates);
    
    // @ts-ignore
    revalidateTag("orders", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error("Failed to update order in Sanity:", error);
    return { success: false, error: "Failed to save updates in database" };
  }
}

export async function fetchAdminOrdersPaged(params: FetchOrdersParams): Promise<{ totalItems: number; orders: OrderSummary[] }> {
  await checkAdmin();
  try {
    return await fetchAdminOrdersPagedService(params);
  } catch (error) {
    console.error("Failed to fetch filtered admin orders:", error);
    return { totalItems: 0, orders: [] };
  }
}

export async function deleteOrderAction(
  orderIdInput: string,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;

  const parsed = deleteOrderSchema.safeParse({ orderId: orderIdInput });
  if (!parsed.success) {
    return { success: false, error: "Invalid Order ID structure" };
  }

  const { orderId } = parsed.data;

  try {
    await deleteOrderService(orderId);

    // @ts-ignore - fixing the 'nax' typo previously here
    revalidateTag("orders", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error(`Failed to delete order ${orderId} in Sanity:`, error);
    return { success: false, error: "An unexpected database error occurred" };
  }
}
