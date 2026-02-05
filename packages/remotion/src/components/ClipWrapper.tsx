"use client";

import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useTransition } from "./hooks";
import type { Clip } from "./types";

interface ClipWrapperProps {
  clip: Clip;
  children: React.ReactNode;
}

/**
 * Wrapper component that applies transition animations to clips
 *
 * Automatically handles transitionIn and transitionOut based on clip config.
 */
export function ClipWrapper({ clip, children }: ClipWrapperProps) {
  const frame = useCurrentFrame();
  const { opacity, translateX, translateY, scale } = useTransition(
    clip,
    frame + clip.from,
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateX(${translateX}%) translateY(${translateY}%) scale(${scale})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
