import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  productIds: string[];
  toggle: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  syncFromServer: (productIds: string[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) => {
        set((state) => {
          if (state.productIds.includes(productId)) {
            return { productIds: state.productIds.filter((id) => id !== productId) };
          }
          return { productIds: [...state.productIds, productId] };
        });
      },
      isWishlisted: (productId) => get().productIds.includes(productId),
      syncFromServer: (productIds) => set({ productIds }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
