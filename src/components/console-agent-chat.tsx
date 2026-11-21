"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import type { ConsoleAgentAction } from "@/lib/console-agent";
import { demoWorkspaceSeed } from "@/lib/console-agent";
import {
  allCatalogTableNames,
  buildSchemaFromTables,
} from "@/lib/semantic-model";
import { useConsoleStore } from "@/lib/console-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: ConsoleAgentAction[];
};

const SUGGESTIONS: Record<string, string[]> = {
  catalog: ["전체 테이블 연결해줘", "tests가 뭐야?", "스키마에 반영해줘"],
  ontology: ["온톨로지 초안 만들어줘", "기간 기준이 뭐야?", "예제 돌려줘"],
  metrics: ["지표 설명해줘", "예제 돌려줘", "온톨로지 초안 만들어줘"],
  lineage: ["관계 설명해줘", "조인 키가 뭐야?"],
  analyze: [
    "예제 불러와줘",
    "기준 잠그기 전에 뭘 고르지?",
    "내 의도 못 읽고 자기 마음대로 고치지 마",
  ],
};

export function ConsoleAgentChat({
  open,
  onOpenChange,
  embedded = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Rendered inside a width-collapsible shell column */
  embedded?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "analyze";
  const store = useConsoleStore();
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "콘솔 Agent입니다. 테이블 연결, 온톨로지 초안, 예제 로드를 말할 수 있습니다.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, pending]);

  function applyActions(actions: ConsoleAgentAction[], hint = "") {
    let linked = [...store.linkedTables];
    let navigateTo: Extract<ConsoleAgentAction, { type: "navigate" }> | null =
      null;

    for (const action of actions) {
      switch (action.type) {
        case "link_tables": {
          linked = action.tables.length
            ? action.tables
            : allCatalogTableNames();
          store.setLinkedTables(linked);
          break;
        }
        case "apply_schema": {
          const tables = linked.length ? linked : allCatalogTableNames();
          if (!linked.length) {
            linked = tables;
            store.setLinkedTables(tables);
          }
          store.setSchema(buildSchemaFromTables(tables));
          break;
        }
        case "seed_demo_workspace": {
          const seed = demoWorkspaceSeed(hint);
          linked = seed.linkedTables;
          store.patch({
            researchQuestion: seed.researchQuestion,
            glossary: seed.glossary,
            schema: seed.schema,
            resultCsv: seed.resultCsv,
            candidateSql: seed.candidateSql,
            linkedTables: seed.linkedTables,
            draft: seed.draft,
            decisions: {},
            intentLocked: false,
            lockedAt: null,
            spec: null,
            report: null,
          });
          break;
        }
        case "seed_ontology_draft": {
          const seed = demoWorkspaceSeed(
            store.researchQuestion || hint,
          );
          linked = store.linkedTables.length
            ? store.linkedTables
            : seed.linkedTables;
          store.patch({
            draft: seed.draft,
            linkedTables: linked,
            schema: store.schema.trim() ? store.schema : seed.schema,
            glossary: store.glossary.trim() ? store.glossary : seed.glossary,
            researchQuestion: store.researchQuestion.trim()
              ? store.researchQuestion
              : seed.researchQuestion,
            decisions: {},
            intentLocked: false,
            lockedAt: null,
            spec: null,
            report: null,
          });
          break;
        }
        case "navigate": {
          navigateTo = action;
          break;
        }
        case "open_collab": {
          router.push("/clarify/collab");
          break;
        }
      }
    }

    if (navigateTo) {
      router.push(`/console/semantic?tab=${navigateTo.tab}`);
    }
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || pending) return;
    setInput("");
    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMsg]);
    setPending(true);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome")
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/console-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ac.signal,
        body: JSON.stringify({
          message,
          tab,
          linkedTables: store.linkedTables,
          hasDraft: Boolean(store.draft),
          hasSpec: Boolean(store.spec),
          schemaPreview: store.schema,
          history,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            content: json.error ?? "응답을 받지 못했습니다.",
          },
        ]);
        return;
      }
      const actions = (json.actions ?? []) as ConsoleAgentAction[];
      applyActions(actions, message);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: json.reply,
          actions,
        },
      ]);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content: "네트워크 오류로 에이전트에 닿지 못했습니다.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  const suggestions = SUGGESTIONS[tab] ?? SUGGESTIONS.analyze;

  // Closed panels must unmount so header toggles are the only Agent controls.
  if (!open) return null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Agent</p>
            <p className="text-[10px] text-muted-foreground">
              {tab} · 조회 · 수정
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-mist hover:text-foreground"
          onClick={() => onOpenChange(false)}
          aria-label="Agent 닫기"
          title="Agent 닫기"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
              m.role === "user"
                ? "ml-6 bg-primary text-primary-foreground"
                : "mr-1 border border-border bg-muted/40 text-foreground",
            )}
          >
            {m.content}
            {m.actions?.length ? (
              <p className="mt-1.5 text-[10px] opacity-70">
                적용: {m.actions.map((a) => a.type).join(", ")}
              </p>
            ) : null}
          </div>
        ))}
        {pending ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            응답 작성 중…
          </p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 space-y-2 border-t border-border p-3">
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() => send(s)}
              className="rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="에이전트에게 말하기…"
            className="min-h-[52px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            className="shrink-0 self-end"
            disabled={pending || !input.trim()}
            onClick={() => void send(input)}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
