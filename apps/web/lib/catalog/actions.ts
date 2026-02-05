import { toast } from "sonner";

type ActionHandler = (
  params: Record<string, unknown> | undefined,
) => Promise<void>;

/**
 * Demo action handlers for the playground
 *
 * These show toast notifications to demonstrate actions work.
 * In a real app, these would call APIs or perform state updates.
 */
export const actionHandlers: Record<string, ActionHandler> = {
  buttonClick: async (params) => {
    const message = (params?.message as string) || "Button clicked!";
    toast.success(message);
  },

  formSubmit: async (params) => {
    const formName = (params?.formName as string) || "Form";
    toast.success(`${formName} submitted successfully!`);
  },

  linkClick: async (params) => {
    const href = (params?.href as string) || "#";
    toast.info(`Navigating to: ${href}`);
  },
};

/**
 * Execute an action by name with the given parameters
 */
export async function executeAction(
  actionName: string,
  params?: Record<string, unknown>,
): Promise<void> {
  const handler = actionHandlers[actionName];

  if (handler) {
    await handler(params);
  } else {
    // Fallback for unknown actions - just show a toast
    toast.info(`Action: ${actionName}`, {
      description: params ? JSON.stringify(params) : undefined,
    });
  }
}
