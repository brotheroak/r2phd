"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SemanticLayer } from "@/components/semantic-layer";
import type { ConsoleTab } from "@/components/console-shell";
import { CONSOLE_TABS } from "@/components/console-shell";
import { useConsoleStore } from "@/lib/console-store";

export default function SemanticConsolePage() {
  const { draft, spec, decisions, hydrated } = useConsoleStore();
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab");
  const tab: ConsoleTab =
    CONSOLE_TABS.some((t) => t.id === raw) && raw
      ? (raw as ConsoleTab)
      : "ontology";

  const title =
    CONSOLE_TABS.find((t) => t.id === tab)?.label ?? "Ontology";

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center gap-3 border-b border-white/10 px-5 py-3.5">
        <div className="flex size-7 items-center justify-center rounded-md border border-white/10 text-zinc-400">
          <span className="sr-only">menu</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Semantic</span>
          <span className="text-zinc-600">/</span>
          <span className="font-medium text-zinc-100">{title}</span>
        </div>
      </header>

      <div className="flex-1 space-y-5 p-5 md:p-6">
        {!hydrated ? (
          <p className="text-sm text-zinc-500">불러오는 중…</p>
        ) : (
          <SemanticLayer
            draft={draft}
            spec={spec}
            decisions={decisions}
            tab={tab}
          />
        )}

        {!draft && hydrated ? (
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
            <p className="text-sm font-medium text-zinc-100">
              아직 분석 초안이 없습니다
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              지금은 카탈로그와 빈 매핑만 보입니다. 소개 페이지에서 예제를 돌리면
              의도·용어·컬럼 연결이 여기에 나타납니다.
            </p>
            <Link
              href="/#workspace"
              className="mt-4 inline-flex h-9 items-center rounded-lg bg-[#0f6b63] px-3 text-sm font-medium text-white transition hover:bg-[#0d5c56]"
            >
              소개 페이지에서 분석하기
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
