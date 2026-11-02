"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useInView } from "framer-motion";

interface AnimatedPriceProps {
  /** Final (discounted) price the counter lands on */
  value: number;
  /**
   * Starting price, e.g. compareAt / MRP. When it is higher than `value`
   * the counter counts DOWN from it to `value`. Otherwise it counts up from 0.
   */
  fromValue?: number;
  /** Wait before the animation starts once the price is visible, in seconds */
  delay?: number;
  className?: string;
  prefix?: string;
}

function formatPrice(amount: number, prefix: string): string {
  return `${prefix}${Math.round(amount).toLocaleString("en-IN")}`;
}

export function AnimatedPrice({
  value,
  fromValue,
  delay = 0,
  className = "",
  prefix = "\u20b9",
}: AnimatedPriceProps) {
  const ref = useRef<HTMLSpanElement>(null);

  // Count down only when a higher starting price is given, otherwise count up from 0
  const startValue =
    fromValue !== undefined && fromValue > value ? fromValue : 0;

  // Where the current run goes from and to, and the price last shown
  const runRef = useRef({
    from: startValue,
    to: startValue,
    shown: startValue,
  });

  // Checks when the element enters the user's viewport
  const isInView = useInView(ref, {
    once: true, // Only animate once per page visit
    margin: "-20px", // Triggers just as it enters comfortable view
  });

  const motionVal = useMotionValue(startValue);

  // Tuned spring physics for natural, luxury counter roll
  const springVal = useSpring(motionVal, {
    stiffness: 50,
    damping: 18,
    mass: 3.7,
  });

  // Before it is visible, sit on the starting price.
  // Once it has scrolled into view, launch the spring toward the final price.
  useEffect(() => {
    if (!isInView) {
      runRef.current = { from: startValue, to: startValue, shown: startValue };
      motionVal.jump(startValue);
      springVal.jump(startValue);
      return;
    }

    const launch = () => {
      const from = springVal.get();
      runRef.current = { from, to: value, shown: from };
      motionVal.set(value);
    };

    if (delay <= 0) {
      launch();
      return;
    }

    const timer = setTimeout(launch, delay * 1000);
    return () => clearTimeout(timer);
  }, [isInView, value, startValue, delay, motionVal, springVal]);

  // Update DOM directly without triggering component re-renders
  useEffect(() => {
    const unsubscribe = springVal.on("change", (latest) => {
      if (!ref.current) return;

      // The spring swings a little past its target and back. Keep the shown
      // price between start and final, and never let it move back away from
      // the final price (so a countdown never dips below the discounted price).
      const run = runRef.current;
      const low = Math.min(run.from, run.to);
      const high = Math.max(run.from, run.to);
      let next = Math.min(Math.max(latest, low), high);
      next =
        run.to < run.from
          ? Math.min(run.shown, next)
          : Math.max(run.shown, next);
      run.shown = next;

      ref.current.textContent = formatPrice(next, prefix);
    });

    return () => unsubscribe();
  }, [springVal, prefix]);

  return (
    <span ref={ref} className={className}>
      {formatPrice(startValue, prefix)}
    </span>
  );
}
