import { Code } from "@/components/code";

export const metadata = {
  title: "@json-render/remotion API | json-render",
};

export default function RemotionApiPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">@json-render/remotion</h1>
      <p className="text-muted-foreground mb-8">
        Remotion video renderer. Turn JSON timeline specs into video
        compositions.
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">schema</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The timeline schema for video specs. Use with{" "}
        <code className="text-foreground">defineCatalog</code> from core.
      </p>
      <Code lang="typescript">{`import { defineCatalog } from '@json-render/core';
import { schema, standardComponentDefinitions } from '@json-render/remotion';

const catalog = defineCatalog(schema, {
  components: standardComponentDefinitions,
  transitions: standardTransitionDefinitions,
  effects: standardEffectDefinitions,
});`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Renderer</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The main composition component that renders timeline specs. Use with
        Remotion&apos;s Player or in a Remotion project.
      </p>
      <Code lang="tsx">{`import { Player } from '@remotion/player';
import { Renderer } from '@json-render/remotion';

function VideoPlayer({ spec }) {
  return (
    <Player
      component={Renderer}
      inputProps={{ spec }}
      durationInFrames={spec.composition.durationInFrames}
      fps={spec.composition.fps}
      compositionWidth={spec.composition.width}
      compositionHeight={spec.composition.height}
      controls
    />
  );
}`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">Custom Components</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Pass custom components to the Renderer:
      </p>
      <Code lang="tsx">{`import { Renderer, standardComponents } from '@json-render/remotion';

const customComponents = {
  ...standardComponents,
  MyCustomClip: ({ clip }) => <div>{clip.props.text}</div>,
};

<Player
  component={Renderer}
  inputProps={{ spec, components: customComponents }}
  // ...
/>`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Standard Components</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Pre-built video components included in the package:
      </p>
      <Code lang="typescript">{`import {
  TitleCard,      // Full-screen title with subtitle
  ImageSlide,     // Full-screen image display
  SplitScreen,    // Two-column layout
  QuoteCard,      // Quote with attribution
  StatCard,       // Large statistic display
  LowerThird,     // Name/title overlay
  TextOverlay,    // Centered text overlay
  TypingText,     // Terminal typing animation
  LogoBug,        // Corner logo watermark
  VideoClip,      // Video playback
} from '@json-render/remotion';`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">TitleCard Props</h3>
      <Code lang="typescript">{`{
  title: string;
  subtitle?: string;
  backgroundColor?: string;  // default: "#1a1a1a"
  textColor?: string;        // default: "#ffffff"
}`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">TypingText Props</h3>
      <Code lang="typescript">{`{
  text: string;
  charsPerSecond?: number;   // default: 15
  showCursor?: boolean;      // default: true
  cursorChar?: string;       // default: "|"
  fontFamily?: string;       // default: "monospace"
  fontSize?: number;         // default: 48
  textColor?: string;        // default: "#00ff00"
  backgroundColor?: string;  // default: "#1e1e1e"
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Catalog Definitions</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Pre-built definitions for creating catalogs:
      </p>
      <Code lang="typescript">{`import {
  standardComponentDefinitions,   // All standard component definitions
  standardTransitionDefinitions,  // fade, slideLeft, slideRight, etc.
  standardEffectDefinitions,      // kenBurns, pulseGlow, colorShift
} from '@json-render/remotion';

// Use in your catalog
const catalog = defineCatalog(schema, {
  components: {
    ...standardComponentDefinitions,
    // Add custom components
  },
  transitions: standardTransitionDefinitions,
  effects: standardEffectDefinitions,
});`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Hooks &amp; Utilities
      </h2>

      <h3 className="text-lg font-semibold mt-8 mb-4">useTransition</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Calculate transition styles for a clip based on current frame:
      </p>
      <Code lang="typescript">{`import { useTransition } from '@json-render/remotion';
import { useCurrentFrame } from 'remotion';

function MyComponent({ clip }) {
  const frame = useCurrentFrame();
  const transition = useTransition(clip, frame);
  
  return (
    <div style={{
      opacity: transition.opacity,
      transform: transition.transform,
    }}>
      Content
    </div>
  );
}`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">ClipWrapper</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Automatically apply transitions to clip content:
      </p>
      <Code lang="tsx">{`import { ClipWrapper } from '@json-render/remotion';

function MyClip({ clip }) {
  return (
    <ClipWrapper clip={clip}>
      <div>My content with automatic transitions</div>
    </ClipWrapper>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Types</h2>

      <h3 className="text-lg font-semibold mt-8 mb-4">TimelineSpec</h3>
      <Code lang="typescript">{`interface TimelineSpec {
  composition: {
    id: string;
    fps: number;
    width: number;
    height: number;
    durationInFrames: number;
  };
  tracks: Track[];
  clips: Clip[];
  audio: {
    tracks: AudioTrack[];
  };
}`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">Clip</h3>
      <Code lang="typescript">{`interface Clip {
  id: string;
  trackId: string;
  component: string;
  props: Record<string, unknown>;
  from: number;
  durationInFrames: number;
  transitionIn?: {
    type: string;
    durationInFrames: number;
  };
  transitionOut?: {
    type: string;
    durationInFrames: number;
  };
}`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">TransitionStyles</h3>
      <Code lang="typescript">{`interface TransitionStyles {
  opacity: number;
  transform: string;
}`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">ComponentRegistry</h3>
      <Code lang="typescript">{`type ClipComponent = React.ComponentType<{ clip: Clip }>;
type ComponentRegistry = Record<string, ClipComponent>;`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Transitions</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Available transition types:
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li>
          <code className="text-foreground">fade</code> - Opacity fade in/out
        </li>
        <li>
          <code className="text-foreground">slideLeft</code> - Slide from right
        </li>
        <li>
          <code className="text-foreground">slideRight</code> - Slide from left
        </li>
        <li>
          <code className="text-foreground">slideUp</code> - Slide from bottom
        </li>
        <li>
          <code className="text-foreground">slideDown</code> - Slide from top
        </li>
        <li>
          <code className="text-foreground">zoom</code> - Scale zoom in/out
        </li>
        <li>
          <code className="text-foreground">wipe</code> - Horizontal wipe
        </li>
      </ul>
    </article>
  );
}
