import { sanityFetch } from "@/sanity/lib/live";
import { Order, OrderSummary } from "@/../types/sanityTypes";

/**
 * Fetch a paginated and filtered list of orders for a user.
 */
export async function fetchUserOrders(
  userId: string,
  isAdmin: boolean,
  page: number = 1,
  pageSize: number = 8,
  search: string = "",
  status: string = "",
): Promise<{
  orders: OrderSummary[];
  totalItems: number;
}> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  let baseCondition = isAdmin
    ? `_type == "order"`
    : `_type == "order" && user._ref == $userId`;

  if (search) {
    baseCondition += ` && (orderNumber match $search || userEmail match $search)`;
  }
  if (status && status !== "all") {
    baseCondition += ` && status->value == $status`;
  }

  const query =
    `*[` +
    baseCondition +
    `] | order(_createdAt desc) [$start...$end] {
    _id,
    orderNumber,
    _createdAt,
    total,
    paymentStatus,
    paymentMethod,
    status->{title, color, value},
    items
  }`;

  const countQuery = `count(*[` + baseCondition + `])`;

  try {
    const params = { userId, start, end, search: `${search}*`, status };
    const [orders, totalItems] = await Promise.all([
      sanityFetch({ query, params }).then(
        (res) => res.data,
      ) as unknown as OrderSummary[],
      sanityFetch({ query: countQuery, params }).then(
        (res) => res.data,
      ) as unknown as number,
    ]);
    return { orders, totalItems };
  } catch (error) {
    console.error("[Order Service] Failed to fetch user orders:", error);
    return { orders: [], totalItems: 0 };
  }
}

/**
 * Fetch global order statistics for the overview cards.
 */
export async function fetchOrderStats(
  userId: string,
  isAdmin: boolean,
): Promise<{
  total: number;
  inProgress: number;
  completed: number;
}> {
  const baseCondition = isAdmin
    ? `_type == "order"`
    : `_type == "order" && user._ref == $userId`;

  const statsQuery = `{
    "total": count(*[${baseCondition}]),
    "inProgress": count(*[${baseCondition} && status->title == "Confirmed"]),
    "completed": count(*[${baseCondition} && status->title == "Delivered"])
  }`;

  try {
    return (await sanityFetch({ query: statsQuery, params: { userId } }).then(
      (res) => res.data,
    )) as unknown as {
      total: number;
      inProgress: number;
      completed: number;
    };
  } catch (error) {
    console.error("[Order Service] Failed to fetch order stats:", error);
    return { total: 0, inProgress: 0, completed: 0 };
  }
}

/**
 * Fetch a single order by ID with expanded status information.
 */
export async function fetchOrderDetails(orderId: string) {
  const query = `*[_type == "order" && _id == $orderId][0]{
    ...,
    status->{
      _id,
      title,
      value,
      color,
      order,
      description
    }
  }`;
  return (await sanityFetch({ query, params: { orderId } }).then(
    (res) => res.data,
  )) as unknown as Order;
}

/**
 * Fetch all active order statuses sorted by their step order.
 */
export async function fetchActiveOrderStatuses(): Promise<
  OrderSummary["status"][]
> {
  const query = `*[_type == "orderStatus" && isActive == true] | order(order asc) {
    _id,
    title,
    value,
    color,
    order,
    description
  }`;
  return (await sanityFetch({ query }).then(
    (res) => res.data,
  )) as OrderSummary["status"][];
}
