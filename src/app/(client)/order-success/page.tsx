import { client } from "@/sanity/lib/client";
import { redirect } from "next/navigation";
import OrderSuccessPageClient from "./orderSuccessPageClient";
import { Order } from "../../../../sanity.types";
import { stripe } from "@/lib/stripe";
import auth from "../../../../auth";

interface OrderSuccessPageProps {
  searchParams: Promise<{
    orderId: string;
    sessionId?: string;
  }>;
}

const OrderSuccessPage = async ({ searchParams }: OrderSuccessPageProps) => {
  const { orderId, sessionId } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  if (!orderId || !userId) redirect("/");

  const order = (await client.getDocument(orderId)) as Order;

  if (!order) redirect("/");

  // 🔐 1. Stripe flow (manual verification)
  if (order.paymentMethod === "online") {
    if (!sessionId) {
      redirect(`/user/orders/${order._id}`);
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      redirect(`/checkout`);
    }

    // ✅ update order manually (webhook replacement)
    if (order.paymentStatus !== "paid") {
      await client
        .patch(order._id)
        .set({
          paymentStatus: "paid",
          status: { _type: "reference", _ref: "status-confirmed" },
        })
        .commit();
    }
  }

  // 🟩 2. COD flow
  if (order.paymentMethod === "cod") {
    // ensure status is correct
    if (order.paymentStatus === "paid") {
      redirect(`/user/orders/${order._id}`);
    }

    await client
      .patch(order._id)
      .set({
        paymentStatus: "paid",
        status: { _type: "reference", _ref: "status-confirmed" },
      })
      .commit();
  }

  // 🔐 3. One-time access
  if (order.isViewed) {
    redirect(`/user/orders/${order._id}`);
  }

  await client.patch(order._id).set({ isViewed: true }).commit();
  return <OrderSuccessPageClient order={order} />;
};

export default OrderSuccessPage;
