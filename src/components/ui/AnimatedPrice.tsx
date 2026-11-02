"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useInView } from "framer-motion";

interface AnimatedPriceProps {
  value: number;
  className?: string;
  prefix?: string;
}

export function AnimatedPrice({
  value,
  className = "",
  prefix = "₹",
}: AnimatedPriceProps) {
  const ref = useRef<HTMLSpanElement>(null);

  // Checks when the element enters the user's viewport
  const isInView = useInView(ref, {
    once: true, // Only animate once per page visit
    margin: "-20px", // Triggers just as it enters comfortable view
  });

  const motionVal = useMotionValue(0);

  // Tuned spring physics for natural, luxury counter roll
  const springVal = useSpring(motionVal, {
    stiffness: 50,
    damping: 18,
    mass: 1.7,
  });

  // Only launch the motion animation once the element has scrolled into view
  useEffect(() => {
    if (isInView) {
      motionVal.set(value);
    }
  }, [isInView, value, motionVal]);

  // Update DOM directly without triggering component re-renders
  useEffect(() => {
    const unsubscribe = springVal.on("change", (latest) => {
      if (ref.current) {
        const rounded = Math.round(latest);
        ref.current.textContent = `${prefix}${rounded.toLocaleString("en-IN")}`;
      }
    });

    return () => unsubscribe();
  }, [springVal, prefix]);

  return (
    <span ref={ref} className={className}>
      {prefix}0
    </span>
  );
}
