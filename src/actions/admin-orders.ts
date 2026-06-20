"use server";

import { client } from "@/sanity/lib/client"; // Adjust this path to your Sanity client
import { groq } from "next-sanity";
import { OrderSummary } from "@/types/admin";
import { sanityFetch } from "@/sanity/lib/live";
import { revalidateTag } from "next/cache";

/**
 * Fetches a list of recent orders for the admin dashboard.
 * We resolve the referenced user document if needed, but your schema
 * already has userName and userEmail natively on the Order document!
 */
export async function fetchAdminOrders(): Promise<OrderSummary[]> {
  try {
    // GROQ Query: Fetch orders, order by newest first.
    // The Sanity schema natively has 'total', 'userName', 'userEmail', and 'status' (which is a reference).
    const query = groq`
      *[_type == "order"] | order(_createdAt desc) {
       _id,
        _createdAt,
        orderNumber,
        status,
        total,
        paymentStatus,
        userName,
        userEmail,
        user,
        items,
        deliveryAddress,
        subtotal,
        deliveryFee,
        tax
      }[0...50]
    `;

    const { data: orders } = await sanityFetch({
      query,
      params: {},
      tags: ["orders"],
    });

    return orders as OrderSummary[];
  } catch (error) {
    console.error("Failed to fetch admin orders:", error);
    return [];
  }
}

/**

- Mutates an order document in Sanity CMS using the writeClient.
- Revalidates the 'orders' cache tag to update the live preview sync.
*/
export async function updateOrderAction(
  orderId: string,
  updates: {
    paymentStatus: string;
    statusRefId: string;
    items:
      | Array<{
          foodId?: string;
          name?: string;
          image?: string;
          price?: number;
          quantity?: number;
          size?: string;
          variety?: string;
          _key: string;
        }>
      | undefined;
    total: number;
  },
) {
  try {
    // Perform standard transaction patch using the authorized write client
    await client
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
    revalidateTag("orders", "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to update order in Sanity:", error);
    return { success: false, error: "Failed to save updates in database" };
  }
}

// Add this interface and function to handle paged queries

interface FetchOrdersParams {
  page: number;
  pageSize: number;
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
  sortBy?: string;
  sortOrder?: string;
}

export async function fetchAdminOrdersPaged({
  page,
  pageSize,
  search = "",
  orderStatus = "",
  paymentStatus = "",
  sortBy = "date",
  sortOrder = "desc",
}: FetchOrdersParams): Promise<{ totalItems: number; orders: OrderSummary[] }> {
  try {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    // 1. Build dynamic filters
    let filterClauses = `_type == "order"`;
    const params: Record<string, number | string> = { start, end };

    if (search.trim()) {
      filterClauses += ` && (userName match $search || userEmail match $search || orderNumber match $search)`;
      params.search = `*${search.trim()}*`;
    }

    if (orderStatus && orderStatus !== "all") {
      filterClauses += ` && status._ref == $orderStatus`;
      params.orderStatus = orderStatus;
    }

    if (paymentStatus && paymentStatus !== "all") {
      filterClauses += ` && paymentStatus == $paymentStatus`;
      params.paymentStatus = paymentStatus;
    }

    // 2. Build sorting clause
    let sortClause = `_createdAt desc`;
    if (sortBy === "total") {
      sortClause = `total ${sortOrder === "asc" ? "asc" : "desc"}`;
    } else if (sortBy === "date") {
      sortClause = `_createdAt ${sortOrder === "asc" ? "asc" : "desc"}`;
    }

    const countQuery = groq`count(*[${filterClauses}])`;
    const dataQuery = groq`
      *[${filterClauses}] | order(${sortClause}) {
        _id,
        _createdAt,
        orderNumber,
        status,
        total,
        paymentStatus,
        userName,
        userEmail,
        items
      }[$start...$end]
    `;

    // Fetch count and page content in parallel
    const [{ data: totalItems }, { data: orders }] = await Promise.all([
      sanityFetch({ query: countQuery, params, tags: ["orders"] }),
      sanityFetch({ query: dataQuery, params, tags: ["orders"] }),
    ]);

    return {
      totalItems: totalItems as number,
      orders: orders as OrderSummary[],
    };
  } catch (error) {
    console.error("Failed to fetch filtered admin orders:", error);
    return { totalItems: 0, orders: [] };
  }
}
