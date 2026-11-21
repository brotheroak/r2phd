"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SemanticLayer } from "@/components/semantic-layer";
import { Workspace } from "@/components/workspace";
import type { ConsoleTab } from "@/components/console-shell";
import { CONSOLE_TABS } from "@/components/console-shell";
import { useConsoleStore } from "@/lib/console-store";
import { cn } from "@/lib/utils";

export default function SemanticConsolePage() {
  const { draft, spec, decisions, hydrated, linkedTables } = useConsoleStore();
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
      <header className="flex items-center justify-between gap-3 border-b border-border bg-card/60 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            Console
          </span>
          <span className="text-border">/</span>
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <div className="hidden items-center gap-3 text-[11px] text-muted-foreground sm:flex">
          <span>tables · {linkedTables.length || "—"}</span>
          <span>draft · {draft ? "yes" : "no"}</span>
          <span>spec · {spec ? "yes" : "no"}</span>
        </div>
      </header>

      <div className="flex-1 p-4 md:p-5">
        {!hydrated ? (
          <p className="text-sm text-muted-foreground">불러오는 중…</p>
        ) : tab === "analyze" ? (
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm md:p-5">
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

            {!draft && tab !== "catalog" && tab !== "lineage" ? (
              <div className="rounded-lg border border-sky/30 bg-sky/5 p-4">
                <p className="text-sm font-medium text-foreground">
                  아직 매핑 초안이 없습니다
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Analyze를 거치지 않아도 됩니다. 오른쪽 Agent에게 「온톨로지 초안
                  만들어줘」또는 「예제 돌려줘」라고 말하거나, Catalog에서 테이블을
                  연결하세요.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href="/console/semantic?tab=catalog"
                    className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-mist"
                  >
                    Catalog 연결
                  </Link>
                  <Link
                    href="/console/semantic?tab=analyze"
                    className={cn(
                      "inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground",
                    )}
                  >
                    Analyze 열기
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
