import { useState } from "react";
import { toast } from "sonner";
import { useAddressStore } from "@/features/address/store/addressStore";
import {
  createAddressAction,
  deleteAddressAction,
  getAddressAction,
  updateAddressAction,
} from "@/app/actions/address";

type AddressForm = {
  label: string;
  street: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  instructions: string;
  isDefault: boolean;
};

export const useAddress = (userId?: string) => {
  const [loading, setLoading] = useState(false);
  const store = useAddressStore();
  const {
    addAddress: addOptimisticAddress,
    confirmAddress,
    rollbackAddress,
  } = useAddressStore();

  const getAddress = async (id: string) => {
    setLoading(true);
    try {
      const address = await getAddressAction(id);
      return address;
    } catch (err) {
      console.error(err || "Failed to get address");
      toast.error("Failed to get address");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createAddress = async (form: AddressForm, type: string) => {
    setLoading(true);

    const tempId = `temp-${Date.now()}`;

    try {
      // ✅ Validate required fields
      const requiredFields = ["street", "city", "state", "zipCode", "phone"];

      for (const field of requiredFields) {
        if (!form[field as keyof AddressForm]) {
          toast.error(`${field} is required`);
          setLoading(false);
          return { success: false };
        }
      }

      // ✅ Build FormData
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      formData.append("type", type);

      // If there is no `isDefault` in the form data, set it to false
      const hasDefault = store.addresses.some((address) => address.isDefault);
      if (!hasDefault || store.addresses.length === 0) {
        formData.set("isDefault", "true");
      }

      // ⚡ Optimistic update
      addOptimisticAddress({
        _id: tempId,
        ...form,
        type: type as "home" | "work" | "other",
        pending: true,
      });

      // 🔒 Server action
      const { success, addressId } = await createAddressAction(formData);

      if (success) {
        confirmAddress(tempId, addressId);

        toast.success("Address added successfully");
        return { success: true };
      }

      return { success: false };
    } catch (err) {
      rollbackAddress(tempId);

      console.error(err);
      toast.error("Failed to save address");

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ✏️ UPDATE ADDRESS (OPTIMISTIC)
  const updateAddress = async (id: string, updates: Partial<AddressForm>) => {
    const prev = store.addresses.find((a) => a._id === id);
    if (!prev) return;

    setLoading(true);

    try {
      // 🧠 Create a minimal diff (only changed fields)
      let isUpdated = false;

      for (const key of Object.keys(updates) as (keyof AddressForm)[]) {
        const newValue = updates[key];
        const oldValue = prev[key];
        if (newValue !== oldValue) {
          isUpdated = true;
          break;
        }
      }

      // 🚫 nothing changed → skip
      if (!isUpdated) {
        setLoading(false);
        return;
      }

      // ⚡ OPTIMISTIC UPDATE
      store.updateAddress(id, updates);

      // 🔐 SERVER UPDATE
      const { success } = await updateAddressAction(id, updates);

      if (success) {
        store.confirmUpdateAddress(id);
        toast.success("Address updated");
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      // ❌ rollback to previous state
      console.error(err || "Update failed");
      store.rollbackUpdateAddress(id, prev);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    const prev = store.addresses.find((a) => a._id === id);
    if (!prev) return;

    // ❌ Block deletion if it's default And more than one address exist
    if (prev.isDefault && store.addresses.length > 1) {
      toast.error(
        "Select another default address before deleting this address",
      );
      return;
    }

    setLoading(true);

    // ⚡ Optimistic delete
    store.deleteAddress(id);
    try {
      const { success } = await deleteAddressAction(id, userId!);
      if (!success) {
        throw new Error("Delete failed");
      }
      toast.success("Address deleted");
    } catch (err) {
      console.error(err || "Failed to delete address");

      // ❌ rollback correctly
      store.rollbackDeleteAddress(prev);

      toast.error("Failed to delete address");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    // ⚡ CRUD
    addresses: store.addresses,
    createAddress,
    getAddress,
    deleteAddress,
    loading,
    updateAddress,
  };
};
