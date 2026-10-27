import { Compass, Zap, Crown, Sparkles } from "lucide-react";

export type BadgeType = "STARTER_PACK" | "NEW_ARRIVAL" | "BEST_SELLER" | string;

interface ProductBadgeProps {
  badge: BadgeType;
  className?: string;
}

export function ProductBadge({ badge, className = "" }: ProductBadgeProps) {
  const normalized = badge.toUpperCase().replace(/\s+/g, "_");

  switch (normalized) {
    case "STARTER_PACK":
    case "STARTER":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-violet-100/10 text-violet-400 border border-violet-00/30 px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase select-none ${className}`}
        >
          <Compass className="size-3.5 stroke-[2.2]" />
          <span>Starter Pack</span>
        </span>
      );

    case "NEW_ARRIVAL":
    case "NEW":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase select-none ${className}`}
        >
          <Zap className="size-3.5 fill-current stroke-[1.8]" />
          <span>New Arrival</span>
        </span>
      );

    case "BEST_SELLER":
    case "SIGNATURE":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase select-none ${className}`}
        >
          <Crown className="size-3.5 fill-current stroke-[1.8]" />
          <span>Best Seller</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-brand/10 text-brand border border-brand/30 px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase select-none ${className}`}
        >
          <Sparkles className="size-3.5 stroke-[2]" />
          <span>{badge}</span>
        </span>
      );
  }
}
