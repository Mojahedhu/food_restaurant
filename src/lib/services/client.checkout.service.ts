import { client as adminClient } from "@/sanity/lib/client";
import { stripe } from "@/lib/stripe";
import { nanoid } from "zod/mini";
import { ServiceError } from "./errors";
import { Address } from "@/../types/sanityTypes";

// We define the type for the payload that the service expects.
export type CheckoutPayload = {
  items: Array<{
    id: string;
    foodId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    size?: string;
    variety?: string;
  }>;
  deliveryAddress: Partial<Address>;
  paymentMethod: "online" | "cod";
  userId?: string;
  session?: {
    user?: {
      email?: string;
      name?: string;
    };
  } | null;
  baseUrl: string; // The service needs to know where to redirect back to
};

export async function processCheckout(payload: CheckoutPayload) {
  const { items, deliveryAddress, paymentMethod, userId, session, baseUrl } =
    payload;

  if (!items || items.length === 0) {
    throw new ServiceError("Cart cannot be empty", "BAD_REQUEST");
  }

  // 1. SECURE PRICE FETCH: Get current trusted prices from Sanity DB
  const foodIds = items.map((i) => i.foodId);
  const dbFoods = (await adminClient.fetch(
    `*[_type == "food" && _id in $foodIds]{ _id, price }`,
    { foodIds },
  )) as { _id: string; price: string }[];

  if (!dbFoods || dbFoods.length === 0) {
    throw new ServiceError(
      "Products not found or no longer available",
      "NOT_FOUND",
    );
  }

  // 2. SECURE CALCULATION (Never trust client-side prices)
  const subtotal = items.reduce((acc, item) => {
    const dbRecord = dbFoods.find((f) => f._id === item.foodId);
    const securePrice = dbRecord ? Number(dbRecord.price) : 0;
    return acc + securePrice * item.quantity;
  }, 0);

  if (subtotal <= 0) {
    throw new ServiceError(
      "Invalid order total. Please refresh your cart.",
      "BAD_REQUEST",
    );
  }

  const deliveryFee = 5.0;
  const tax = Number((subtotal * 0.1).toFixed(2));
  const total = Number((subtotal + deliveryFee + tax).toFixed(2));

  // 3. Generate Order Number
  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // 4. Prepare Sanity Document Structure
  const userEmail = session?.user?.email || "guest@example.com";
  const userName = session?.user?.name || "Guest Checkout";

  const orderDoc = {
    _type: "order",
    orderNumber,
    user: userId ? { _type: "reference", _ref: userId } : undefined,
    userEmail,
    userName,
    items: items.map((item) => ({
      _key: nanoid(),
      foodId: item.foodId,
      name: item.name,
      image: item.image,
      price: Number(dbFoods.find((f) => f._id === item.foodId)?.price || 0),
      quantity: item.quantity,
      size: item.size || "",
      variety: item.variety || "",
    })),
    deliveryAddress: {
      ...deliveryAddress,
      _type: "object",
    },
    subtotal,
    deliveryFee,
    tax,
    total,
    originalTotal: total,
    paymentMethod,
    paymentStatus: "pending",
    // THE LINK: Hardcoded reference to our seeded 'Order Placed' status
    status: { _type: "reference", _ref: "status-placed" },
    estimatedDeliveryTime: "30-45 minutes",
  };

  const createdOrder = await adminClient.create(orderDoc);

  // 5. Branching Logic (COD vs Stripe)
  if (paymentMethod === "cod") {
    return {
      url: `${baseUrl}/order-success?orderId=${createdOrder._id}`,
    };
  }

  // 6. Online Payment (Stripe Execution)
  const stripeLineItems = items.map((item) => {
    const dbRecord = dbFoods.find((f) => f._id === item.foodId);
    const securePrice = dbRecord ? Number(dbRecord.price) : 0;
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(securePrice * 100),
      },
      quantity: item.quantity,
    };
  });

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: stripeLineItems,
    mode: "payment",
    metadata: { sanityOrderId: createdOrder._id },
    success_url: `${baseUrl}/order-success?orderId=${createdOrder._id}&sessionId={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout`,
  });

  // Save transient session ID back to Sanity for Webhook reconciliation
  await adminClient
    .patch(createdOrder._id)
    .set({ StripeSessionId: stripeSession.id })
    .commit();

  return { url: stripeSession.url };
}

export async function handlePaymentSuccess(orderId: string) {
  if (!orderId) {
    throw new ServiceError("Order ID is required", "BAD_REQUEST");
  }

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
}

export async function handlePaymentFailure(orderId: string) {
  if (!orderId) {
    throw new ServiceError("Order ID is required", "BAD_REQUEST");
  }

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
}
