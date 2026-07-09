"use client";

import {
  type ReactNode,
  createContext,
  useRef,
  useContext,
  useEffect,
} from "react";
import { type StoreApi, useStore } from "zustand";
import { createReviewStore, type ReviewStore } from "./useReviewStore";
import { ReviewView } from "../../../types/sanityTypes";

export const ReviewStoreContext = createContext<
  StoreApi<ReviewStore> | undefined
>(undefined);

export interface ReviewStoreProviderProps {
  children: ReactNode;
  value: ReviewView[];
}

export const ReviewStoreProvider = ({
  children,
  value,
}: ReviewStoreProviderProps) => {
  const storeRef = useRef<StoreApi<ReviewStore>>(undefined);

  // eslint-disable-next-line react-hooks/refs
  if (!storeRef.current) {
    // 2. Create the store instance
    const store = createReviewStore();

    // 3. Immediately hydrate it with the server data before the first render!
    if (value && value.length > 0) {
      store.getState().bootstrapReviews(value);
    }

    // ✅ FIXED: Assign the populated store!
    storeRef.current = store;
  }

  // 👇 ADD THIS EFFECT: Tells Zustand that React has finished hydration
  useEffect(() => {
    if (storeRef.current) {
      storeRef.current.getState().setHasHydrated(true);
    }
  }, []);

  return (
    // eslint-disable-next-line react-hooks/refs
    <ReviewStoreContext.Provider value={storeRef.current}>
      {children}
    </ReviewStoreContext.Provider>
  );
};

/**
 * Internal Context Consumer
 * Throws a clean error if a hook is used outside the provider boundary.
 */
export const useReviewStoreContext = <T,>(
  selector: (store: ReviewStore) => T,
): T => {
  const reviewStoreContext = useContext(ReviewStoreContext);

  if (!reviewStoreContext) {
    throw new Error(
      "useReviewStoreContext must be used within a ReviewStoreProvider",
    );
  }

  return useStore(reviewStoreContext, selector);
};
