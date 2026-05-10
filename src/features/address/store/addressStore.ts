import { create } from "zustand";
import { Address } from "../../../../types/sanityTypes";

interface AddressUIState {
  initializing: boolean;
  creating: boolean;
  updating: boolean;
  updatingId: string | null;
  deletingId: string | null;
}

interface AddressStore {
  addresses: Address[];

  ui: AddressUIState;

  // Actions
  // base
  setAddresses: (addresses: Address[]) => void;

  setInitializing: (val: boolean) => void;
  setCreating: (val: boolean) => void;
  setUpdating: (val: boolean) => void;
  setUpdatingId: (id: string | null) => void;
  setDeletingId: (id: string | null) => void;

  // Create
  addAddress: (address: Address | (Address & { pending: boolean })) => void;
  // ✏️ Update
  updateAddress: (id: string, updates: Partial<Address>) => void;
  // 🗑 delete
  deleteAddress: (id: string) => void;

  setDefault: (id: string) => void;
}

export const useAddressStore = create<AddressStore>((set) => ({
  addresses: [],

  ui: {
    initializing: true,
    creating: false,
    updating: false,
    updatingId: null,
    deletingId: null,
  },

  // ✅ replace server addresses with fresh data
  setAddresses: (addresses) => set({ addresses }),

  setInitializing: (val) =>
    set((state) => ({ ui: { ...state.ui, initializing: val } })),
  setCreating: (val) =>
    set((state) => ({ ui: { ...state.ui, creating: val } })),
  setUpdating: (val) =>
    set((state) => ({ ui: { ...state.ui, updating: val } })),
  setUpdatingId: (id) =>
    set((state) => ({ ui: { ...state.ui, updatingId: id } })),
  setDeletingId: (id) =>
    set((state) => ({ ui: { ...state.ui, deletingId: id } })),

  // ---------------- CREATE ----------------
  // ⚡ Optimistic add
  addAddress: (address) => {
    set((state) => {
      let updated = [...state.addresses, address];

      // 🧠 enforce single default
      if (address.isDefault) {
        updated = updated.map((a) => {
          return { ...a, isDefault: address._id === a._id };
        });
      }
      return { addresses: updated };
    });
  },
  // ---------------- UPDATE ----------------
  updateAddress: (id, updates) => {
    set((state) => {
      let updated = state.addresses.map((a) =>
        a._id == id ? { ...a, ...updates } : a,
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
  // ---------------- DELETE ----------------
  deleteAddress: (id) => {
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

  setDefault: (id) =>
    set((state) => ({
      addresses: state.addresses.map((a) => ({
        ...a,
        isDefault: a._id === id,
      })),
    })),
}));
