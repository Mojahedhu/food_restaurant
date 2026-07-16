"use server";

import auth from "../../auth";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import {
  upsertReview,
  deleteReview,
  toggleReaction,
} from "@/lib/services/client.review.service";
import { ServiceError } from "@/lib/services/errors";

// Validation Schemas
const ReviewInputSchema = z.object({
  foodId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(10, "Comment must be at least 10 characters")
    .max(1000),
  type: z.enum(["create", "edit"]),
  transactionId: z.string().uuid().optional(),
});

const ToggleReactionSchema = z.object({
  reviewId: z.string().min(1),
  foodId: z.string().min(1),
  reaction: z.enum(["like", "dislike"]).nullable(),
  mutationId: z.string().uuid().optional(),
});

export async function upsertReviewAction(payload: unknown) {
  try {
    const parsed = ReviewInputSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid input data",
      };
    }

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized: Please sign in to submit a review",
      };
    }

    // Call the Service Layer
    const result = await upsertReview(userId, parsed.data);

    // Revalidate Next.js Cache (HTTP/Framework boundary)

    revalidateTag(`reviews:${parsed.data.foodId}`, "max");

    revalidateTag(`food:${result.slug}`, "max");

    return { success: true, transactionId: result.transactionId };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error("[UPSERT_REVIEW_ACTION_ERROR]", error);
    return { success: false, error: "Database transaction failed" };
  }
}

export async function deleteReviewAction(payload: unknown) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized" };

    const parsed = z.object({ foodId: z.string().min(1) }).safeParse(payload);
    if (!parsed.success) return { success: false, error: "Invalid parameters" };

    // Call the Service Layer
    const result = await deleteReview(userId, parsed.data);

    // Revalidate Next.js Cache
    revalidateTag(`reviews:${parsed.data.foodId}`, "max");

    revalidateTag(`food:${result.slug}`, "max");

    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error("[DELETE_REVIEW_ACTION_ERROR]", error);
    return { success: false, error: "Deletion failed" };
  }
}

export async function toggleReactionAction(payload: unknown) {
  try {
    const parsed = ToggleReactionSchema.safeParse(payload);
    if (!parsed.success)
      return { success: false, error: "Invalid reaction inputs" };

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized" };

    // Call the Service Layer
    await toggleReaction(userId, parsed.data);

    // Revalidate Next.js Cache

    revalidateTag(`reviews:${parsed.data.foodId}`, "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error("[TOGGLE_REACTION_ACTION_ERROR]", error);
    return { success: false, error: "Reaction transaction failed" };
  }
}
