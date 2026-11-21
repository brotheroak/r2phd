"use client";

import { useEffect, useState } from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
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

const NAV_KEY = "intentspec-console-nav";
const AGENT_KEY = "intentspec-console-agent";

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

  const [navOpen, setNavOpen] = useState(true);
  const [agentOpen, setAgentOpen] = useState(false);
  const [hydratedUi, setHydratedUi] = useState(false);

  useEffect(() => {
    try {
      const n = localStorage.getItem(NAV_KEY);
      const a = localStorage.getItem(AGENT_KEY);
      const narrow =
        typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
      if (n === "0") setNavOpen(false);
      else if (n === "1") setNavOpen(true);
      else if (narrow) setNavOpen(false);
      if (a === "1") setAgentOpen(true);
      else if (a === "0") setAgentOpen(false);
    } catch {
      // ignore
    }
    setHydratedUi(true);
  }, []);

  useEffect(() => {
    if (!hydratedUi) return;
    try {
      localStorage.setItem(NAV_KEY, navOpen ? "1" : "0");
      localStorage.setItem(AGENT_KEY, agentOpen ? "1" : "0");
    } catch {
      // ignore
    }
  }, [navOpen, agentOpen, hydratedUi]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (typing) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setNavOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setAgentOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className={cn(
        "console-surface flex h-svh min-h-0 flex-col overflow-hidden",
        isDark && "console-dark",
      )}
    >
      {/* Top chrome — above drawers so toggles stay clickable */}
      <header className="relative z-40 flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            data-testid="console-nav-toggle"
            onClick={() => setNavOpen((v) => !v)}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border px-2 text-muted-foreground hover:bg-mist hover:text-foreground"
            title={navOpen ? "메뉴 숨기기" : "메뉴 보이기"}
            aria-label={navOpen ? "메뉴 숨기기" : "메뉴 보이기"}
            aria-pressed={navOpen}
          >
            {navOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
            <span className="hidden text-xs font-medium sm:inline">메뉴</span>
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
              IS
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-foreground">
                IntentSpec
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {CONSOLE_TABS.find((t) => t.id === tab)?.label ?? "Analyze"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <StatusPill appearance={isDark ? "dark" : "light"} />
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-mist hover:text-foreground"
            title={isDark ? "라이트 모드" : "다크 모드"}
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            type="button"
            data-testid="console-agent-toggle"
            onClick={() => setAgentOpen((v) => !v)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium",
              agentOpen
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:bg-mist hover:text-foreground",
            )}
            title={agentOpen ? "Agent 숨기기" : "Agent 보이기"}
            aria-label={agentOpen ? "Agent 숨기기" : "Agent 보이기"}
            aria-pressed={agentOpen}
          >
            {agentOpen ? (
              <PanelRightClose className="size-4" />
            ) : (
              <PanelRightOpen className="size-4" />
            )}
            <MessageSquare className="size-3.5" />
            <span className="hidden sm:inline">Agent</span>
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Mobile scrim when a side panel is open */}
        {navOpen || agentOpen ? (
          <button
            type="button"
            aria-label="패널 닫기"
            className="absolute inset-0 z-20 bg-foreground/20 md:hidden"
            onClick={() => {
              setNavOpen(false);
              setAgentOpen(false);
            }}
          />
        ) : null}

        {/* Left nav — drawer on mobile, column on md+ */}
        <aside
          className={cn(
            "z-30 flex shrink-0 flex-col border-r border-border bg-card transition-[width,transform] duration-200",
            "absolute inset-y-0 left-0 w-[220px] md:static md:translate-x-0",
            navOpen
              ? "translate-x-0"
              : "-translate-x-full md:w-0 md:border-r-0 md:overflow-hidden md:translate-x-0",
          )}
        >
          <div
            className={cn(
              "flex h-full w-[220px] flex-col",
              !navOpen && "pointer-events-none md:pointer-events-none",
            )}
          >
            <div className="px-3 py-3">
              <div className="rounded-lg border border-border bg-mist/50 px-3 py-2">
                <p className="flex items-center gap-2 text-xs text-foreground">
                  <Boxes className="size-3.5 text-primary" />
                  quality_lab
                </p>
                <p className="mt-1 pl-5 font-mono text-[10px] text-muted-foreground">
                  workspace · core
                </p>
              </div>
            </div>

            <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
              <p className="mb-1.5 px-2 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Workspace
              </p>
              {CONSOLE_TABS.map((item) => {
                const active = tab === item.id;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={`/console/semantic?tab=${item.id}`}
                    onClick={() => {
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        setNavOpen(false);
                      }
                    }}
                    className={cn(
                      "flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition",
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
                      <span className="block text-sm font-medium">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="space-y-1.5 border-t border-border px-3 py-3 text-[11px]">
              <p className="font-medium text-muted-foreground">다른 적용 범위</p>
              <Link href="/clarify/research" className="block text-sky hover:underline">
                연구 구체화
              </Link>
              <Link
                href="/clarify/everyday"
                className="block text-signal hover:underline"
              >
                일상 질문 구체화
              </Link>
              <Link
                href="/"
                className="block text-muted-foreground hover:text-foreground"
              >
                ← 홈
              </Link>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-background">
          {children}
        </div>

        {/* Agent — drawer on mobile, column on md+; closed = no layout space */}
        <aside
          aria-hidden={!agentOpen}
          className={cn(
            "z-30 flex shrink-0 flex-col border-l border-border bg-card transition-[width,transform] duration-200",
            "absolute inset-y-0 right-0 w-[min(100vw,340px)] md:static md:translate-x-0",
            agentOpen
              ? "translate-x-0 md:w-[340px]"
              : "pointer-events-none translate-x-full md:w-0 md:border-l-0 md:overflow-hidden md:translate-x-0",
          )}
        >
          {agentOpen ? (
            <div className="flex h-full w-[min(100vw,340px)] min-h-0 flex-col md:w-[340px]">
              <ConsoleAgentChat
                open={agentOpen}
                onOpenChange={setAgentOpen}
                embedded
              />
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
