import {
  createAddressAction,
  deleteAddressAction,
  updateAddressAction,
} from "@/app/actions/address";
import { fetcher } from "@/lib/fetcher";

import useSWR from "swr";
import { Address } from "../../types/sanityTypes";
import { handleDeleteDefault, setSingleDefault } from "@/lib/addresses-utils";
import auth from "../../auth";
import { useState } from "react";
import { mutate } from "swr";

export function useAddressMutation() {
  const key = "/api/addresses";
  const { data: addresses = [], isValidating } = useSWR(key, fetcher) as {
    data: Address[];
    isValidating: boolean;
  };

  // 🔥 mutation states
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ---------------- CREATE ----------------
  const createAddress = async (newAddress: Omit<Address, "_id">) => {
    const temp = { ...newAddress, _id: `temp${Date.now()}`, pending: true };

    mutate(key, (prev = []) => [temp, ...prev], false);

    setCreating(true);
    try {
      await createAddressAction(newAddress);

      return { success: true };
    } catch (error) {
      console.error(error);
      mutate(key); // Rollback
      return { success: false, error };
    } finally {
      setCreating(false);
    }
  };

  // ---------------- UPDATE ----------------

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    const current = addresses.find((a) => a._id === id);
    if (!current) return;

    const isSame = Object.keys(updates).every(
      (key) => current[key as keyof Address] === updates[key as keyof Address],
    );

    if (isSame) return;
    setUpdating(id);
    mutate(
      key,
      (prev: Address[] = []) => {
        let updated = prev.map((a) =>
          a._id === id ? { ...a, ...updates } : a,
        );

        // 🧠 handle default logic
        if (updates.isDefault === true) {
          updated = setSingleDefault(updated, id);
        }
        return updated;
      },
      false,
    );

    try {
      await updateAddressAction(id, updates);

      return { success: true };
    } catch (error) {
      console.error(error);
      mutate(key); // Rollback
      return { success: false, error };
    } finally {
      setUpdating(null);
    }
  };

  // ---------------- DELETE ----------------

  const deleteAddress = async (id: string) => {
    setDeleting(id);
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return;
    mutate(key, (prev = []) => handleDeleteDefault(prev, id), false);

    try {
      await deleteAddressAction(id, userId);
      mutate(key); //Revalidation
      return { success: true };
    } catch (error) {
      console.error(error);
      mutate(key); // Rollback
      return { success: false, error };
    } finally {
      setDeleting(null);
    }
  };

  return {
    // MUTATIONS
    createAddress,
    updateAddress,
    deleteAddress,

    // STATES
    creating,
    updating, // holds id of address being updated
    deleting, // holds id of address being deleted
    isValidating,
  };
}
