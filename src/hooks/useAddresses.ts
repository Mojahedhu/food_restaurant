import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

export function useAddresses() {
  const { data, error, isLoading, mutate, isValidating } = useSWR(
    "/api/addresses",
    fetcher,
  );

  return { addresses: data || [], error, isLoading, mutate, isValidating };
}
