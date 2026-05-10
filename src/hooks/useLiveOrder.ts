"use client";
import { useEffect, useState } from "react";
import { Order } from "../../types/sanityTypes";
import { client } from "@/sanity/lib/client";

export const useLiveOrder = (orderId: string, initialOrder?: Order) => {
  const [order, setOrder] = useState<Partial<Order> | null>(
    initialOrder || null,
  );
  const [loading, setLoading] = useState(!initialOrder);
  const [error, setError] = useState<string | null>(null);
  const query = `*[_type == "order" && _id == $id][0]`;
  useEffect(() => {
    if (!orderId || initialOrder) return;

    // 💹 Fetch initial Data
    client
      .fetch(query, { id: orderId })
      .then((data) => {
        setOrder(data);
      })
      .catch((error) => {
        console.error("Error fetching order:", error);
        setError("Failed to fetch order");
      })
      .finally(() => {
        setLoading(false);
      });

    // 🔁 Listen for real-time updates
    const subscribe = client
      .listen(query, { id: orderId })
      .subscribe((update) => {
        if (update.result) {
          setOrder(update.result as Partial<Order>);
        }
      });
    return () => {
      subscribe.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return { order, loading, error };
};
