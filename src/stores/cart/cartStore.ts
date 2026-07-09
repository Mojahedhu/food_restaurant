import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  foodId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string | null;
  category?: string;
  size?: string;
  variety?: string;
  maxQuantity?: number;
}

interface CartStore {
  items: CartItem[];
  _hasHydrated: boolean;
  isOpen: boolean;

  // Actions
  _setHasHydrated: (val: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;

  // Computed values
  getTotalItems: () => number;
  getUniqueItemCount: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (id: string) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      isOpen: false,

      _setHasHydrated: (val: boolean) => set({ _hasHydrated: val }),
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.id === item.id);
        if (existingItem) {
          // Update quantity if items already exists
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...item, quantity: 1 }],
          }));
        }
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
        }));
      },
      clearCart: () => {
        set(() => ({
          items: [],
        }));
      },
      toggleCart: () => {
        set((state) => ({
          isOpen: !state.isOpen,
        }));
      },
      getTotalItems: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      getUniqueItemCount: () => {
        const items = get().items;
        return items.length;
      },
      getTotalPrice: () => {
        const items = get().items;
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },
      getItemQuantity: (id) => {
        const items = get().items;
        const item = items.find((item) => item.id === id);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    },
  ),
);
