// app/actions/toggleReaction.ts
"use server";

import { client } from "@/sanity/lib/client";

import { revalidateTag } from "next/cache";
import { ReactionType } from "../../../../../../sanity.types";
import auth from "../../../../../../auth";
import { getDislikesCount, getLikesCount } from "@/lib/data/review";

/**
 * =========================================================
 * ReactionId
 * =========================================================
 */

export async function getReactionId(reviewId: string, userId: string) {
  return `reaction_${reviewId}_${userId}`;
}

/**
 * =========================================================
 * MetricsId
 * =========================================================
 */

export async function getMetricsId(reviewId: string) {
  return `metrics_${reviewId}`;
}

/**
 * =========================================================
 * Toggle reaction mutation
 * =========================================================
 */

interface toggleReactionInput {
  reviewId: string;
  foodId: string;
  reaction: ReactionType | null;
  mutationId?: string;
}

export async function toggleReaction({
  reviewId,
  reaction,
  mutationId,
  foodId,
}: toggleReactionInput) {
  /**
   * =====================================================
   * Authentication
   * =====================================================
   */

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      success: false,
      message: "You must be logged in to toggle reaction",
    };
  }

  /**
   * =====================================================
   * Deterministic document id
   * =====================================================
   */

  const reactionId = await getReactionId(reviewId, userId);
  const metricsId = await getMetricsId(reviewId);

  /**
   * =====================================================
   * Existing reaction
   * =====================================================
   */

  const existing = await client.fetch(
    `
      *[
        _id == $reactionId
      ][0]
      {
        _id,
        type,
        review,
        food
      }
      `,
    { reactionId },
  );

  /**
   * =====================================================
   * Transaction
   * =====================================================
   */

  const tx = client.transaction();

  /**
   * =====================================================
   * Create metrics document if not exists
   * =====================================================
   */

  tx.createIfNotExists({
    _id: metricsId,
    _type: "reviewMetrics",
    review: {
      _type: "reference",
      _ref: reviewId,
    },
    food: {
      _type: "reference",
      _ref: foodId,
    },
    likesCount: 0,
    dislikesCount: 0,
  });

  /**
   * =====================================================
   * Toggle OFF
   * =====================================================
   */

  if (!reaction) {
    if (!existing) {
      return {
        success: true,
        message: "No existing reaction",
        mutationId,
      };
    }
    // tx.delete(reactionId);
    tx.patch(reactionId, {
      set: {
        type: null,
        mutationId: mutationId,
      },
    });

    /**
     * ===============================================
     * Decrement previous counter
     * ===============================================
     */

    if (existing.type === "like") {
      tx.patch(metricsId, {
        dec: {
          likesCount: 1,
        },
      });
    }

    if (existing.type === "dislike") {
      tx.patch(metricsId, {
        dec: {
          dislikesCount: 1,
        },
      });
    }
    try {
      await tx.commit();
      // delete this after settle the migration
      revalidateTag(`reviews:${foodId}`, "max");
      return {
        success: true,
        message: "Reaction toggled off successfully",
        mutationId,
      };
    } catch (error) {
      console.log(error);
      return { success: false, message: "Failed to toggle reaction", error };
    }
  }

  /**
   * =====================================================
   * Determine count transitions
   * =====================================================
   */

  const previousReaction = (existing?.type as ReactionType | undefined) ?? null;

  /**
   * =====================================================
   * Upsert reaction
   * =====================================================
   */

  if (existing) {
    tx.patch(reactionId, {
      set: {
        type: reaction,
        mutationId,
      },
    });
  } else {
    tx.createOrReplace({
      _id: reactionId,
      _type: "reviewReaction",
      review: { _type: "reference", _ref: reviewId },
      food: { _type: "reference", _ref: foodId },
      user: { _type: "reference", _ref: userId },
      type: reaction,
      mutationId,
    });
  }
  /**
   * =====================================================
   * Count reconciliation
   * =====================================================
   */

  let likesDelta = 0;
  let dislikesDelta = 0;

  if (previousReaction === "like") {
    likesDelta--;
  }

  if (previousReaction === "dislike") {
    dislikesDelta--;
  }

  if (reaction === "like") {
    likesDelta++;
  }

  if (reaction === "dislike") {
    dislikesDelta++;
  }

  /**
   * Dislike → Like - Like → Dislike - New Like - New Dislike
   */

  tx.patch(metricsId, {
    inc: {
      likesCount: likesDelta,
      dislikesCount: dislikesDelta,
    },
  });

  /**
   * =====================================================
   * Commit transaction
   * =====================================================
   */

  try {
    await tx.commit();
    revalidateTag(`reviews:${foodId}`, "max");
    return {
      success: true,
      message: "Reaction toggled successfully",
      mutationId,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to toggle reaction", error };
  }
}

export async function rebuildMetrics(reviewId: string) {
  const likes = await getLikesCount(reviewId);
  const dislikes = await getDislikesCount(reviewId);

  await client
    .patch(await getMetricsId(reviewId))
    .set({
      likesCount: likes,
      dislikesCount: dislikes,
    })
    .commit();
}
