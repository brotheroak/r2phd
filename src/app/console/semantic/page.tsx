"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SemanticLayer } from "@/components/semantic-layer";
import { Workspace } from "@/components/workspace";
import type { ConsoleTab } from "@/components/console-shell";
import { CONSOLE_TABS } from "@/components/console-shell";
import { useConsoleStore } from "@/lib/console-store";
import { useConsoleTheme } from "@/lib/console-theme";
import { cn } from "@/lib/utils";

export default function SemanticConsolePage() {
  const { draft, spec, decisions, hydrated, linkedTables } = useConsoleStore();
  const { isDark } = useConsoleTheme();
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab");
  const tab: ConsoleTab =
    CONSOLE_TABS.some((t) => t.id === raw) && raw
      ? (raw as ConsoleTab)
      : "analyze";

  const title =
    CONSOLE_TABS.find((t) => t.id === tab)?.label ?? "Analyze";

  return (
    <div className="flex min-h-svh flex-col">
      <header
        className={cn(
          "flex items-center justify-between gap-3 border-b px-4 py-2.5",
          isDark ? "border-white/10" : "border-border/70 bg-card/60",
        )}
      >
        <div className="flex items-center gap-2 text-sm">
          <span
            className={cn(
              "font-mono text-[11px] tracking-wide uppercase",
              isDark ? "text-zinc-500" : "text-muted-foreground",
            )}
          >
            Console
          </span>
          <span className={isDark ? "text-zinc-600" : "text-border"}>/</span>
          <span
            className={cn(
              "font-medium",
              isDark ? "text-zinc-100" : "text-ink",
            )}
          >
            {title}
          </span>
        </div>
        <div
          className={cn(
            "hidden items-center gap-3 text-[11px] sm:flex",
            isDark ? "text-zinc-500" : "text-muted-foreground",
          )}
        >
          <span>
            tables · {linkedTables.length || "—"}
          </span>
          <span>
            draft · {draft ? "yes" : "no"}
          </span>
          <span>
            spec · {spec ? "yes" : "no"}
          </span>
        </div>
      </header>

      <div className="flex-1 p-4 md:p-5">
        {!hydrated ? (
          <p
            className={cn(
              "text-sm",
              isDark ? "text-zinc-500" : "text-muted-foreground",
            )}
          >
            불러오는 중…
          </p>
        ) : tab === "analyze" ? (
          <div
            className={cn(
              "rounded-lg border p-4 md:p-5",
              isDark
                ? "border-white/10 bg-[#16181d]"
                : "border-border/80 bg-card shadow-sm",
            )}
          >
            <Workspace variant="console" />
          </div>
        ) : (
          <div className="space-y-4">
            <SemanticLayer
              draft={draft}
              spec={spec}
              decisions={decisions}
              tab={tab}
            />

            {!draft ? (
              <div
                className={cn(
                  "rounded-lg border p-4",
                  isDark
                    ? "border-sky-500/20 bg-sky-500/5"
                    : "border-sky/30 bg-sky/5",
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium",
                    isDark ? "text-zinc-100" : "text-ink",
                  )}
                >
                  아직 분석 초안이 없습니다
                </p>
                <p
                  className={cn(
                    "mt-1 text-sm leading-relaxed",
                    isDark ? "text-zinc-400" : "text-muted-foreground",
                  )}
                >
                  Catalog에서 테이블을 연결한 뒤, Analyze 탭에서 예제를 돌리거나
                  질문을 넣으면 의도·용어·컬럼 매핑이 여기에 채워집니다.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href="/console/semantic?tab=analyze"
                    className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
                  >
                    Analyze에서 시작
                  </Link>
                  <Link
                    href="/console/semantic?tab=catalog"
                    className={cn(
                      "inline-flex h-8 items-center rounded-lg border px-3 text-sm font-medium",
                      isDark
                        ? "border-white/15 text-zinc-200 hover:bg-white/[0.04]"
                        : "border-border bg-card hover:bg-mist",
                    )}
                  >
                    Catalog 연결
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
