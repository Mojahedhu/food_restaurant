import { useEffect } from "react";
import { client } from "@/sanity/lib/client";
import { ADDRESSES_QUERY } from "@/lib/query";
import { useAddressStore } from "@/features/address/store/addressStore";
import { Address } from "../../types/sanityTypes";

const query = ADDRESSES_QUERY;

export function useLiveAddress(userId: string) {
  const {
    setAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setInitializing,
  } = useAddressStore();

  useEffect(() => {
    let mounted = true;

    if (!userId) {
      setAddresses([]);
      setInitializing(false);
      return;
    }

    setInitializing(true);
    // 1️⃣ Initial fetch (ONLY ONCE)
    (async () => {
      try {
        const res = await client.fetch<Address[]>(query, { userId });

        if (!mounted) return;
        setAddresses(res);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setInitializing(false);
      }
    })();

    // ✅ Live updates
    const sub = client
      .listen(query, { userId }, { includeResult: true })
      .subscribe((event) => {
        // ✅ Narrow type (ignore reconnect events)
        if (!("transition" in event)) return;
        switch (event.transition) {
          case "appear":
            if (event.result) {
              addAddress({
                ...event.result,
                pending: false,
              });
            }
            break;
          case "disappear":
            deleteAddress(event.documentId);
            break;
          case "update":
            if (event.result) {
              updateAddress(event.documentId, event.result);
            }
            break;
        }
      });
    return () => {
      mounted = false;
      sub.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
}
