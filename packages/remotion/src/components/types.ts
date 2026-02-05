/**
 * Types for Remotion timeline components
 */

/**
 * Clip data passed to components
 */
export interface Clip {
  id: string;
  trackId: string;
  component: string;
  props: Record<string, unknown>;
  from: number;
  durationInFrames: number;
  transitionIn?: { type: string; durationInFrames: number };
  transitionOut?: { type: string; durationInFrames: number };
}

/**
 * Timeline spec structure
 */
export interface TimelineSpec {
  composition?: {
    id: string;
    fps: number;
    width: number;
    height: number;
    durationInFrames: number;
  };
  tracks?: { id: string; name: string; type: string; enabled: boolean }[];
  clips?: Clip[];
  audio?: { tracks: AudioTrack[] };
}

/**
 * Audio track in the timeline
 */
export interface AudioTrack {
  id: string;
  src: string;
  from: number;
  durationInFrames: number;
  volume: number;
}

/**
 * Transition styles calculated by useTransition hook
 */
export interface TransitionStyles {
  opacity: number;
  translateX: number;
  translateY: number;
  scale: number;
}

/**
 * Component render function type
 */
export type ClipComponent = React.ComponentType<{ clip: Clip }>;

/**
 * Component registry type
 */
export type ComponentRegistry = Record<string, ClipComponent>;
