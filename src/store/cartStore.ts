import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product: string; // productId
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedVariants?: Record<string, string>;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, selectedVariants?: Record<string, string>) => void;
  updateQty: (productId: string, quantity: number, selectedVariants?: Record<string, string>) => void;
  clearCart: () => void;
  syncFromServer: (items: CartItem[]) => void;
  itemCount: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.product === item.product && JSON.stringify(i.selectedVariants) === JSON.stringify(item.selectedVariants)
          );

          if (existingItemIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += item.quantity;
            return { items: newItems };
          }
          return { items: [...state.items, item] };
        });
      },
      removeItem: (productId, selectedVariants) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product === productId && JSON.stringify(i.selectedVariants) === JSON.stringify(selectedVariants))
          ),
        }));
      },
      updateQty: (productId, quantity, selectedVariants) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.product === productId && JSON.stringify(i.selectedVariants) === JSON.stringify(selectedVariants)
              ? { ...i, quantity }
              : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      syncFromServer: (items) => set({ items }),
      itemCount: () => get().items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
