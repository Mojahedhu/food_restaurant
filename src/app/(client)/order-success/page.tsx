import { client } from "@/sanity/lib/client";
import { redirect } from "next/navigation";
import OrderSuccessPageClient from "./orderSuccessPageClient";
import { Order } from "@/../sanity.types";
import { stripe } from "@/lib/stripe";
import auth from "@/../auth";

interface OrderSuccessPageProps {
  searchParams: Promise<{
    orderId: string;
    sessionId?: string;
  }>;
}

const OrderSuccessPage = async ({ searchParams }: OrderSuccessPageProps) => {
  // 1. Declare the order variable outside the try/catch scope
  let order: Order | null = null;
  try {
    const { orderId, sessionId } = await searchParams;
    const session = await auth();
    const userId = session?.user?.id;

    if (!orderId) {
      redirect("/");
    }

    // 2. Fetch the data inside the try/catch
    order = (await client.getDocument(orderId)) as Order | null;

    if (!order) {
      redirect("/");
    }

    // 🔒 Security: Prevent users from viewing other people's orders
    if (order.user?._ref && order.user._ref !== userId) {
      redirect("/");
    }

    // 🔐 1. Stripe flow (manual verification)
    if (order.paymentMethod === "online") {
      if (!sessionId) {
        redirect(`/user/orders/${order._id}`);
      }

      const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

      if (stripeSession.payment_status !== "paid") {
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
      // ✅ Update order manually
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

    // 🔐 3. One-Time Access Protection (Polished UX)
    if (order.isViewed) {
      // If the user hits refresh, smoothly send them to their permanent order receipt
      redirect(`/user/orders/${order._id}`);
    }

    // Mark as viewed so subsequent refreshes gracefully redirect
    await client.patch(order._id).set({ isViewed: true }).commit();
  } catch (error) {
    // 🛡️ Defense-in-depth: Never leak crashes to the client UI
    console.error("[ORDER_SUCCESS_PAGE_ERROR]", error);

    // Redirect securely back to a safe route
    redirect("/");
  }
  return <OrderSuccessPageClient order={order} />;
};

export default OrderSuccessPage;
