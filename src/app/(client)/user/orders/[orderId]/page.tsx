import { client } from "@/sanity/lib/client";
import auth from "../../../../../../auth";
import { notFound } from "next/navigation";
import OrderDetailsClientPage from "./OrderDetailsClientPage";

interface OrderDetailsPageProps {
  params: Promise<{ orderId: string }>;
}

const OrderDetailsPage = async ({ params }: OrderDetailsPageProps) => {
  const { orderId } = await params;
  const session = await auth();

  const userId = session?.user?.id;

  const order = await client.fetch(`*[_type == "order" && _id == $id][0]`, {
    id: orderId,
  });

  // ❌ Not found
  if (!order) return notFound();

  // ❌ Not owner
  if (order.user._ref !== userId && session?.user?.role !== "admin") {
    return notFound();
  }

  return <OrderDetailsClientPage orderId={orderId} initialOrder={order} />;
};

export default OrderDetailsPage;
