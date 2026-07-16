import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { ReviewSummary, ReviewMetricsSummary, ReviewMetrics, ReviewTotal } from "@/types/admin";
import { groq } from "next-sanity";

interface FetchReviewsParams {
  page: number;
  pageSize: number;
  search?: string;
  rating?: string; // "all" or "1"-"5"
  status?: string; // "all", "approved", "pending"
}

export async function fetchAdminReviewsPagedService({
  page,
  pageSize,
  search = "",
  rating = "all",
  status = "all",
}: FetchReviewsParams): Promise<{ reviews: ReviewSummary[]; total: number }> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  let filterClauses = `_type == "review"`;
  const params: Record<string, string | number> = { start, end };

  if (status === "approved") {
    filterClauses += ` && approved == true`;
  } else if (status === "pending") {
    filterClauses += ` && approved == false`;
  }

  if (rating !== "all") {
    const ratingValue = parseInt(rating, 10);
    if (!isNaN(ratingValue)) {
      filterClauses += ` && rating == $ratingVal`;
      params.ratingVal = ratingValue;
    }
  }

  if (search.trim()) {
    filterClauses += ` && (user->name match $search || food->name match $search || comment match $search)`;
    params.search = `*${search.trim()}*`;
  }

  const query = groq`{
    "reviews": *[${filterClauses}] | order(_createdAt desc)[$start...$end] {
      _id,
      _createdAt,
      rating,
      comment,
      approved,
      adminReply,
      food->{
        _id,
        name,
        images
      },
      user->{
        _id,
        name,
        email,
        image
      }
    },
    "total": count(*[${filterClauses}])
  }`;

  const { data } = await sanityFetch({
    query,
    params,
    tags: ["reviews"],
  });

  const res = data as ReviewTotal;
  return {
    reviews: (res.reviews || []) as ReviewSummary[],
    total: res.total || 0,
  };
}

export async function fetchAdminReviewMetricsService(): Promise<ReviewMetricsSummary> {
  const query = groq`{
    "totalReviews": count(*[_type == "review"]),
    "pendingReviews": count(*[_type == "review" && approved == false]),
    "averageRating": coalesce(math::avg(*[_type == "review"].rating), 0),
    "fiveStar": count(*[_type == "review" && rating == 5]),
    "fourStar": count(*[_type == "review" && rating == 4]),
    "threeStar": count(*[_type == "review" && rating == 3]),
    "twoStar": count(*[_type == "review" && rating == 2]),
    "oneStar": count(*[_type == "review" && rating == 1])
  }`;

  const { data } = await sanityFetch({
    query,
    params: {},
    tags: ["reviews"],
  });

  const res = data as ReviewMetrics;
  const total = res.totalReviews || 0;
  const distribution = [
    { stars: 5, count: res.fiveStar || 0 },
    { stars: 4, count: res.fourStar || 0 },
    { stars: 3, count: res.threeStar || 0 },
    { stars: 2, count: res.twoStar || 0 },
    { stars: 1, count: res.oneStar || 0 },
  ].map((item) => ({
    ...item,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));

  return {
    totalReviews: total,
    pendingReviews: res.pendingReviews || 0,
    averageRating: Math.round(res.averageRating * 10) / 10,
    distribution,
  };
}

export async function approveReviewService(reviewId: string) {
  await client.patch(reviewId).set({ approved: true }).commit();
}

export async function rejectReviewService(reviewId: string) {
  await client.patch(reviewId).set({ approved: false }).commit();
}

export async function replyToReviewService(reviewId: string, replyText: string) {
  await client.patch(reviewId).set({ adminReply: replyText }).commit();
}

export async function deleteReviewService(reviewId: string) {
  await client.delete(reviewId);
}
