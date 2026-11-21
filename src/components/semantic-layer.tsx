"use client";

import { Boxes, GitBranchPlus, Link2, Lock, Table2 } from "lucide-react";
import { AXIS_BY_ID, INTENT_AXES } from "@/lib/intent-axes";
import {
  ENTITY_GRAPH,
  PHYSICAL_CATALOG,
  mappingsFromDraft,
  metricsFromSpec,
} from "@/lib/semantic-model";
import type { AnalysisDraft, AnalysisSpec } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  draft: AnalysisDraft | null;
  spec: AnalysisSpec | null;
  decisions?: Record<string, { chosenOption: string }>;
};

export function SemanticLayer({ draft, spec, decisions }: Props) {
  const mappings = mappingsFromDraft(draft, decisions);
  const metrics = metricsFromSpec(spec);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">시맨틱 레이어</p>
          <h3 className="font-display text-2xl text-ink sm:text-3xl">
            질문 · 용어 · 표를 한 모델로 붙입니다
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            물리 테이블 위에 용어와 분석 기준을 올려 둡니다. Databricks의 시맨틱
            모델처럼, SQL을 짜기 전에 “무엇을 같은 것으로 볼지”를 먼저 봅니다.
          </p>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            "w-fit font-normal",
            spec
              ? "border border-ok/30 bg-ok/10 text-ok"
              : "border border-sky/30 bg-sky/10 text-sky",
          )}
        >
          {spec ? "기준 반영됨" : draft ? "매핑 초안" : "카탈로그만 표시"}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr_240px]">
        {/* Catalog rail — Databricks Unity Catalog feel */}
        <aside className="panel overflow-hidden">
          <div className="border-b border-border/70 bg-secondary/40 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Boxes className="size-3.5 text-primary" />
              카탈로그
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              {PHYSICAL_CATALOG.name}
            </p>
          </div>
          <div className="space-y-3 p-3">
            {PHYSICAL_CATALOG.schemas.map((schema) => (
              <div key={schema.name}>
                <p className="mb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground">
                  schema · {schema.name}
                </p>
                <ul className="space-y-1">
                  {schema.tables.map((table) => (
                    <li
                      key={table.name}
                      className="rounded-lg border border-border/60 bg-card px-2.5 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                          <Table2 className="size-3.5 text-sky" />
                          {table.name}
                        </span>
                        <Badge variant="outline" className="font-normal text-[10px]">
                          {table.role}
                        </Badge>
                      </div>
                      <p className="mt-1 font-mono text-[10px] leading-relaxed text-muted-foreground">
                        {table.columns.join(", ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Mapping canvas */}
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/70 bg-mist/50 px-4 py-2.5">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Link2 className="size-4 text-primary" />
              온톨로지 매핑
            </p>
            <p className="text-xs text-muted-foreground">
              의도 → 용어 → 컬럼
            </p>
          </div>

          <div className="space-y-3 p-4">
            {/* Axis legend */}
            <div className="flex flex-wrap gap-2">
              {INTENT_AXES.map((axis) => (
                <span
                  key={axis.id}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs",
                    axis.tint,
                    axis.accent,
                  )}
                >
                  {axis.label}
                </span>
              ))}
            </div>

            {mappings.map((m) => {
              const axis = AXIS_BY_ID[m.axis];
              return (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-xl border border-border/70 p-3",
                    axis.tint,
                  )}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="font-normal">
                      {axis.label}
                    </Badge>
                    {m.locked ? (
                      <span className="inline-flex items-center gap-1 text-xs text-ok">
                        <Lock className="size-3" />
                        확정
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">미확정</span>
                    )}
                  </div>

                  <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
                    <LayerNode
                      tone="intent"
                      title="의도"
                      body={m.intentConcept}
                    />
                    <Arrow />
                    <LayerNode
                      tone="glossary"
                      title="용어"
                      body={m.glossaryTerm}
                    />
                    <Arrow />
                    <LayerNode
                      tone="physical"
                      title="물리"
                      body={
                        m.physical.length
                          ? m.physical.join(", ")
                          : "연결 대기"
                      }
                    />
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-foreground/80">
                    {m.chosen ? (
                      <>
                        <span className="font-medium">선택: </span>
                        {m.chosen}
                      </>
                    ) : (
                      m.condition
                    )}
                  </p>
                  {m.exceptions.length ? (
                    <p className="mt-1 text-[11px] text-signal">
                      제외: {m.exceptions.join(", ")}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Relationship graph */}
          <div className="border-t border-border/70 px-4 py-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <GitBranchPlus className="size-3.5" />
              엔터티 관계
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {ENTITY_GRAPH.map((edge, i) => (
                <div
                  key={`${edge.from}-${edge.to}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 py-1.5 text-xs"
                >
                  <span className="font-medium text-sky">{edge.from}</span>
                  <span className="text-muted-foreground">—{edge.label}→</span>
                  <span className="font-medium text-primary">{edge.to}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {edge.on}
                  </span>
                  {i < ENTITY_GRAPH.length - 1 ? (
                    <span className="sr-only">next</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Metrics panel */}
        <aside className="panel overflow-hidden">
          <div className="border-b border-border/70 bg-amber/10 px-3 py-2.5">
            <p className="text-xs font-medium text-signal">지표 (Metrics)</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              시맨틱 레이어에 올린 측정값
            </p>
          </div>
          <ul className="space-y-3 p-3">
            {metrics.map((metric) => (
              <li
                key={metric.id}
                className="rounded-xl border border-border/70 bg-card p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{metric.name}</p>
                  {metric.locked ? (
                    <Lock className="size-3.5 shrink-0 text-ok" />
                  ) : null}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {metric.expression}
                </p>
                <p className="mt-2 font-mono text-[10px] text-sky">
                  grain · {metric.grain}
                </p>
                {metric.filters.length ? (
                  <ul className="mt-2 space-y-1">
                    {metric.filters.map((f) => (
                      <li
                        key={f}
                        className="rounded-md bg-secondary/60 px-2 py-1 text-[11px]"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function LayerNode({
  title,
  body,
  tone,
}: {
  title: string;
  body: string;
  tone: "intent" | "glossary" | "physical";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-2.5 py-2",
        tone === "intent" && "border-primary/30 bg-white/80",
        tone === "glossary" && "border-sky/30 bg-white/80",
        tone === "physical" && "border-signal/30 bg-white/80",
      )}
    >
      <p className="text-[10px] tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-0.5 text-sm font-medium leading-snug">{body}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden justify-center text-muted-foreground md:flex">→</div>
  );
}
