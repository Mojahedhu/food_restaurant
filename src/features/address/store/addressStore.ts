import { create } from "zustand";
import { AddressRaw } from "../types/type";

interface AddressState {
  addresses: AddressRaw[];

  // Actions
  // base
  setAddresses: (addresses: AddressRaw[]) => void;

  // Create
  addOptimisticAddress: (address: AddressRaw) => void;
  confirmAddress: (tempId: string, realId: string) => void;
  rollbackAddress: (tempId: string) => void;

  // ✏️ Update
  updateOptimisticAddress: (id: string, updates: Partial<AddressRaw>) => void;
  confirmUpdateAddress: (id: string) => void;
  rollbackUpdateAddress: (id: string, prev: AddressRaw) => void;

  // 🗑 delete
  deleteOptimisticAddress: (id: string) => void;
  rollbackDeleteAddress: (address: AddressRaw) => void;
}

export const useAddressStore = create<AddressState>((set) => ({
  addresses: [],
  // ✅ replace server addresses with fresh data
  setAddresses: (addresses) => set({ addresses }),
  // ---------------- CREATE ----------------
  // ⚡ Optimistic add
  addOptimisticAddress: (address) => {
    set((state) => {
      let updated = [...state.addresses, address];

      // 🧠 enforce single default
      if (address.isDefault) {
        updated = updated.map((adder) => {
          return { ...adder, isDefault: address._id === adder._id };
        });
      }
      return { addresses: updated };
    });
  },
  // ✅ replace temp with real

  confirmAddress: (tempId, realId) => {
    set((state) => ({
      addresses: state.addresses.map((address) =>
        address._id === tempId ? { ...address, _id: realId } : address,
      ),
    }));
  },
  // ❌ rollback on error
  rollbackAddress: (tempId) => {
    set((state) => ({
      addresses: state.addresses.filter((address) => address._id !== tempId),
    }));
  },
  // ---------------- UPDATE ----------------
  updateOptimisticAddress: (id, updates) => {
    set((state) => {
      let updated = state.addresses.map((a) =>
        a._id == id ? { ...a, pending: true } : a,
      );

      // 🧠 enforce single default
      if (updates.isDefault) {
        updated = updated.map((a) => ({
          ...a,
          isDefault: a._id === id,
        }));
      }
      return { addresses: updated };
    });
  },
  confirmUpdateAddress: (id) => {
    set((state) => ({
      addresses: state.addresses.map((a) =>
        a._id === id ? { ...a, pending: false } : a,
      ),
    }));
  },
  rollbackUpdateAddress: (id, prev) => {
    set((state) => ({
      addresses: state.addresses.map((a) => (a._id === id ? prev : a)),
    }));
  },

  // ---------------- DELETE ----------------
  deleteOptimisticAddress: (id) => {
    set((state) => {
      const deleted = state.addresses.find((a) => a._id === id);
      const updated = state.addresses.filter((a) => a._id !== id);

      // 🧠 if deleted was default → assign new default
      if (deleted?.isDefault && updated.length > 0) {
        updated[0] = { ...updated[0], isDefault: true };
      }
      return { addresses: updated };
    });
  },

  rollbackDeleteAddress: (address) => {
    set((state) => {
      let updated = [address, ...state.addresses];

      // 🧠 restore default correctly
      if (address.isDefault) {
        updated = updated.map((a) => ({
          ...a,
          isDefault: a._id === address._id,
        }));
      }

      return {
        addresses: updated,
      };
    });
  },
}));
