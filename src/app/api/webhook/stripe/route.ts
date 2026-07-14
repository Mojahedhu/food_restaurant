import { stripe } from "@/lib/stripe";
import { client as adminClient } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get("stripe-signature");

    // 1. Safe Header Validation
    if (!signature) {
      console.error("[WEBHOOK_ERROR] Missing Stripe signature");
      return NextResponse.json(
        { message: "Invalid signature configuration" },
        { status: 400 },
      );
    }

    // 2. Safe Environment Variable Checking
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
      console.error(
        "[WEBHOOK_ERROR] Missing STRIPE_WEBHOOK_SECRET environment variable",
      );
      return NextResponse.json(
        { message: "Webhook server configuration error" },
        { status: 500 },
      );
    }

    let event: Stripe.Event;

    // 3. Signature Verification
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (error) {
      // Isolate technical logs to the server
      console.error(`[WEBHOOK_SIGNATURE_ERROR]`, error);
      return NextResponse.json(
        { message: "Webhook signature verification failed" },
        { status: 400 },
      );
    }

    // ✅ Handle success payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Strict Optional Chaining (plan.md Rule 4)
      const orderId = session.metadata?.sanityOrderId;

      if (orderId) {
        // Secure server-side mutation
        await adminClient
          .patch(orderId)
          .set({
            paymentStatus: "paid",
            status: {
              _type: "reference",
              _ref: "status-confirmed",
            },
          })
          .commit();

        // 🔄 Explicit Cache Revalidation (plan.md Rule 8)
        revalidatePath(`/user/orders/${orderId}`);
        revalidatePath(`/user/orders`);
      }
    }

    // ❌ Handle failed payment
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Strict Optional Chaining
      const orderId = session?.metadata?.sanityOrderId;

      if (orderId) {
        // Secure server-side mutation
        await adminClient
          .patch(orderId)
          .set({
            paymentStatus: "failed",
            status: {
              _type: "reference",
              _ref: "status-cancelled",
            },
          })
          .commit();

        // 🔄 Explicit Cache Revalidation (plan.md Rule 8)
        revalidatePath(`/user/orders/${orderId}`);
        revalidatePath(`/user/orders`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // 🛡️ Defense-in-Depth: Isolated Error Logging (plan.md Rule 3)
    console.error("[STRIPE_WEBHOOK_INTERNAL_ERROR]", error);
    // Standard production-safe error contract
    return NextResponse.json(
      { message: "An unexpected error occurred processing the webhook" },
      { status: 500 },
    );
  }
}
