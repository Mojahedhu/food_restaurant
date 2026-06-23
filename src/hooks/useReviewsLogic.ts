"use client";

import { useTransition, useState, useEffect } from "react";
import { ReviewSummary } from "@/types/admin";
import {
  approveReviewAction,
  rejectReviewAction,
  deleteReviewAction,
  replyToReviewAction,
} from "@/actions/admin-reviews";
import { toast } from "sonner";

export function useReviewsLogic(initialReviews: ReviewSummary[]) {
  const [isPending, startTransition] = useTransition();

  // Dictionary to store local overrides: { [reviewId]: Partial<ReviewSummary> }
  const [localUpdates, setLocalUpdates] = useState<
    Record<string, Partial<ReviewSummary> | { _id: null }>
  >({});

  // Sync and clean up local overrides when server data updates
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalUpdates((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const reviewId in next) {
        const serverReview = initialReviews.find((r) => r._id === reviewId);
        const localUpdate = next[reviewId];

        // If review is deleted local-only, we keep it hidden until it leaves the server payload
        if (localUpdate._id === null) {
          if (!serverReview) {
            delete next[reviewId];
            changed = true;
          }
          continue;
        }

        if (serverReview) {
          const isApprovedSynced =
            localUpdate.approved === undefined ||
            serverReview.approved === localUpdate.approved;
          const isReplySynced =
            localUpdate.adminReply === undefined ||
            serverReview.adminReply === localUpdate.adminReply;

          if (isApprovedSynced && isReplySynced) {
            delete next[reviewId];
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [initialReviews]);

  // Combine server reviews with local override details, excluding those marked as deleted (null ID)
  const reviews = initialReviews
    .map((review) => {
      const update = localUpdates[review._id];
      if (update && update._id === null) return null; // Marked for deletion
      return update ? { ...review, ...update } : review;
    })
    .filter((r): r is ReviewSummary => r !== null);

  const handleApprove = async (reviewId: string) => {
    // 1. Apply local optimistic status update
    setLocalUpdates((prev) => ({
      ...prev,
      [reviewId]: { approved: true },
    }));

    startTransition(async () => {
      const result = await approveReviewAction({ reviewId });
      if (result.success) {
        toast.success("Review approved successfully! 🎉");
      } else {
        toast.error("Failed to approve review.");
        // Rollback local change
        setLocalUpdates((prev) => {
          const next = { ...prev };
          delete next[reviewId];
          return next;
        });
      }
    });
  };

  const handleReject = async (reviewId: string) => {
    // 1. Apply local optimistic status update
    setLocalUpdates((prev) => ({
      ...prev,
      [reviewId]: { approved: false },
    }));

    startTransition(async () => {
      const result = await rejectReviewAction({ reviewId });
      if (result.success) {
        toast.success("Review retracted/disapproved. ⏳");
      } else {
        toast.error("Failed to update review status.");
        // Rollback local change
        setLocalUpdates((prev) => {
          const next = { ...prev };
          delete next[reviewId];
          return next;
        });
      }
    });
  };

  const handleReply = async (reviewId: string, replyText: string) => {
    // 1. Apply local optimistic reply update
    setLocalUpdates((prev) => ({
      ...prev,
      [reviewId]: { ...prev[reviewId], adminReply: replyText },
    }));

    // Promise to handle loading toast easily
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const result = await replyToReviewAction({ reviewId, replyText });
        if (result.success) {
          toast.success("Admin reply published! 💬");
          resolve(true);
        } else {
          toast.error(result.error || "Failed to publish reply.");
          // Rollback local change
          setLocalUpdates((prev) => {
            const next = { ...prev };
            if (next[reviewId] && !("_id" in next[reviewId])) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { adminReply, ...rest } = next[reviewId];
              if (Object.keys(rest).length === 0) {
                delete next[reviewId];
              } else {
                next[reviewId] = rest;
              }
            }
            return next;
          });
          resolve(false);
        }
      });
    });
  };

  const handleDelete = async (reviewId: string) => {
    // 0. Capture previous state to restore on rollback
    const previousUpdate = localUpdates[reviewId];

    // 1. Apply local optimistic deletion (null ID acts as deletion flag)
    setLocalUpdates((prev) => ({
      ...prev,
      [reviewId]: { _id: null },
    }));

    startTransition(async () => {
      const result = await deleteReviewAction({ reviewId });
      if (result.success) {
        toast.success("Review deleted permanently.");
      } else {
        toast.error("Failed to delete review.");
        // Rollback local change
        setLocalUpdates((prev) => {
          const next = { ...prev };
          if (previousUpdate) {
            next[reviewId] = previousUpdate;
          } else {
            delete next[reviewId];
          }
          return next;
        });
      }
    });
  };

  return {
    reviews,
    isPending,
    handleApprove,
    handleReject,
    handleReply,
    handleDelete,
  };
}
