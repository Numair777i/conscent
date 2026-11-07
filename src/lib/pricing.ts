/* ==========================================================================
   PRICING HELPERS
   ========================================================================== */

/** True only when the original price is strictly higher than the sale price */
export function hasDiscount(price: number, compareAtPrice?: number): boolean {
  return typeof compareAtPrice === "number" && compareAtPrice > price;
}

/** Percentage saved, rounded. Returns 0 when there is no real discount. */
export function getDiscountPercent(
  price: number,
  compareAtPrice?: number,
): number {
  if (!hasDiscount(price, compareAtPrice)) return 0;
  const original = compareAtPrice as number;
  return Math.round(((original - price) / original) * 100);
}
