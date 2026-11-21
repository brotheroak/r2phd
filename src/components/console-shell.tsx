"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Boxes,
  FileSearch,
  GitBranchPlus,
  Layers3,
  Link2,
  Moon,
  Sun,
  Table2,
} from "lucide-react";
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

  return (
    <div
      className={cn(
        "console-surface min-h-svh lg:grid lg:grid-cols-[250px_1fr]",
        isDark ? "console-dark text-zinc-100" : "text-foreground",
      )}
    >
      <aside
        className={cn(
          "flex flex-col border-b lg:min-h-svh lg:border-b-0 lg:border-r",
          isDark
            ? "border-white/10 bg-[#0b0d10]"
            : "border-border/80 bg-card/90",
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            IS
          </div>
          <div>
            <p className="text-sm font-medium tracking-tight">IntentSpec</p>
            <p
              className={cn(
                "text-[11px]",
                isDark ? "text-zinc-500" : "text-muted-foreground",
              )}
            >
              Semantic Console
            </p>
          </div>
        </div>

        <div className="px-3 pb-3">
          <div
            className={cn(
              "rounded-lg border px-3 py-2.5",
              isDark
                ? "border-white/10 bg-white/[0.04]"
                : "border-border/70 bg-mist/60",
            )}
          >
            <p
              className={cn(
                "flex items-center gap-2 text-xs",
                isDark ? "text-zinc-300" : "text-foreground",
              )}
            >
              <Boxes className="size-3.5 text-primary" />
              quality_lab
            </p>
            <p
              className={cn(
                "mt-1 pl-5 font-mono text-[10px]",
                isDark ? "text-zinc-500" : "text-muted-foreground",
              )}
            >
              workspace · core
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 pb-4">
          <p
            className={cn(
              "mb-2 px-2 text-[10px] font-medium tracking-[0.16em] uppercase",
              isDark ? "text-zinc-600" : "text-muted-foreground",
            )}
          >
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
                  isDark
                    ? active
                      ? "bg-white/[0.09] text-white"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                    : active
                      ? "bg-primary/10 text-ink"
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
                  <span
                    className={cn(
                      "mt-0.5 block text-[11px] leading-snug",
                      isDark ? "text-zinc-500" : "text-muted-foreground",
                    )}
                  >
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div
          className={cn(
            "space-y-3 border-t px-5 py-4",
            isDark ? "border-white/10" : "border-border/70",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <StatusPill appearance={isDark ? "dark" : "light"} />
            <button
              type="button"
              onClick={toggleTheme}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-lg border transition",
                isDark
                  ? "border-white/10 text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
                  : "border-border bg-card text-muted-foreground hover:bg-mist hover:text-foreground",
              )}
              title={isDark ? "라이트 모드" : "다크 모드"}
              aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
          <Link
            href="/"
            className={cn(
              "block text-[11px] transition",
              isDark
                ? "text-zinc-600 hover:text-zinc-400"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            ← 소개 페이지
          </Link>
        </div>
      </aside>

      <div
        className={cn(
          "min-w-0",
          isDark ? "bg-[#111318]" : "bg-[color-mix(in_oklab,var(--mist)_55%,white)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
