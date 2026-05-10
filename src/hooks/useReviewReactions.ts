// app/hooks/useReviewReactions.ts
"use client";

import { useOptimistic, useTransition } from "react";
import { toggleReaction } from "@/app/(client)/food/[foodSlug]/actions/review";

type OptimisticReactionState = {
  likesCount: number;
  dislikesCount: number;
  myReaction: "like" | "dislike" | null;
};

export function useReviewReactions(
  initialState: OptimisticReactionState,
  userId: string,
) {
  const [isPending, startTransition] = useTransition();

  const [optimisticState, setOptimistic] = useOptimistic(
    initialState,
    (state, action: { type: "like" | "dislike" }) => {
      const { type } = action;

      let { likesCount, dislikesCount, myReaction } = state;

      if (myReaction === type) {
        // remove
        if (type === "like") likesCount--;
        else dislikesCount--;

        myReaction = null;
      } else {
        if (type === "like") {
          likesCount++;
          if (myReaction === "dislike") dislikesCount--;
        } else {
          dislikesCount++;
          if (myReaction === "like") likesCount--;
        }

        myReaction = type;
      }

      return { likesCount, dislikesCount, myReaction };
    },
  );

  const handleToggle = (reviewId: string, type: "like" | "dislike") => {
    setOptimistic({ type });

    startTransition(() => {
      toggleReaction({ reviewId, userId, type });
    });
  };

  return {
    optimisticState,
    handleToggle,
    isPending,
  };
}
