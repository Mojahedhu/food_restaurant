import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart/cartStore";

let moduleActiveSession = true;

export const useOrderSuccessAccess = (orderId: string) => {
  const router = useRouter();
  const { clearCart } = useCartStore();
  const [isBlocked, setIsBlocked] = useState(false);

  // Add the useEffect to clear the cart immediately when this page loads
  useEffect(() => {
    // 1. Soft-Back Detection (Next.js SPA routing)
    if (!moduleActiveSession) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsBlocked(true);
      router.replace(`/user/orders/${orderId}`);
      return;
    }

    // 2. Catch BFCache restores (If the browser caches the page instantly on bookmark click)
    const handlePageShow = (event: PageTransitionEvent) => {
      // 🚀 Silently download the destination page in the background
      router.prefetch(`/user/orders/${orderId}`);
      if (event.persisted) {
        setIsBlocked(true);
        router.replace(`/user/orders/${orderId}`);
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    // 3. The Fort Knox Lockout (Catches bookmarks, switching tabs, and closing windows)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        document.cookie = `order_access_${orderId}=; max-age=0; path=/`;
      }
    };
    window.addEventListener("visibilitychange", handleVisibilityChange);

    // 4. Standard Initialization
    clearCart();
    document.cookie = `order_access_${orderId}=true; max-age=300; path=/`;

    return () => {
      // 5. Cleanup
      moduleActiveSession = false;
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearCart, orderId, router]);

  const handleNavigateAway = (path: string) => {
    document.cookie = `order_access_${orderId}=; max-age=0; path=/`;
    router.push(path);
  };

  return { isBlocked, handleNavigateAway };
};
