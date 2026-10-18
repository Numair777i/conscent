import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItem, Product, Variant } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (
    product: Product,
    variant: Variant,
    qty?: number,
    openDrawer?: boolean,
  ) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  setHasHydrated: (state: boolean) => void;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      addItem: (product, variant, qty = 1, openDrawer = true) =>
        set((s) => {
          const key = `${product.id}:${variant.id}`;
          const existing = s.items.find((i) => i.key === key);
          const items = existing
            ? s.items.map((i) =>
                i.key === key ? { ...i, qty: i.qty + qty } : i,
              )
            : [
                ...s.items,
                {
                  key,
                  productId: product.id,
                  variantId: variant.id,
                  slug: product.slug,
                  name: product.name,
                  size: variant.size,
                  price: variant.price,
                  image: product.image,
                  qty,
                },
              ];
          return { items, isOpen: openDrawer ? true : s.isOpen };
        }),
      removeItem: (key) =>
        set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      setQty: (key, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.key !== key)
              : s.items.map((i) => (i.key === key ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "conscent-cart",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.localStorage,
      ),
      partialize: (s) => ({ items: s.items }) as unknown as CartState,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/* ==========================================================================
   CART CALCULATION HELPERS
   ========================================================================== */

export const cartSubtotal = (items: CartItem[]): number =>
  items.reduce((sum, i) => sum + i.price * i.qty, 0);

export const cartCount = (items: CartItem[]): number =>
  items.reduce((sum, i) => sum + i.qty, 0);

export const calculateShipping = (subtotal: number): number => {
  if (subtotal === 0) return 0;
  return subtotal >= 999 ? 0 : 99; // Standard CONSCENT rule: Free shipping over ₹999
};

export const cartGrandTotal = (
  items: CartItem[],
): { subtotal: number; shipping: number; total: number } => {
  const subtotal = cartSubtotal(items);
  const shipping = calculateShipping(subtotal);
  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
};
