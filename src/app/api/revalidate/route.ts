import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Webhook body: ", body);

    /**
     * Sanity webhook payload
     */
    const { _type, foodId, foodSlug } = body;
    /**
     * =========================
     * FOOD DOCUMENT UPDATED
     * =========================
     */

    /**
     * Revalidate food page cache
     */
    if (foodSlug) {
      revalidateTag(`food:${foodSlug}`, "max");

      console.log(`Revalidated tag: food:${foodSlug}`);
    }

    /**
     * =========================
     * REVIEW DOCUMENT UPDATED
     * =========================
     */
    if (_type === "review") {
      /**
       * review has:
       * food._ref
       */

      if (foodId) {
        revalidateTag(`reviews:${foodId}`, "max");

        console.log(`Revalidated tag: reviews:${foodId}`);
      }
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
    });
  } catch (error) {
    console.error("Error revalidating:", error);

    return NextResponse.json(
      {
        revalidated: false,
        error,
      },
      {
        status: 500,
      },
    );
  }
}
