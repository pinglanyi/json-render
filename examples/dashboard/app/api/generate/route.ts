import { streamText } from "ai";
import { buildUserPrompt } from "@json-render/core";
import { dashboardCatalog } from "@/lib/render/catalog";
import { getModel } from "@/lib/ai-provider";

export const maxDuration = 30;

const SYSTEM_PROMPT = dashboardCatalog.prompt();

export async function POST(req: Request) {
  const { prompt, context } = await req.json();

  const userPrompt = buildUserPrompt({
    prompt,
    state: context?.state,
  });

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
