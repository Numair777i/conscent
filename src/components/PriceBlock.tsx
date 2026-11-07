import { AnimatedPrice } from "@/components/ui/AnimatedPrice";
import { formatINR } from "@/lib/utils";
import { getDiscountPercent, hasDiscount } from "@/lib/pricing";

interface PriceBlockProps {
  /** Current sale price */
  price: number;
  /** Original price (only shown if higher than `price`) */
  compareAtPrice?: number;
  /** "detail" = product page, "card" = compact landing-page card */
  size?: "detail" | "card";
  /** Use the count-down animation (set false for a plain static price) */
  animate?: boolean;
}

// All Tailwind classes live here so both sizes stay in sync
const STYLES = {
  detail: {
    price: "font-heading text-3xl font-bold text-black sm:text-4xl",
    original: "text-lg text-gray-500 line-through",
    badge: "px-2.5 py-1 text-[11px] tracking-[0.15em]",
  },
  card: {
    price: "font-heading text-xl font-bold text-black",
    original: "text-sm text-gray-500 line-through",
    badge: "px-1.5 py-0.5 text-[10px] tracking-[0.12em]",
  },
} as const;

export function PriceBlock({
  price,
  compareAtPrice,
  size = "detail",
  animate = true,
}: PriceBlockProps) {
  const s = STYLES[size];
  const onSale = hasDiscount(price, compareAtPrice);
  const percent = getDiscountPercent(price, compareAtPrice);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {/* Sale price + original price, side by side */}
      <div className="flex items-baseline gap-2">
        {animate ? (
          <AnimatedPrice
            value={price}
            fromValue={onSale ? compareAtPrice : undefined}
            className={s.price}
          />
        ) : (
          <span className={s.price}>{formatINR(price)}</span>
        )}

        {onSale && compareAtPrice !== undefined && (
          <span className={s.original}>{formatINR(compareAtPrice)}</span>
        )}
      </div>

      {/* Black "SAVE X%" badge */}
      {onSale && percent > 0 && (
        <span className={`bg-black font-bold uppercase text-white ${s.badge}`}>
          Save {percent}%
        </span>
      )}
    </div>
  );
}
