import { stripe } from "@/lib/stripe";
import { client } from "@/sanity/lib/client";
import { NextResponse } from "next/server";
import { Order } from "../../../../types/sanityTypes";

export async function POST(req: Request) {
  const { orderId } = await req.json();

  const order = (await client.getDocument(orderId)) as Order;

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentStatus === "paid") {
    return NextResponse.json({ error: "Already paid" });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: order.items?.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item?.name || "Food Item" },
        unit_amount: Math.round((item?.price || 0) * 100),
      },
      quantity: item?.quantity,
    })),
    mode: "payment",
    metadata: {
      sanityOrderId: order._id,
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/user/orders/${order._id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/user/orders/${order._id}`,
  });

  return NextResponse.json({ url: session.url });
}

// const retryPayment = async () => {
//   const res = await fetch("/api/retry-payment", {
//     method: "POST",
//     body: JSON.stringify({ orderId }),
//   });

//   const data = await res.json();

//   if (data.url) {
//     router.push(data.url);
//   }
// };
