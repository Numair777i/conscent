import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns true once the component has mounted on the client.
 * Prevents Next.js SSR hydration mismatches for browser-only data (e.g., localStorage, cart counts).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // Client snapshot
    () => false, // Server snapshot
  );
}
