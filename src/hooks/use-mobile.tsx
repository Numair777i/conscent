import * as React from "react";

const MOBILE_BREAKPOINT = 768;

function subscribe(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }

  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

  if (mql.addEventListener) {
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  }

  // Fallback for older mobile WebViews
  mql.addListener(callback);
  return () => mql.removeListener(callback);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Hook to detect whether the current viewport is below the 768px mobile breakpoint.
 * Uses useSyncExternalStore for hydration safety.
 */
export function useIsMobile(): boolean {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
