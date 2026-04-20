"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  SPEC_DATA_PART,
  SPEC_DATA_PART_TYPE,
  type SpecDataPart,
} from "@json-render/core";
import { useJsonRenderMessage } from "@json-render/react";
import { RAGRenderer } from "@/lib/render/renderer";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Loader2,
  Search,
  RotateCcw,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";

// =============================================================================
// Types
// =============================================================================

type AppDataParts = { [SPEC_DATA_PART]: SpecDataPart };
type AppMessage = UIMessage<unknown, AppDataParts>;

// =============================================================================
// Suggestions
// =============================================================================

const SUGGESTIONS = [
  { label: "产品规格查询", prompt: "查询 G10 型号的主要技术参数和规格" },
  { label: "文档下载", prompt: "帮我找一下产品说明书或规格书的下载链接" },
  { label: "图片检索", prompt: "找一下产品的外观图或渲染图" },
  { label: "视频教程", prompt: "有没有安装教程或操作演示视频？" },
];

// =============================================================================
// Tool Call Display
// =============================================================================

const TOOL_LABELS: Record<string, [string, string]> = {
  ragflow_list_datasets: ["正在获取知识库列表", "已获取知识库列表"],
  get_kb_datasets_by_type: ["正在识别知识库类型", "已识别知识库类型"],
  ragflow_retrieve: ["正在检索相关内容", "已检索相关内容"],
  get_next_chunks: ["正在获取更多内容", "已获取更多内容"],
};

