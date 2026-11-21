"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SemanticLayer } from "@/components/semantic-layer";
import { useConsoleStore } from "@/lib/console-store";

export default function SemanticConsolePage() {
  const { draft, spec, decisions, hydrated } = useConsoleStore();

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">콘솔</p>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            시맨틱 레이어
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            물리 카탈로그 위에 용어와 분석 기준을 올리는 화면입니다. 분석 콘솔에서
            질문과 기준을 정하면 이곳에 매핑과 지표가 채워집니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/console"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-medium shadow-sm hover:bg-accent/40"
          >
            <ArrowLeft className="size-4" />
            분석 콘솔
          </Link>
          {draft ? (
            <Link
              href="/console"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              기준 이어서 정하기
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>

      {!hydrated ? (
        <p className="text-sm text-muted-foreground">불러오는 중…</p>
      ) : (
        <SemanticLayer draft={draft} spec={spec} decisions={decisions} />
      )}

      {!draft && hydrated ? (
        <div className="panel tint-sky p-5">
          <p className="font-medium text-ink">아직 분석 초안이 없습니다</p>
          <p className="mt-1 text-sm text-muted-foreground">
            지금은 카탈로그와 빈 매핑만 보입니다. 분석 콘솔에서 예제를 돌리면
            의도·용어·컬럼 연결이 여기에 나타납니다.
          </p>
          <Link
            href="/console"
            className="mt-4 inline-flex h-9 items-center rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground"
          >
            분석 콘솔로 가기
          </Link>
        </div>
      ) : null}
    </div>
  );
}
