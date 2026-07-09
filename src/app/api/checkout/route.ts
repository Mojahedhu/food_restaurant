import { client as adminClient } from "@/sanity/lib/client";
import { CartItem } from "../../../stores/cart/cartStore";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { nanoid } from "zod/mini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      deliveryAddress,
      paymentMethod,
      userId,
      userEmail,
      userName,
      // subtotal,
      // deliveryFee,
      // tax,
      // total,
    } = body;

    // 1. SECURE PRICE FETCH: Get current prices from Sanity
    const foodIds = items.map((i: CartItem) => i.foodId);
    const dbFoods = (await adminClient.fetch(
      `*[_type == "food" && _id in $foodIds]{ _id, price }`,
      { foodIds },
    )) as { _id: string; price: string }[];

    // 2. SECURE CALCULATION
    const subtotal = items.reduce((acc: number, item: CartItem) => {
      const price = dbFoods.find((f) => f._id === item.foodId)?.price || 0;
      return acc + +price * item.quantity;
    }, 0);

    const deliveryFee = 5.0;
    const tax = Number((subtotal * 0.1).toFixed(2));
    const total = Number((subtotal + deliveryFee + tax).toFixed(2));

    // 2. Generate a Unique Order Number
    const orderNumber = `ORD-${new Date().getTime()}`;

    // 3. Prepare the Sanity Document
    const orderDoc = {
      _type: "order",
      orderNumber,
      user: { _type: "reference", _ref: userId },
      userEmail,
      userName,
      items: items.map((item: CartItem) => ({
        _key: nanoid(),
        foodId: item.foodId,
        name: item.name,
        image: item.image,
        price: dbFoods.find((f) => f._id === item.foodId)?.price || 0,
        quantity: item.quantity,
        size: item.size || "",
        variety: item.variety || "",
      })),
      deliveryAddress: {
        ...deliveryAddress,
        _type: "object", // Matching your schema's object type
      },
      subtotal,
      deliveryFee,
      tax,
      total,
      originalTotal: total,
      paymentMethod: paymentMethod === "online" ? "online" : "cod",
      paymentStatus: "pending",
      // THE LINK: Hardcoded reference to our seeded 'Order Placed' status
      status: { _type: "reference", _ref: "status-placed" },
      estimatedDeliveryTime: "30-45 minutes",
    };

    const createdOrder = await adminClient.create(orderDoc);

    // --- Branching Logic ---

    // 1. Cash on Delivery
    if (paymentMethod === "cod") {
      return NextResponse.json({
        // COD Redirect
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-success?orderId=${createdOrder._id}`,
      });
    }

    // 2. Online Payment (Stripe)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item: CartItem) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(
            Number(dbFoods.find((f) => f._id === item.foodId)?.price) * 100,
          ),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      metadata: { sanityOrderId: createdOrder._id },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-success?orderId=${createdOrder._id}&sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
    });

    // Save session ID to Sanity
    await adminClient
      .patch(createdOrder._id)
      .set({ StripeSessionId: session.id })
      .commit();
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout API error", error);
    const err = error as { message: string; code: string };
    return NextResponse.json(
      { error: err.message || String(error) },
      { status: 500 },
    );
  }
}
