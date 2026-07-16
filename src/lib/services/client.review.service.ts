import { client } from "@/sanity/lib/client";
import { ReactionType } from "@/../sanity.types";
import { computeFoodMetrics, getReviewId } from "@/lib/utils/review-helpers";
import { ServiceError } from "./errors";

export async function upsertReview(
  userId: string,
  payload: {
    foodId: string;
    rating: number;
    comment: string;
    type: "create" | "edit";
    transactionId?: string;
  },
) {
  const {
    foodId,
    rating,
    comment,
    type,
    transactionId = crypto.randomUUID(),
  } = payload;
  const reviewId = getReviewId(foodId, userId);

  // Fetch existing review
  const existing = await client.fetch<{ _id: string; rating: number }>(
    `*[_type == "review" && _id == $reviewId][0] { _id, rating }`,
    { reviewId },
  );

  if (type === "edit" && !existing) {
    throw new ServiceError("Review not found", "NOT_FOUND");
  }
  if (type === "create" && existing) {
    throw new ServiceError("You have already reviewed this dish", "CONFLICT");
  }

  const food = await client.fetch<{
    ratingSum: number;
    ratingCount: number;
    slug: string;
  }>(`*[_id == $foodId][0] { ratingSum, ratingCount, "slug": slug.current }`, {
    foodId,
  });

  if (!food) {
    throw new ServiceError("Food item not found", "NOT_FOUND");
  }

  const previousRating = existing?.rating ?? 0;
  const tx = client.transaction();

  // Upsert Review
  const reviewData = {
    _id: reviewId,
    _type: "review",
    food: { _type: "reference", _ref: foodId },
    user: { _type: "reference", _ref: userId },
    rating,
    comment,
    approved: true, // Auto-approve reviews
  };

  if (!existing) {
    tx.create(reviewData);
  } else {
    tx.patch(reviewId, { set: { rating, comment } });
  }

  // Apply Deltas to Parent Product document using pure helpers
  const currentRatingSum = food.ratingSum ?? 0;
  const currentRatingCount = food.ratingCount ?? 0;

  if (type === "create") {
    const { ratingAverage, weightedRating } = computeFoodMetrics(
      currentRatingSum + rating,
      currentRatingCount + 1,
    );
    tx.patch(foodId, {
      setIfMissing: { ratingSum: 0, ratingCount: 0 },
      inc: { ratingSum: rating, ratingCount: 1 },
      set: { ratingAverage, weightedRating },
    });
  } else {
    const ratingDelta = rating - previousRating;
    const { ratingAverage, weightedRating } = computeFoodMetrics(
      currentRatingSum + ratingDelta,
      currentRatingCount,
    );
    tx.patch(foodId, {
      setIfMissing: { ratingSum: 0, ratingCount: 0 },
      inc: { ratingSum: ratingDelta },
      set: { ratingAverage, weightedRating },
    });
  }

  await tx.commit({ transactionId });

  return { transactionId, slug: food.slug };
}

export async function deleteReview(
  userId: string,
  payload: { foodId: string },
) {
  const { foodId } = payload;
  const reviewId = getReviewId(foodId, userId);

  const [existing, food, reactionIds] = await Promise.all([
    client.fetch<{ rating: number }>(`*[_id == $reviewId][0] { rating }`, {
      reviewId,
    }),
    client.fetch<{ ratingSum: number; ratingCount: number; slug: string }>(
      `*[_id == $foodId][0] { ratingSum, ratingCount, "slug": slug.current }`,
      { foodId },
    ),
    client.fetch<string[]>(
      `*[_type == "reviewReaction" && review._ref == $reviewId]._id`,
      { reviewId },
    ),
  ]);

  if (!existing || !food) {
    throw new ServiceError("Record not found", "NOT_FOUND");
  }

  const safeRatingSum = Math.max(0, (food.ratingSum ?? 0) - existing.rating);
  const safeRatingCount = Math.max(0, (food.ratingCount ?? 0) - 1);
  const { ratingAverage, weightedRating } = computeFoodMetrics(
    safeRatingSum,
    safeRatingCount,
  );

  const tx = client.transaction();
  reactionIds.forEach((id) => tx.delete(id));
  tx.delete(`metrics_${reviewId}`);
  tx.delete(reviewId);
  tx.patch(foodId, {
    set: {
      ratingSum: safeRatingSum,
      ratingCount: safeRatingCount,
      ratingAverage,
      weightedRating,
    },
  });

  await tx.commit();

  return { slug: food.slug };
}

export async function toggleReaction(
  userId: string,
  payload: {
    reviewId: string;
    foodId: string;
    reaction: "like" | "dislike" | null;
    mutationId?: string;
  },
) {
  const {
    reviewId,
    foodId,
    reaction,
    mutationId = crypto.randomUUID(),
  } = payload;
  const reactionId = `reaction_${reviewId}_${userId}`;
  const metricsId = `metrics_${reviewId}`;

  const existing = await client.fetch<{ type: ReactionType }>(
    `*[_id == $reactionId][0] { type }`,
    { reactionId },
  );

  const tx = client.transaction();

  if (!reaction) {
    if (existing) {
      tx.delete(reactionId);
      const decField =
        existing.type === "like" ? "likesCount" : "dislikesCount";

      // Use createIfNotExists for the metrics document to prevent "Document not found"
      tx.createIfNotExists({
        _id: metricsId,
        _type: "reviewMetrics",
        review: { _type: "reference", _ref: reviewId },
        food: { _type: "reference", _ref: foodId },
        likesCount: 0,
        dislikesCount: 0,
      });

      // Include setIfMissing just in case the fields were deleted
      tx.patch(metricsId, {
        setIfMissing: { likesCount: 0, dislikesCount: 0 },
        dec: { [decField]: 1 },
      });
    }
  } else {
    const isNew = !existing;

    // Ensure the metrics document exists before we attempt to patch it
    tx.createIfNotExists({
      _id: metricsId,
      _type: "reviewMetrics",
      review: { _type: "reference", _ref: reviewId },
      food: { _type: "reference", _ref: foodId },
      likesCount: 0,
      dislikesCount: 0,
    });

    if (isNew) {
      tx.create({
        _id: reactionId,
        _type: "reviewReaction",
        review: { _type: "reference", _ref: reviewId },
        food: { _type: "reference", _ref: foodId },
        user: { _type: "reference", _ref: userId },
        type: reaction,
      });
      const incField = reaction === "like" ? "likesCount" : "dislikesCount";
      tx.patch(metricsId, {
        setIfMissing: { likesCount: 0, dislikesCount: 0 },
        inc: { [incField]: 1 },
      });
    } else if (existing.type !== reaction) {
      tx.patch(reactionId, { set: { type: reaction } });
      const incField = reaction === "like" ? "likesCount" : "dislikesCount";
      const decField = reaction === "like" ? "dislikesCount" : "likesCount";
      tx.patch(metricsId, {
        setIfMissing: { likesCount: 0, dislikesCount: 0 },
        inc: { [incField]: 1 },
        dec: { [decField]: 1 },
      });
    }
  }

  await tx.commit({ transactionId: mutationId });
  return { success: true };
}
