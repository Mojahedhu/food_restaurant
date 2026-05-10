// app/actions/toggleReaction.ts
"use server";

import { client } from "@/sanity/lib/client";
import { ReviewsWithReactionsByFoodIdQueryResult as Review } from "../../../../../../types/sanityTypes";

export async function toggleReaction({
  reviewId,
  userId,
  type,
}: {
  reviewId: string;
  userId: string;
  type: "like" | "dislike";
}) {
  const existing = await client.fetch(
    `*[_type == "reviewReaction" && review._ref == $reviewId && user._ref == $userId][0]`,
    { reviewId, userId },
  );

  const tx = client.transaction();

  if (!existing) {
    tx.create({
      _type: "reviewReaction",
      review: { _type: "reference", _ref: reviewId },
      user: { _type: "reference", _ref: userId },
      type,
    });

    tx.patch(reviewId, (p) =>
      p.inc({
        likesCount: type === "like" ? 1 : 0,
        dislikesCount: type === "dislike" ? 1 : 0,
      }),
    );
  } else if (existing.type === type) {
    tx.delete(existing._id);

    tx.patch(reviewId, (p) =>
      p.dec({
        likesCount: type === "like" ? 1 : 0,
        dislikesCount: type === "dislike" ? 1 : 0,
      }),
    );
  } else {
    tx.patch(existing._id, { set: { type } });

    tx.patch(reviewId, (p) =>
      p.inc({
        likesCount: type === "like" ? 1 : -1,
        dislikesCount: type === "dislike" ? 1 : -1,
      }),
    );
  }

  await tx.commit();
}

export async function createReview(formData: Review) {
  const foodId = formData.food?._id as string;
  const comment = formData.comment as string;
  const rating = formData.rating as number;
  const reviewId = formData._id as string;
  const existingReview = await client.fetch(
    `*[_type == "review" && food._ref == $foodId && _id == $reviewId][0]`,
    { foodId, reviewId },
  );

  if (existingReview) {
    return { success: false, message: "Review already exists" };
  }

  await client.create({
    _type: "review",
    food: { _type: "reference", _ref: foodId },
    rating,
    comment,
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}

export async function updateReview(formData: Partial<Review>) {
  const reviewId = formData._id as string;
  const comment = formData.comment as string;
  const rating = formData.rating as number;
  const existingReview = await client.fetch(
    `*[_type == "review" && _id == $reviewId][0]`,
    { reviewId },
  );

  if (!existingReview) {
    return { success: false, message: "Review not found" };
  }

  await client
    .patch(reviewId)
    .set({
      rating,
      comment,
    })
    .commit();

  return { success: true };
}

export async function deleteReview(reviewId: string) {
  const existing = client.fetch(`*[_type == "review" && _id == $reviewId][0]`, {
    reviewId,
  });
  if (!existing) return;
  await client.delete(reviewId);
  return { success: true };
}
