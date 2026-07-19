import { client } from "@/sanity/lib/client";
import { redirect } from "next/navigation";
import OrderSuccessPageClient from "./orderSuccessPageClient";

import { stripe } from "@/lib/stripe";
import auth from "@/../auth";
import { cookies } from "next/headers";
import { Order } from "@/../types/sanityTypes";

interface OrderSuccessPageProps {
  searchParams: Promise<{
    orderId: string;
    sessionId?: string;
  }>;
}

const OrderSuccessPage = async ({ searchParams }: OrderSuccessPageProps) => {
  // 🚀 Fire all independent promises at the exact same time
  const [params, session, cookieStore] = await Promise.all([
    searchParams,
    auth(),
    cookies(),
  ]);
  const { orderId, sessionId } = await params;

  const userId = session?.user?.id;

  if (!orderId) {
    redirect("/");
  }

  // 1. Declare the order variable outside the try/catch scope
  let order: Order | null = null;
  let redirectPath: string | null = null;
  try {
    // 2. Fetch the data inside the try/catch
    order = (await client.getDocument(orderId)) as Order | null;

    if (!order) {
      redirectPath = "/";

      // 🔒 Security: Prevent users from viewing other people's orders
    } else if (order.user?._ref && order.user._ref !== userId) {
      redirectPath = "/";
    } else {
      // 🔐 1. Stripe flow (manual verification)
      if (order.paymentMethod === "online") {
        if (!sessionId) {
          redirectPath = `/user/orders/${order._id}`;
        } else {
          const stripeSession =
            await stripe.checkout.sessions.retrieve(sessionId);

          if (stripeSession.payment_status !== "paid") {
            redirectPath = `/checkout`;
            // ✅ update order manually (webhook replacement)
          } else if (order.paymentStatus !== "paid") {
            await client
              .patch(order._id)
              .set({
                paymentStatus: "paid",
                status: { _type: "reference", _ref: "status-confirmed" },
              })
              .commit();
          }
        }
      }

      // 🟩 2. COD flow
      if (
        order.paymentMethod === "cod" &&
        order.paymentStatus !== "paid" &&
        !redirectPath
      ) {
        // ✅ Update order manually
        await client
          .patch(order._id)
          .set({
            paymentStatus: "paid",
            status: { _type: "reference", _ref: "status-confirmed" },
          })
          .commit();
      }

      // 🔐 3. STRICT One-Time Access Protection
      if (!redirectPath) {
        const accessCookie = cookieStore.get(`order_access_${order._id}`);
        if (order.isViewed && !accessCookie) {
          // If the user hits refresh, smoothly send them to their permanent order receipt
          redirectPath = `/user/orders/${order._id}`;
        } else if (!order.isViewed) {
          await client.patch(order._id).set({ isViewed: true }).commit();
        }
      }
    }
  } catch (error) {
    // 🛡️ Defense-in-depth: Never leak crashes to the client UI
    console.error("[ORDER_SUCCESS_PAGE_ERROR]", error);

    // Redirect securely back to a safe route
    redirectPath = "/";
  }
  if (redirectPath) {
    redirect(redirectPath);
  }
  if (!order) {
    redirect("/");
  }
  return <OrderSuccessPageClient order={order} />;
};

export default OrderSuccessPage;
