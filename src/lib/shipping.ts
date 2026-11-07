// Single source of truth for the shipping rule (used by cart, checkout page and server).
// Change it here and everything follows.
export const FREE_SHIPPING_THRESHOLD = 399;
export const SHIPPING_FEE = 99;

export function calculateShipping(subtotal: number): number {
  if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_FEE;
}
