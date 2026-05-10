import auth from "../../../../../auth";
import { client } from "@/sanity/lib/client";
import { Order } from "../../../../../types/sanityTypes";
import OrdersClientPage from "./ordersClientPage";

const OrdersPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  const LIMIT = 10;
  const isAdmin = role === "admin";
  const query = isAdmin
    ? `*[_type == "order"] | order(userName asc, _createdAt desc) [0...${LIMIT}]`
    : `*[_type == "order" && user._ref == $userId] | order(_createdAt desc) [0...${LIMIT}]`;
  const orders = isAdmin
    ? await client.fetch<Order[]>(query, { LIMIT })
    : await client.fetch<Order[]>(query, { userId, LIMIT });
  const totalQuery = isAdmin
    ? `*[_type == "order"]`
    : `*[_type == "order" && user._ref == $userId]`;
  const totalOrders = await client.fetch<number>(`count(${totalQuery})`, {
    userId,
  });
  return (
    <OrdersClientPage
      userId={userId}
      isAdmin={isAdmin}
      initialOrders={orders}
      totalOrders={totalOrders}
    />
  );
};

export default OrdersPage;
