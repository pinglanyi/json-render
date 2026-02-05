"use client";

import { useVideoConfig, spring, interpolate } from "remotion";
import type { Clip, TransitionStyles } from "./types";

/**
 * Calculate transition styles based on clip configuration
 *
 * Handles both transitionIn and transitionOut with support for:
 * - fade
 * - slideLeft / slideRight
 * - slideUp / slideDown
 * - zoom
 * - wipe
 */
export function useTransition(clip: Clip, frame: number): TransitionStyles {
  const { fps } = useVideoConfig();
  const relativeFrame = frame - clip.from;
  const clipEnd = clip.durationInFrames;

  let opacity = 1;
  let translateX = 0;
  let translateY = 0;
  let scale = 1;

  // Transition in
  if (clip.transitionIn && relativeFrame < clip.transitionIn.durationInFrames) {
    const progress = relativeFrame / clip.transitionIn.durationInFrames;
    const easedProgress = spring({
      frame: relativeFrame,
      fps,
      config: { damping: 200 },
      durationInFrames: clip.transitionIn.durationInFrames,
    });

    switch (clip.transitionIn.type) {
      case "fade":
        opacity = easedProgress;
        break;
      case "slideLeft":
        translateX = interpolate(easedProgress, [0, 1], [100, 0]);
        opacity = easedProgress;
        break;
      case "slideRight":
        translateX = interpolate(easedProgress, [0, 1], [-100, 0]);
        opacity = easedProgress;
        break;
      case "slideUp":
        translateY = interpolate(easedProgress, [0, 1], [100, 0]);
        opacity = easedProgress;
        break;
      case "slideDown":
        translateY = interpolate(easedProgress, [0, 1], [-100, 0]);
        opacity = easedProgress;
        break;
      case "zoom":
        scale = interpolate(easedProgress, [0, 1], [0.8, 1]);
        opacity = easedProgress;
        break;
      case "wipe":
        opacity = progress;
        break;
    }
  }

  // Transition out
  if (
    clip.transitionOut &&
    relativeFrame > clipEnd - clip.transitionOut.durationInFrames
  ) {
    const outStart = clipEnd - clip.transitionOut.durationInFrames;
    const outProgress =
      (relativeFrame - outStart) / clip.transitionOut.durationInFrames;
    const easedOutProgress = 1 - outProgress;

    switch (clip.transitionOut.type) {
      case "fade":
        opacity = Math.min(opacity, easedOutProgress);
        break;
      case "slideLeft":
        translateX = interpolate(outProgress, [0, 1], [0, -100]);
        opacity = Math.min(opacity, easedOutProgress);
        break;
      case "slideRight":
        translateX = interpolate(outProgress, [0, 1], [0, 100]);
        opacity = Math.min(opacity, easedOutProgress);
        break;
      case "slideUp":
        translateY = interpolate(outProgress, [0, 1], [0, -100]);
        opacity = Math.min(opacity, easedOutProgress);
        break;
      case "slideDown":
        translateY = interpolate(outProgress, [0, 1], [0, 100]);
        opacity = Math.min(opacity, easedOutProgress);
        break;
      case "zoom":
        scale = interpolate(outProgress, [0, 1], [1, 1.2]);
        opacity = Math.min(opacity, easedOutProgress);
        break;
    }
  }

  return { opacity, translateX, translateY, scale };
}
