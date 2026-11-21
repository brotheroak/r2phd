"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Boxes,
  FileSearch,
  GitBranchPlus,
  Layers3,
  Link2,
  MessageSquare,
  Moon,
  Sun,
  Table2,
} from "lucide-react";
import { ConsoleAgentChat } from "@/components/console-agent-chat";
import { StatusPill } from "@/components/status-pill";
import {
  ConsoleThemeProvider,
  useConsoleTheme,
} from "@/lib/console-theme";
import { cn } from "@/lib/utils";

export const CONSOLE_TABS = [
  {
    id: "analyze",
    label: "Analyze",
    description: "질문 · 기준 · SQL · 점검",
    icon: FileSearch,
  },
  {
    id: "catalog",
    label: "Catalog",
    description: "스키마 · 테이블 · 컬럼",
    icon: Table2,
  },
  {
    id: "ontology",
    label: "Ontology",
    description: "의도 · 용어 · 컬럼 매핑",
    icon: Link2,
  },
  {
    id: "metrics",
    label: "Metrics",
    description: "측정값 · grain · 필터",
    icon: Layers3,
  },
  {
    id: "lineage",
    label: "Lineage",
    description: "엔터티 관계",
    icon: GitBranchPlus,
  },
] as const;

export type ConsoleTab = (typeof CONSOLE_TABS)[number]["id"];

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  return (
    <ConsoleThemeProvider>
      <ConsoleShellInner>{children}</ConsoleShellInner>
    </ConsoleThemeProvider>
  );
}

function ConsoleShellInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab");
  const tab: ConsoleTab =
    CONSOLE_TABS.some((t) => t.id === raw) && raw
      ? (raw as ConsoleTab)
      : "analyze";
  const { isDark, toggleTheme } = useConsoleTheme();
  const [agentOpen, setAgentOpen] = useState(false);

  return (
    <div
      className={cn(
        "console-surface min-h-svh lg:grid lg:grid-cols-[240px_minmax(0,1fr)_320px]",
        isDark && "console-dark",
      )}
    >
      <aside
        className={cn(
          "flex flex-col border-b bg-card lg:min-h-svh lg:border-b-0 lg:border-r",
          "border-border",
        )}
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            IS
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">
              IntentSpec
            </p>
            <p className="text-[11px] text-muted-foreground">
              분석 게이트 · 코어 에이전트
            </p>
          </div>
        </div>

        <div className="px-3 pb-3">
          <div className="rounded-lg border border-border bg-mist/50 px-3 py-2.5">
            <p className="flex items-center gap-2 text-xs text-foreground">
              <Boxes className="size-3.5 text-primary" />
              quality_lab
            </p>
            <p className="mt-1 pl-5 font-mono text-[10px] text-muted-foreground">
              workspace · core
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 pb-4">
          <p className="mb-2 px-2 text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Workspace
          </p>
          {CONSOLE_TABS.map((item) => {
            const active = tab === item.id;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={`/console/semantic?tab=${item.id}`}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-2.5 transition",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-mist hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    active ? "text-primary" : "opacity-80",
                  )}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-border px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <StatusPill appearance={isDark ? "dark" : "light"} />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAgentOpen((v) => !v)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-mist hover:text-foreground lg:hidden"
                title="Agent"
                aria-label="Agent 채팅"
              >
                <MessageSquare className="size-4" />
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-mist hover:text-foreground"
                title={isDark ? "라이트 모드" : "다크 모드"}
                aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
              >
                {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <p className="font-medium text-muted-foreground">다른 적용 범위</p>
            <Link
              href="/clarify/research"
              className="block text-sky hover:underline"
            >
              🔬 연구 구체화
            </Link>
            <Link
              href="/clarify/everyday"
              className="block text-signal hover:underline"
            >
              💬 일상 질문 구체화
            </Link>
            <Link
              href="/"
              className="block text-muted-foreground transition hover:text-foreground"
            >
              ← 적용 범위 홈
            </Link>
          </div>
        </div>
      </aside>

      <div className="min-w-0 bg-background">{children}</div>

      <ConsoleAgentChat open={agentOpen} onOpenChange={setAgentOpen} />
    </div>
  );
}
