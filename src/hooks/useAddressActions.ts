"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
} from "@/actions/address";

import { Address } from "@/../types/sanityTypes";
// ---------------- FETCHER ----------------
import { fetcher } from "@/lib/fetcher";
// ---------------- HELPERS ----------------
// 🧠 ensure only one default
import { setSingleDefault } from "@/lib/addresses-utils";
// 🧠 handle delete default
import { handleDeleteDefault } from "@/lib/addresses-utils";

// ---------------- HOOK ----------------
const key = "/api/addresses";
export function useAddressActions() {
  // 🔥 read data
  const { data: addresses = [], isLoading } = useSWR<Address[]>(key, fetcher, {
    dedupingInterval: 5000,
  }) as { data: Address[]; isLoading: boolean };

  // ---------------- CREATE ----------------

  const { trigger: createTrigger, isMutating: creating } = useSWRMutation<
    { success: boolean; addressId: string }, // response
    unknown, // error
    string, // key
    Omit<Address, "_id"> // arg
  >(key, async (_, { arg }) => createAddressAction(arg));

  const createAddress = async (newAddress: Omit<Address, "_id">) => {
    const tempId = "temp-" + Date.now();

    const temp = {
      ...newAddress,
      _id: tempId,
      pending: true,
      isDefault: addresses.length === 0 || newAddress.isDefault === true, // 🧠 auto default
    };

    // ⚡ optimistic
    await mutate(
      key,
      (prev: Address[] = []) => {
        let updated = [temp, ...prev];

        if (temp.isDefault) {
          updated = setSingleDefault(updated, tempId);
        }

        return updated;
      },
      false,
    );

    try {
      await createTrigger(newAddress);

      toast.success("Address added");

      // 🔄 sync later (no rush)
      mutate(key);
      return { success: true };
    } catch (err) {
      console.error(err);

      toast.error("Failed to add address");

      mutate(key); // rollback
      return { success: false };
    }
  };

  // ---------------- UPDATE ----------------

  const { trigger: updateTrigger, isMutating: updating } = useSWRMutation<
    { success: boolean; addressId?: string; error?: unknown }, // response
    unknown, // error
    string, // key
    { id: string; updates: Partial<Address> } // arg
  >(key, async (_, { arg }) => updateAddressAction(arg.id, arg.updates));

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    // ⚡ optimistic
    await mutate(
      key,
      (prev: Address[] = []) => {
        // 🧠 prevent useless update
        const current = addresses.find((a) => a._id === id);
        if (!current) return prev;

        const isSame = Object.keys(updates).every(
          (key) =>
            current[key as keyof Address] === updates[key as keyof Address],
        );

        if (isSame) return prev;
        let updated = prev.map((a) =>
          a._id === id ? { ...a, ...updates } : a,
        );

        if (updates.isDefault) {
          updated = setSingleDefault(updated, id);
        }

        return updated;
      },
      false,
    );

    try {
      await updateTrigger({ id, updates });

      toast.success("Address updated");
    } catch (err) {
      console.error(err);

      toast.error("Update failed");

      mutate(key); // rollback
    }
  };

  // ---------------- DELETE ----------------

  const { trigger: deleteTrigger, isMutating: deleting } = useSWRMutation<
    { success: boolean }, // response
    unknown, // error
    string, // key
    { id: string; userId: string } // arg
  >(key, async (_, { arg }) => deleteAddressAction(arg.id, arg.userId));

  const deleteAddress = async (id: string, userId: string) => {
    const target = addresses.find((a) => a._id === id);
    if (!target) return;

    // 🚫 UX rule
    if (target.isDefault && addresses.length > 1) {
      toast.error("Select another default first");
      return;
    }

    // ⚡ optimistic
    await mutate(
      key,
      (prev: Address[] = []) => handleDeleteDefault(prev, id),
      false,
    );

    try {
      await deleteTrigger({ id, userId });

      toast.success("Address deleted");

      mutate(key);
    } catch (err) {
      console.error(err);

      toast.error("Delete failed");

      mutate(key); // rollback
    }
  };

  // ---------------- RETURN ----------------

  return {
    addresses,
    isLoading,

    // actions
    createAddress,
    updateAddress,
    deleteAddress,

    // states
    creating,
    updating,
    deleting,
  };
}
