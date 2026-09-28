import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // Client snapshot
    () => false, // Server snapshot
  );
}
