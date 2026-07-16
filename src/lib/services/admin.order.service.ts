import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { OrderSummary } from "@/types/admin";
import { groq } from "next-sanity";
import { ServiceError } from "./errors";

interface FetchOrdersParams {
  page: number;
  pageSize: number;
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
  sortBy?: string;
  sortOrder?: string;
}

export async function fetchAdminOrdersService(): Promise<OrderSummary[]> {
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
}

export async function fetchAdminOrdersPagedService({
  page,
  pageSize,
  search = "",
  orderStatus = "",
  paymentStatus = "",
  sortBy = "date",
  sortOrder = "desc",
}: FetchOrdersParams): Promise<{ totalItems: number; orders: OrderSummary[] }> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

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
      paymentMethod,
      items
    }[$start...$end]
  `;

  const [{ data: totalItems }, { data: orders }] = await Promise.all([
    sanityFetch({ query: countQuery, params, tags: ["orders"] }),
    sanityFetch({ query: dataQuery, params, tags: ["orders"] }),
  ]);

  return {
    totalItems: totalItems as number,
    orders: orders as OrderSummary[],
  };
}

export async function updateOrderService(
  orderId: string,
  updates: {
    paymentStatus: string;
    statusRefId: string;
    items?: any[];
    total: number;
  }
) {
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
}

export async function deleteOrderService(orderId: string) {
  await client.delete(orderId);
}