function ToolCallDisplay({
  toolName,
  state,
  result,
}: {
  toolName: string;
  state: string;
  result: unknown;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLoading =
    state !== "output-available" &&
    state !== "output-error" &&
    state !== "output-denied";
  const labels = TOOL_LABELS[toolName];
  const label = labels ? (isLoading ? labels[0] : labels[1]) : toolName;

  return (
    <div className="text-sm group">
      <button
        type="button"
        className="flex items-center gap-1.5"
        onClick={() => setExpanded((e) => !e)}
      >
        <span
          className={`text-muted-foreground ${isLoading ? "animate-shimmer" : ""}`}
        >
          {label}
        </span>
        {!isLoading && (
          <ChevronRight
            className={`h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-all ${expanded ? "rotate-90" : ""}`}
          />
        )}
      </button>
      {expanded && !isLoading && result != null && (
        <div className="mt-1 max-h-64 overflow-auto">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
            {typeof result === "string"
              ? result
              : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Message Bubble
// =============================================================================

function MessageBubble({
  message,
  isLast,
  isStreaming,
}: {
  message: AppMessage;
  isLast: boolean;
  isStreaming: boolean;
}) {
  const isUser = message.role === "user";
  const { spec, text, hasSpec } = useJsonRenderMessage(message.parts);

  const segments: Array<
    | { kind: "text"; text: string }
    | {
        kind: "tools";
        tools: Array<{
          toolCallId: string;
          toolName: string;
          state: string;
          output?: unknown;
        }>;
      }
    | { kind: "spec" }
  > = [];

  let specInserted = false;

  for (const part of message.parts) {
    if (part.type === "text") {
      if (!part.text.trim()) continue;
      const last = segments[segments.length - 1];
      if (last?.kind === "text") {
        last.text += part.text;
      } else {
        segments.push({ kind: "text", text: part.text });
      }
    } else if (part.type.startsWith("tool-")) {
      const tp = part as {
        type: string;
        toolCallId: string;
        state: string;
        output?: unknown;
      };
      const last = segments[segments.length - 1];
      if (last?.kind === "tools") {
        last.tools.push({
          toolCallId: tp.toolCallId,
          toolName: tp.type.replace(/^tool-/, ""),
          state: tp.state,
          output: tp.output,
        });
      } else {
        segments.push({
          kind: "tools",
          tools: [
            {
              toolCallId: tp.toolCallId,
              toolName: tp.type.replace(/^tool-/, ""),
              state: tp.state,
              output: tp.output,
            },
          ],
        });
      }
    } else if (part.type === SPEC_DATA_PART_TYPE && !specInserted) {
      segments.push({ kind: "spec" });
      specInserted = true;
    }
  }

  const hasAnything = segments.length > 0 || hasSpec;
  const showLoader =
    isLast && isStreaming && message.role === "assistant" && !hasAnything;

  if (isUser) {
    return (
      <div className="flex justify-end">
        {text && (
          <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap bg-primary text-primary-foreground rounded-tr-md">
            {text}
          </div>
        )}
      </div>
    );
  }

  const showSpecAtEnd = hasSpec && !specInserted;

  return (
    <div className="w-full flex flex-col gap-3">
      {segments.map((seg, i) => {
        if (seg.kind === "text") {
          const isLastSeg = i === segments.length - 1;
          return (
            <div
              key={`text-${i}`}
              className="text-sm leading-relaxed [&_p+p]:mt-3 [&_ul]:mt-2 [&_ol]:mt-2"
            >
              <Streamdown
                plugins={{ code }}
                animated={isLast && isStreaming && isLastSeg}
              >
                {seg.text}
              </Streamdown>
            </div>
          );
        }
        if (seg.kind === "spec") {
          if (!hasSpec) return null;
          return (
            <div key="spec" className="w-full">
              <RAGRenderer spec={spec} loading={isLast && isStreaming} />
            </div>
          );
        }
        return (
          <div key={`tools-${i}`} className="flex flex-col gap-1">
            {seg.tools.map((t) => (
              <ToolCallDisplay
                key={t.toolCallId}
                toolName={t.toolName}
                state={t.state}
                result={t.output}
              />
            ))}
          </div>
        );
      })}

      {showLoader && (
        <div className="text-sm text-muted-foreground animate-shimmer">
          思考中...
        </div>
      )}

      {showSpecAtEnd && (
        <div className="w-full">
          <RAGRenderer spec={spec} loading={isLast && isStreaming} />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function DeepRAGPage() {
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState(() => crypto.randomUUID());
  const scrollContainerRef = useRef<HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isStickToBottom = useRef(true);
  const isAutoScrolling = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Re-create transport when threadId changes (new conversation)
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/proxy?threadId=${threadId}`,
      }),
    [threadId],
  );

  const { messages, sendMessage, setMessages, status, error } =
    useChat<AppMessage>({ transport });

  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 80;
      if (isAutoScrolling.current) {
        if (atBottom) isAutoScrolling.current = false;
        return;
      }
      isStickToBottom.current = atBottom;
      setShowScrollButton(!atBottom);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !isStickToBottom.current) return;
    isAutoScrolling.current = true;
    el.scrollTop = el.scrollHeight;
    requestAnimationFrame(() => {
      isAutoScrolling.current = false;
    });
  }, [messages, isStreaming]);

  const scrollToBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isStickToBottom.current = true;
    setShowScrollButton(false);
    isAutoScrolling.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  const handleSubmit = useCallback(
    async (text?: string) => {
      const msg = text ?? input;
      if (!msg.trim() || isStreaming) return;
      setInput("");
      await sendMessage({ text: msg.trim() });
    },
    [input, isStreaming, sendMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setInput("");
    setThreadId(crypto.randomUUID()); // new thread → new deepagents conversation
    inputRef.current?.focus();
  }, [setMessages]);

  const isEmpty = messages.length === 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Deep RAG</h1>
          <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">
            deepagents + json-render
          </span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleNewConversation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              新对话
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Messages */}
      <main ref={scrollContainerRef} className="flex-1 overflow-auto">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-2xl w-full space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  智能知识库检索
                </h2>
                <p className="text-muted-foreground text-sm">
                  由 <strong>deepagents</strong> 驱动的 RAGFlow 检索智能体，结果通过{" "}
                  <strong>json-render</strong> 可视化呈现
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleSubmit(s.prompt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Search className="h-3 w-3" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-10 py-6 space-y-6">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLast={i === messages.length - 1}
                isStreaming={isStreaming}
              />
            ))}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error.message}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <div className="px-6 pb-3 flex-shrink-0 bg-background relative">
        {showScrollButton && !isEmpty && (
          <button
            onClick={scrollToBottom}
            className="absolute left-1/2 -translate-x-1/2 -top-10 z-10 h-8 w-8 rounded-full border border-border bg-background text-muted-foreground shadow-md flex items-center justify-center hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}
        <div className="max-w-4xl mx-auto relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isEmpty
                ? "输入产品型号或问题，例如：G10 的最大功率是多少？"
                : "继续提问..."
            }
            rows={2}
            className="w-full resize-none rounded-xl border border-input bg-card px-4 py-3 pr-12 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            autoFocus
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isStreaming}
            className="absolute right-3 bottom-3 h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
