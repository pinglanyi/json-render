import {
  ToolLoopAgent,
  stepCountIs,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { pipeJsonRender } from "@json-render/core";
import { getModel } from "@/lib/ai-provider";
import { AGENT_INSTRUCTIONS } from "@/lib/agent";
import { createRAGFlowTools } from "@/lib/tools/ragflow";

export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json();
  const uiMessages: UIMessage[] = body.messages;

  if (!uiMessages || !Array.isArray(uiMessages) || uiMessages.length === 0) {
    return new Response(
      JSON.stringify({ error: "messages array is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Create per-request RAGFlow tools with isolated chunk buffer
  const { ragflowListDatasets, getKbDatasetsByType, ragflowRetrieve, getNextChunks } =
    createRAGFlowTools();

  const agent = new ToolLoopAgent({
    model: getModel(),
    instructions: AGENT_INSTRUCTIONS,
    tools: { ragflowListDatasets, getKbDatasetsByType, ragflowRetrieve, getNextChunks },
    stopWhen: stepCountIs(6),
    temperature: 0.3,
  });

  const modelMessages = await convertToModelMessages(uiMessages);
  const result = await agent.stream({ messages: modelMessages });

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.merge(pipeJsonRender(result.toUIMessageStream()));
    },
  });

  return createUIMessageStreamResponse({ stream });
}
