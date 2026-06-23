import { Metadata } from "next";
import {
  fetchAdminReviewsPaged,
  fetchAdminReviewMetrics,
} from "@/actions/admin-reviews";
import { ReviewMetricsCards } from "@/components/admin/features/reviews/reviewMetricsCards";
import { ReviewsTable } from "@/components/admin/features/reviews/reviewsTable";
import ReviewFilter from "@/components/admin/features/reviews/reviewsFilter";
import { PaginationControls } from "@/components/admin/features/orders/paginationControls";
import { Suspense } from "react";
import { ReviewsTableSkeleton } from "@/components/admin/features/reviews/reviewsTableSkeleton";

export const metadata: Metadata = {
  title: "Product Reviews Moderation | Quick Food Admin",
  description:
    "Approve customer comments, write admin responses, and monitor restaurant metrics.",
};

interface ReviewsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    rating?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function ReviewsModerationPage({
  searchParams,
}: ReviewsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";
  const rating = params.rating || "all";
  const status = params.status || "all";

  const pageSize = 10;

  // Fetch metrics instantly to render the dashboard shell
  const metrics = await fetchAdminReviewMetrics();

  return (
    <div className="space-y-6">
      {/* Header and Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Reviews & Feedback Center
        </h1>
        <p className="text-muted-foreground text-sm">
          Moderate incoming customer feedback, reply to user experiences, and
          inspect satisfaction scores.
        </p>
      </div>

      {/* Overview Statistics Cards */}
      <ReviewMetricsCards metrics={metrics} />

      {/* Reusable Client-Side Filters & Search */}
      <ReviewFilter />

      {/* Interactive Main Reviews List Table (Streamed) */}
      <div className="min-h-[400px]">
        <Suspense
          key={`${page}-${search}-${rating}-${status}`}
          fallback={<ReviewsTableSkeleton />}
        >
          <ReviewsTableContainer
            page={page}
            pageSize={pageSize}
            search={search}
            rating={rating}
            status={status}
          />
        </Suspense>
      </div>
    </div>
  );
}

// Nested Server Component to stream review data fetching and pagination controls
async function ReviewsTableContainer({
  page,
  pageSize,
  search,
  rating,
  status,
}: {
  page: number;
  pageSize: number;
  search: string;
  rating: string;
  status: string;
}) {
  const reviewsData = await fetchAdminReviewsPaged({
    page,
    pageSize,
    search,
    rating,
    status,
  });

  return (
    <>
      <ReviewsTable initialReviews={reviewsData.reviews} />
      <PaginationControls
        totalItems={reviewsData.total}
        currentPage={page}
        pageSize={pageSize}
      />
    </>
  );
}
