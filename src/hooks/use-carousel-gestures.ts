"use client";

import { useEffect } from "react";
import type { CarouselApi } from "@/components/ui/carousel";

// A drag of at least this many px (finger or mouse) changes the slide.
// Embla alone needs roughly 35% of the slide width, which feels "long".
const SWIPE_DISTANCE = 40;

// Trackpad: sideways distance (px) that counts as ONE swipe
const WHEEL_DISTANCE = 25;
// Trackpad: quiet time (ms) that means "fingers lifted, momentum is over"
const WHEEL_END_MS = 120;
// Trackpad: after a slide change, ignore the old momentum for this long (ms)
// before a "new swipe" is allowed to start
const WHEEL_COOLDOWN_MS = 220;
// Trackpad: a new swipe must be at least this strong (px per event) ...
const WHEEL_NEW_SWIPE_MIN = 8;
// ... and this much stronger than the previous event (momentum only fades)
const WHEEL_NEW_SWIPE_GROWTH = 1.2;

/**
 * Makes an Embla carousel feel short and snappy:
 *  1) SHORT SWIPE: a small drag/swipe is enough to change the slide.
 *  2) TRACKPAD: two fingers moving left/right (or a sideways mouse wheel)
 *     changes the slide, exactly one slide per swipe.
 */
export function useCarouselGestures(api: CarouselApi) {
  useEffect(() => {
    if (!api) return;

    const node = api.rootNode(); // Embla's scrolling viewport

    /* ---------- 1) Short swipe (finger + mouse drag) ---------- */
    let pressed = false;
    let startX = 0;
    let lastX = 0;
    let startIndex = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pressed = true;
      startX = lastX = e.clientX;
      startIndex = api.selectedScrollSnap();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (pressed) lastX = e.clientX;
    };
    const onPointerCancel = () => {
      pressed = false;
    };

    // Embla fires "pointerUp" AFTER it decided where to settle
    const onPointerUp = () => {
      if (!pressed) return;
      pressed = false;

      const moved = lastX - startX;
      const stayedOnSameSlide = api.selectedScrollSnap() === startIndex;

      // Embla snapped back (drag was too short for it) -> we move one slide
      if (stayedOnSameSlide && Math.abs(moved) >= SWIPE_DISTANCE) {
        if (moved < 0) api.scrollNext();
        else api.scrollPrev();
      }
    };

    node.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointercancel", onPointerCancel);
    api.on("pointerUp", onPointerUp);

    /* ---------- 2) Two-finger trackpad / sideways wheel ---------- */
    let travelled = 0;
    let locked = false;
    let lockedAt = 0;
    let lockedDir = 0;
    let lastAbs = 0;
    let endTimer: ReturnType<typeof setTimeout> | undefined;

    const onWheel = (e: WheelEvent) => {
      // Mostly-vertical gesture: let the page scroll normally
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

      // Sideways gesture: we own it (also blocks browser back/forward swipe)
      e.preventDefault();

      const abs = Math.abs(e.deltaX);
      const dir = Math.sign(e.deltaX);
      const now = performance.now();

      // Every event restarts the "gesture finished" timer
      clearTimeout(endTimer);
      endTimer = setTimeout(() => {
        travelled = 0;
        locked = false;
        lastAbs = 0;
      }, WHEEL_END_MS);

      // Trackpad momentum keeps firing after your fingers lift. If a NEW
      // swipe starts during that tail, detect it and unlock right away:
      if (locked) {
        // a) you swiped the other way
        const reversed = dir !== lockedDir && abs >= 2;
        // b) you swiped again: events get stronger instead of fading out
        const newSwipe =
          now - lockedAt > WHEEL_COOLDOWN_MS &&
          abs >= WHEEL_NEW_SWIPE_MIN &&
          abs > lastAbs * WHEEL_NEW_SWIPE_GROWTH;

        if (reversed || newSwipe) {
          locked = false;
          travelled = 0;
        }
      }
      lastAbs = abs;

      // Still inside the previous swipe's momentum tail: ignore
      if (locked) return;

      travelled += e.deltaX;
      if (Math.abs(travelled) >= WHEEL_DISTANCE) {
        if (travelled > 0) api.scrollNext();
        else api.scrollPrev();
        locked = true;
        lockedAt = now;
        lockedDir = Math.sign(travelled);
        travelled = 0;
      }
    };

    // passive:false is required so preventDefault() is allowed
    node.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      node.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointercancel", onPointerCancel);
      api.off("pointerUp", onPointerUp);
      node.removeEventListener("wheel", onWheel);
      clearTimeout(endTimer);
    };
  }, [api]);
}
