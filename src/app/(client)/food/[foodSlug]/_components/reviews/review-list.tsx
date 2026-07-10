import { Button } from "@/components/ui/button";
import ReviewCard from "./review-card";
import { Loader2, SquarePen } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  useHasHydrated,
  useReviewIds,
} from "@/stores/review/useReviewSelectors";
import { useClientInfiniteScroll } from "@/hooks/useClientInfiniteScroll";

interface ReviewListProps {
  userId?: string;
}

export function ReviewList({ userId }: ReviewListProps) {
  // Fetch ONLY an array of string IDs natively from Zustand
  const reviewIds = useReviewIds();
  const totalReviews = reviewIds.length;
  const hasHydrated = useHasHydrated();

  const router = useRouter();
  const pathname = usePathname();

  // Rule 7: Delegate complex state and side-effects to custom hooks
  const { visibleItems, hasMore, isFetchingNextPage, sentinelRef } =
    useClientInfiniteScroll(reviewIds, 5);

  const handleWriteReview = () => {
    if (!userId) {
      const params = new URLSearchParams({ callbackUrl: pathname });
      router.push(`/auth/signin?${params.toString()}`, { scroll: false });
      return;
    }
    // URL-Driven State: Open the create form via URL
    router.push(`?writeReview=true`, { scroll: false });
  };

  return (
    <div className="mb-12">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Customer Reviews
            </h2>
            {hasHydrated && totalReviews > 0 && (
              <p className="text-muted-foreground">
                Based on {totalReviews} review
                {totalReviews !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <Button
            onClick={handleWriteReview}
            size={"lg"}
            className="h-fit px-4 py-2 rounded-lg cursor-pointer"
          >
            <SquarePen className="w-4 h-4" />
            <span className="hidden sm:inline">Write a Review</span>
            <span className="sm:hidden">Review</span>
          </Button>
        </div>
        <div className="space-y-6 max-w-4xl">
          {totalReviews > 0 && (
            <h3 className="text-xl font-semibold text-foreground">
              All Reviews ({totalReviews})
            </h3>
          )}
          <div className="space-y-4">
            {/* 👇 HYDRATION LOGIC HERE */}
            {!hasHydrated ? (
              // 1. Show loading UI during SSR and Hydration
              <div className="flex justify-center items-center py-12 bg-muted/10 rounded-lg max-w-2xl mx-auto">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/50" />
              </div>
            ) : totalReviews === 0 ? (
              // 2. Show Empty State ONLY after hydrated and confirmed 0 reviews
              <div className="text-center py-12 bg-muted/30 rounded-lg max-w-2xl mx-auto border border-dashed animate-in fade-in duration-500">
                <p className="text-muted-foreground">
                  No reviews yet. Be the first to share your experience!
                </p>
              </div>
            ) : (
              // 3. Show Reviews
              <>
                {/* Rule 4: Map Safety with fallback array */}
                {(visibleItems || []).map((id) => {
                  return (
                    // Map over primitive string IDs instead of massive objects
                    <div
                      key={id}
                      // Rule 5: Fluid Route & Component Transitions
                      className="transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-bottom-4 zoom-in-95"
                    >
                      {/* Rule 7: Zero prop drilling. Only passing data & auth context */}
                      {/* Pass ONLY the string ID to the card */}
                      <ReviewCard id={id} userId={userId} />
                    </div>
                  );
                })}
                {/* 4. Intersection Observer Sentinel */}
                {hasMore && (
                  <div
                    ref={sentinelRef}
                    className="w-full flex justify-center py-8 opacity-75"
                  >
                    <Loader2
                      className={`w-6 h-6 text-muted-foreground/50 transition-all duration-300 ${isFetchingNextPage ? "animate-spin opacity-100" : "opacity-0"}`}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
