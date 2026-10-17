"use client";

import React, { useState } from "react";
import Link from "next/link";

interface RollingButtonProps {
  frontLabel: string;
  backLabel: string;
  frontIcon?: React.ReactNode;
  backIcon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  // Allows customizing color schemes per button (default: Conscent Brand Red & Ink)
  variant?: "brand" | "ink" | "lime";
  fullWidth?: boolean;
}

export function RollingButton({
  frontLabel,
  backLabel,
  frontIcon,
  backIcon,
  href,
  onClick,
  disabled = false,
  type = "button",
  className = "",
  variant = "brand",
  fullWidth = false,
}: RollingButtonProps) {
  const [touchActive, setTouchActive] = useState(false);

  // Variant color definitions (Height is fixed to 56px = translateZ(28px))
  const colorMap = {
    brand: {
      front: "bg-brand text-brand-foreground border-brand",
      back: "bg-ink text-background border-ink",
    },
    ink: {
      front: "bg-ink text-background border-ink",
      back: "bg-brand text-brand-foreground border-brand",
    },
    lime: {
      front: "bg-[#111113] text-[#F4F4F5] border-[#111113]",
      back: "bg-[#E2F952] text-[#111113] border-[#d2eb34]",
    },
  };

  const selectedVariant = colorMap[variant];
  const sharedFace =
    "absolute inset-0 flex items-center justify-center gap-2 px-6 select-none [backface-visibility:hidden] [webkit-backface-visibility:hidden] text-xs font-bold uppercase tracking-[0.25em]";

  const innerContent = (
    <>
      <span className="sr-only">{frontLabel}</span>

      <span
        aria-hidden="true"
        className={`relative block h-full w-full [transform-style:preserve-3d] transition-transform duration-[600ms] ease-[cubic-bezier(0.34,1.45,0.64,1)] motion-reduce:transition-none group-hover:[transform:rotateX(90deg)] group-focus-visible:[transform:rotateX(90deg)] ${
          touchActive ? "[transform:rotateX(90deg)]" : ""
        }`}
      >
        {/* Front Face */}
        <span
          className={`${sharedFace} ${selectedVariant.front} [transform:translateZ(28px)] motion-reduce:group-hover:opacity-0 motion-reduce:transition-opacity`}
        >
          <span>{frontLabel}</span>
          {frontIcon}
        </span>

        {/* Rolling Back Face */}
        <span
          className={`${sharedFace} ${selectedVariant.back} [transform:rotateX(-90deg)_translateZ(28px)] motion-reduce:opacity-0 motion-reduce:group-hover:opacity-100 motion-reduce:transition-opacity`}
        >
          <span>{backLabel}</span>
          {backIcon}
        </span>
      </span>
    </>
  );

  const baseContainerStyles = `group relative block h-[56px] [perspective:600px] outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 cursor-pointer transition-opacity disabled:opacity-50 disabled:pointer-events-none ${
    fullWidth ? "w-full" : "min-w-[190px] w-fit"
  } ${className}`;

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={baseContainerStyles}
        onTouchStart={() => setTouchActive(true)}
        onTouchEnd={() => setTimeout(() => setTouchActive(false), 700)}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={baseContainerStyles}
      onTouchStart={() => setTouchActive(true)}
      onTouchEnd={() => setTimeout(() => setTouchActive(false), 700)}
    >
      {innerContent}
    </button>
  );
}
