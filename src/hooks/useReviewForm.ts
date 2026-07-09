"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useReviewMutations } from "./useReviewMutations";

import { UserImage } from "../../sanity.types";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useReviewDisplay } from "@/stores/review/useReviewSelectors";

interface UseReviewFormOptions {
  foodId?: string;
  foodName?: string;
  formType: "create" | "edit";
  editReviewId: string | null;
}

export function useReviewForm({
  foodId,
  foodName,
  formType,
  editReviewId,
}: UseReviewFormOptions) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({ rating: 0, comment: "" });
  const [isPending, startTransition] = useTransition();

  // 1. Self-Sufficient Mutations: Fetch its own creation/update actions
  const { createReview, updateReview } = useReviewMutations();

  // 2. Fetch the review data from the store if editing!
  const reviewToEdit = useReviewDisplay(editReviewId || "");
  const isAuthenticated = session.status === "authenticated";
  const userId = session.data?.user?.id;

  // Auto-populate when edit modal opens
  useEffect(() => {
    if (formType === "edit" && reviewToEdit?.review) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        rating: reviewToEdit.review.rating || 0,
        comment: reviewToEdit.review.comment || "",
      });
    } else if (formType === "create") {
      setForm({ rating: 0, comment: "" });
    }
  }, [reviewToEdit?.review, formType]);

  // ----------- Handle Submit -------------------
  const handleSubmit = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!userId || !foodId) return;
      startTransition(async () => {
        if (formType === "create") {
          // ✅ Generate the proper optimistic ID first
          const reviewId = `review_${foodId}_${userId}`;

          const res = await createReview({
            foodId,
            rating: form.rating,
            comment: form.comment,
            // ... optimistic payload logic ...
            optimisticReview: {
              review: {
                _id: reviewId,
                _type: "review" as const, // 👈 Mocks required _type
                _rev: "optimistic-rev", // 👈 Mocks required _rev
                _updatedAt: new Date().toISOString(), // 👈 Mocks required
                _createdAt: new Date().toISOString(),
                rating: form.rating,
                comment: form.comment,
                approved: true,

                foodName: foodName || "",
                food: {
                  // 👈 Mocks required food reference
                  _type: "reference" as const,
                  _ref: foodId,
                },
                user: {
                  _id: userId,
                  name: session.data?.user?.name || "You",
                  image: {
                    source: "url",
                    url: session.data?.user?.image || "",
                  } as UserImage,
                },
              },
              pendingMutations: [],
              confirmedReaction: null,
              metrics: {
                reviewId: reviewId,
                likesCount: 0,
                dislikesCount: 0,
              },
            },
          });

          if (res.success) {
            toast.success("Review added successfully! 🎉");
            const params = new URLSearchParams(searchParams.toString());
            params.delete("writeReview");
            params.delete("editReview");
            router.push(`${pathname}?${params.toString()}`, { scroll: false }); // Close modal
          }
        } else if (formType === "edit") {
          const res = await updateReview({
            reviewId: editReviewId || "",
            foodId,
            rating: form.rating,
            comment: form.comment,
          });
          if (res.success) {
            toast.success("Review updated successfully! 🎉");
            router.push(pathname, { scroll: false }); // Close modal
          }
        }
      });
    },
    [
      createReview,
      editReviewId,
      foodId,
      foodName,
      form.comment,
      form.rating,
      formType,
      pathname,
      router,
      searchParams,
      session.data?.user?.image,
      session.data?.user?.name,
      updateReview,
      userId,
    ],
  );

  const setRating = useCallback((rating: number) => {
    setForm((prev) => ({ ...prev, rating }));
  }, []);

  const setComment = useCallback((comment: string) => {
    setForm((prev) => ({ ...prev, comment }));
  }, []);

  return {
    form,
    setRating,
    setComment,
    isPending,
    isAuthenticated,
    handleSubmit,
  };
}
