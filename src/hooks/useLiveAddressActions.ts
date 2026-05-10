import { useAddressStore } from "@/features/address/store/addressStore";
import { Address } from "../../types/sanityTypes";
import {
  createAddressAction,
  deleteAddressAction,
  updateAddressAction,
} from "@/app/actions/address";
import { toast } from "sonner";
import { setSingleDefault } from "@/lib/addresses-utils";

export function useLiveAddressActions() {
  const store = useAddressStore();

  // ---------------- CREATE ----------------
  const createAddress = async (newAddress: Omit<Address, "_id">) => {
    const tempId = `temp-${Date.now()}`;

    const temp = {
      ...newAddress,
      _id: tempId,
      isDefault: store.addAddress.length === 0 || newAddress.isDefault === true,
      pending: true,
    };

    // ⚡ instant UI
    store.addAddress(temp);
    store.setCreating(true);
    try {
      await createAddressAction(newAddress);
      toast.success("New Address create successfully");
      return { success: true, error: null };
    } catch (error) {
      console.error(error);
      toast.error("Failed to create new address"); // rollback
      return { success: false, error: error };
    } finally {
      store.setCreating(false);
    }
  };

  // ---------------- UPDATE ----------------
  const updateAddress = async (id: string, updates: Partial<Address>) => {
    store.setUpdatingId(id);
    store.setUpdating(true);

    // ⚡ instant UI
    store.updateAddress(id, updates);

    if (updates.isDefault) {
      store.setDefault(id);
    }

    try {
      await updateAddressAction(id, updates);
      toast.success("Address updated successfully");
      return { success: true, error: null };
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
      return { success: false, error: error };
    } finally {
      store.setUpdatingId(null);
      store.setUpdating(false);
    }
  };

  // ---------------- DELETE ----------------
  const deleteAddress = async (id: string, userId: string) => {
    store.setDeletingId(id);
    const prev = store.addresses;

    // ⚡ instant UI
    store.deleteAddress(id);

    try {
      await deleteAddressAction(id, userId);
      toast.success("Address delete successfully");
      return { success: true, error: null };
    } catch (error) {
      console.error(error);
      toast.error("Deletion failed");
      store.setAddresses(prev);
      return { success: false, error: null };
    } finally {
      store.setDeletingId(null);
    }
  };

  return {
    createAddress,
    updateAddress,
    deleteAddress,
  };
}
