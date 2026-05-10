"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Order } from "../../types/sanityTypes";
import { client } from "@/sanity/lib/client";

interface UserLiveOrdersProps {
  userId?: string;
  isAdmin?: boolean;
  initialOrders: Order[];
}

const LIMIT = 10;

export const useLiveOrders = ({
  userId,
  isAdmin,
  initialOrders,
}: UserLiveOrdersProps) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders ?? []);
  const [hasMore, setHasMore] = useState<boolean>(
    initialOrders?.length === LIMIT,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 🔒 internal refs (no re-render)
  // 🔑 Map for deduplication
  const orderMap = useRef<Map<string, Order>>(new Map());
  const pageRef = useRef<number>(initialOrders ? 1 : 0);
  const fetchingRef = useRef<boolean>(false); // 🚫 prevents double calls

  // ---------------------------
  // 🔁 Reset
  // ---------------------------
  const reset = () => {
    setOrders([]);
    setHasMore(true);
    pageRef.current = 0;
    orderMap.current.clear();
  };

  // ---------------------------
  // 🔥 GROQ query
  // ---------------------------
  const baseQuery = useMemo(() => {
    return isAdmin
      ? `*[_type == "order"] | order(username asc, _createdAt desc)`
      : `*[_type == "order" && user._ref == $userId] | order(_createdAt desc)`;
  }, [isAdmin]);

  // ---------------------------
  // 📦 Fetch paginated orders
  // ---------------------------
  const fetchOrders = useCallback(async () => {
    if (fetchingRef.current || !hasMore) return;

    fetchingRef.current = true;
    setIsLoading(true);

    const start = pageRef.current * LIMIT;
    const end = start + LIMIT;
    const query = `${baseQuery} [${start}...${end}]`;

    try {
      const newOrders = await client.fetch<Order[]>(query, {
        userId,
      });
      // 🧠 Merge safely
      setOrders((prev) => {
        const updated = [...prev];
        const map = orderMap.current;

        newOrders.forEach((order) => {
          if (!map.has(order._id)) {
            map.set(order._id, order);
            updated.push(order);
          }
        });

        return updated;
      });

      if (newOrders.length < LIMIT) {
        setHasMore(false);
      }
      pageRef.current += 1;
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      fetchingRef.current = false;
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, hasMore, baseQuery]);

  // ---------------------------
  // ⚡ Real-time listener
  // ---------------------------
  const listenQuery = useMemo(() => {
    return isAdmin
      ? `*[_type == "order"]`
      : `*[_type == "order" && user._ref == $userId]`;
  }, [isAdmin]);

  useEffect(() => {
    const subscription = client
      .listen(listenQuery, { userId }, { includeResult: true })
      .subscribe((event) => {
        if (!("transition" in event)) return;
        const doc = event.result as Order | null;
        if (!doc) return;

        setOrders((prev) => {
          const map = orderMap.current;
          switch (event.transition) {
            case "appear":
              // 🟢 CREATEcase "appear":
              if (map.has(doc._id)) return prev;
              map.set(doc._id, doc);
              return [doc, ...prev].sort(
                (a, b) =>
                  new Date(b._createdAt).getTime() -
                  new Date(a._createdAt).getTime(),
              );
            case "update":
              // 🟢 CREATE
              if (!map.has(doc._id)) return prev;
              map.set(doc._id, doc);
              return prev.map((o) => (o._id === doc._id ? doc : o));
            case "disappear":
              // 🔴 DELETE
              map.delete(doc._id);
              return prev.filter((o) => o._id !== doc._id);
            default:
              return prev;
          }
        });
      });

    return () => subscription.unsubscribe();
  }, [userId, listenQuery]);

  // ---------------------------
  // 🚀 Initial + dependency fetch
  // ---------------------------

  useEffect(() => {
    let cancelled = false; // 🛑 prevents stale updates

    reset();

    // 🟢 CASE 1: server provided data
    if (initialOrders.length > 0) {
      const map = orderMap.current;
      map.clear();
      initialOrders.forEach((order) => map.set(order._id, order));

      setOrders(initialOrders); // 🔥 IMPORTANT (you were missing this sync)
      setHasMore(initialOrders.length === LIMIT);
      pageRef.current = 1;
      return;
    }

    // 🔵 CASE 2: no initial data → fetch
    // force fresh fetch from page 0
    const fetchFirstPage = async () => {
      fetchingRef.current = true;
      setIsLoading(true);

      const start = 0;
      const end = LIMIT;

      const query = `${baseQuery} [${start}...${end}]`;

      try {
        const newOrders = await client.fetch<Order[]>(query, { userId });

        if (cancelled) return; // ✅ ignore outdated response

        const map = orderMap.current;
        map.clear();

        newOrders.forEach((order) => {
          map.set(order._id, order);
        });

        setOrders(newOrders);
        setHasMore(newOrders.length === LIMIT);
        pageRef.current = 1;
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchFirstPage();
    return () => {
      cancelled = true;
    }; // 🧹 cleanup on unmount
  }, [userId, isAdmin, baseQuery, initialOrders]);

  // ---------------------------
  // 🚀 Return
  // ---------------------------
  return {
    orders,
    fetchOrders,
    hasMore,
    loading: isLoading,
  };
};
