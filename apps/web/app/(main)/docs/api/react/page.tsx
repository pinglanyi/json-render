import { Code } from "@/components/code";

export const metadata = {
  title: "@json-render/react API | json-render",
};

export default function ReactApiPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">@json-render/react</h1>
      <p className="text-muted-foreground mb-8">
        React components, providers, and hooks.
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">Providers</h2>

      <h3 className="text-lg font-semibold mt-8 mb-4">DataProvider</h3>
      <Code lang="tsx">{`<DataProvider initialData={object}>
  {children}
</DataProvider>`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">ActionProvider</h3>
      <Code lang="tsx">{`<ActionProvider handlers={Record<string, ActionHandler>}>
  {children}
</ActionProvider>

type ActionHandler = (params: Record<string, unknown>) => void | Promise<void>;`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">VisibilityProvider</h3>
      <Code lang="tsx">{`<VisibilityProvider auth={AuthState}>
  {children}
</VisibilityProvider>

interface AuthState {
  isSignedIn: boolean;
  roles?: string[];
}`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">ValidationProvider</h3>
      <Code lang="tsx">{`<ValidationProvider functions={Record<string, ValidatorFn>}>
  {children}
</ValidationProvider>

type ValidatorFn = (value: unknown, args?: object) => boolean | Promise<boolean>;`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">createRenderer</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Factory function to create a pre-configured renderer component.
      </p>
      <Code lang="tsx">{`import { createRenderer } from '@json-render/react';

const MyRenderer = createRenderer({
  registry: componentRegistry,
  data?: initialData,
  actionHandlers?: actionHandlerMap,
  auth?: authState,
});

// Usage
<MyRenderer spec={spec} loading={isStreaming} />`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Components</h2>

      <h3 className="text-lg font-semibold mt-8 mb-4">Renderer</h3>
      <Code lang="tsx">{`<Renderer
  spec={Spec}           // The UI spec to render
  registry={Registry}   // Component registry
  loading={boolean}     // Optional loading state
/>

type Registry = Record<string, React.ComponentType<ComponentProps>>;

interface ComponentProps<T = Record<string, unknown>> {
  props: T;                    // Component props from spec
  children?: React.ReactNode;  // Rendered children (for slot components)
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Hooks</h2>

      <h3 className="text-lg font-semibold mt-8 mb-4">useUIStream</h3>
      <Code lang="typescript">{`const {
  spec,         // Spec - current UI state
  isStreaming,  // boolean - true while streaming
  error,        // Error | null
  send,         // (prompt: string) => void
  abort,        // () => void
} = useUIStream({
  api: string,                       // API endpoint URL
  onChunk?: (chunk: string) => void, // Called for each chunk
  onFinish?: (spec: Spec) => void,   // Called when streaming completes
});`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">useData</h3>
      <Code lang="typescript">{`const {
  data,      // Record<string, unknown>
  setData,   // (data: object) => void
  getValue,  // (path: string) => unknown
  setValue,  // (path: string, value: unknown) => void
} = useData();`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">useDataValue</h3>
      <Code lang="typescript">{`const value = useDataValue(path: string);`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">useDataBinding</h3>
      <Code lang="typescript">{`const [value, setValue] = useDataBinding(path: string);`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">useActions</h3>
      <Code lang="typescript">{`const { dispatch } = useActions();
// dispatch(actionName: string, params: object)`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">useAction</h3>
      <Code lang="typescript">{`const submitForm = useAction('submit_form');
// submitForm(params: object)`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">useIsVisible</h3>
      <Code lang="typescript">{`const isVisible = useIsVisible(condition?: VisibilityCondition);`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">useFieldValidation</h3>
      <Code lang="typescript">{`const {
  value,     // unknown
  setValue,  // (value: unknown) => void
  errors,    // string[]
  validate,  // () => Promise<boolean>
  isValid,   // boolean
} = useFieldValidation(path: string, checks: ValidationCheck[]);`}</Code>
    </article>
  );
}
