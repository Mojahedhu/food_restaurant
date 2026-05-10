import { stripe } from "@/lib/stripe";
import { client } from "@/sanity/lib/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (error) {
    const err = error as { message: string };
    console.error(
      `Webhook signature verification failed ${err.message || String(error)}`,
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ✅ Handle success payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const orderId = session.metadata?.sanityOrderId;

    if (orderId) {
      await client
        .patch(orderId)
        .set({
          paymentStatus: "paid",
          status: {
            _type: "reference",
            _ref: "status_confirmed",
          },
        })
        .commit();
    }
  }

  // ❌ Handle failed payment
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;

    const orderId = session.metadata?.sanityOrderId;

    if (orderId) {
      await client
        .patch(orderId)
        .set({
          paymentStatus: "failed",
          status: {
            _type: "reference",
            _ref: "status_cancelled",
          },
        })
        .commit();
    }
  }

  return NextResponse.json({ received: true });
}
