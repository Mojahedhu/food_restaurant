import { NextResponse } from "next/server";
import { z } from "zod";
import { processCheckout } from "@/lib/services/client.checkout.service";
import { ServiceError } from "@/lib/services/errors";

// Compile-Time & Runtime Safety with Zod
const cartItemSchema = z.object({
  id: z.string(),
  foodId: z.string(),
  name: z.string(),
  price: z.number().min(0),
  quantity: z.number().min(1),
  image: z.string().optional(),
  size: z.string().optional(),
  variety: z.string().optional(),
});

const deliveryAddressSchema = z.object({
  _id: z.string().optional(),
  type: z.string().optional(),
  label: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  apartment: z.string().optional(),
  instructions: z.string().optional(),
});

const checkoutPayloadSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Cart cannot be empty"),
  deliveryAddress: deliveryAddressSchema,
  paymentMethod: z.enum(["online", "cod"]),
  userId: z.string().optional(),
  // Use generic empty string literals for unauthenticated sessions
  session: z
    .object({
      user: z
        .object({
          email: z.email().optional(),
          name: z.string().optional(),
        })
        .optional(),
    })
    .nullable()
    .optional(),
});

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON payload format" },
        { status: 400 },
      );
    }

    // Isolate Validation via safeParse (Rule: Defense-in-Depth)
    const parseResult = checkoutPayloadSchema.safeParse(body);
    if (!parseResult.success) {
      console.error(
        "[API_CHECKOUT_VALIDATION_ERROR]",
        z.treeifyError(parseResult.error),
      );
      return NextResponse.json(
        { message: "Invalid checkout data provided" },
        { status: 400 },
      );
    }

    // Process Business Logic in the Service Layer
    const result = await processCheckout({
      ...parseResult.data,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    });

    return NextResponse.json({ url: result.url });

  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.code === "NOT_FOUND" ? 404 : 400 }
      );
    }

    // Isolated Error Logging - Only print raw errors to Server Console
    console.error("[CHECKOUT_API_INTERNAL_ERROR]", error);

    return NextResponse.json(
      {
        message:
          "An unexpected database error occurred while processing your checkout",
      },
      { status: 500 },
    );
  }
}
