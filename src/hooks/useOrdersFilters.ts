"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function useOrdersFilters(initialSearch: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [localSearch, setLocalSearch] = useState(initialSearch);

  // Synchronize local state if the URL changes externally (e.g., Browser Back/Forward buttons)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalSearch(initialSearch);
  }, [initialSearch]);

  // Debounce user keystrokes into URL parameters to prevent UI stutter
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only push a router update if the debounced string actually differs from the active URL param
      if (localSearch !== initialSearch) {
        // eslint-disable-next-line react-hooks/immutability
        updateUrlParams({ search: localSearch, page: "1" });
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch, initialSearch]);

  // Synchronize state mutations with the Next.js router
  const updateUrlParams = (updates: Record<string, string>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return {
    localSearch,
    setLocalSearch,
    isPending,
    updateUrlParams,
  };
}
