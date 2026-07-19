import auth from "@/../auth";
import { notFound } from "next/navigation";
import OrderDetailsClientPage from "./OrderDetailsClientPage";
import {
  fetchActiveOrderStatuses,
  fetchOrderDetails,
} from "@/lib/services/user.orders.service";

interface OrderDetailsPageProps {
  params: Promise<{ orderId: string }>;
}

const OrderDetailsPage = async ({ params }: OrderDetailsPageProps) => {
  const { orderId } = await params;
  const session = await auth();

  const userId = session?.user?.id;

  const order = await fetchOrderDetails(orderId);

  // ❌ Not found
  if (!order || !order?.user) return notFound();

  // ❌ Not owner
  if (order.user._ref !== userId && session?.user?.role !== "admin") {
    return notFound();
  }
  const allStatuses = await fetchActiveOrderStatuses();
  return <OrderDetailsClientPage order={order} allStatuses={allStatuses} />;
};

export default OrderDetailsPage;
