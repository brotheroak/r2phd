"use client";

import {
  GitBranchPlus,
  Link2,
  Lock,
  Table2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AXIS_BY_ID, INTENT_AXES } from "@/lib/intent-axes";
import {
  ENTITY_GRAPH,
  PHYSICAL_CATALOG,
  mappingsFromDraft,
  metricsFromSpec,
} from "@/lib/semantic-model";
import type { AnalysisDraft, AnalysisSpec } from "@/lib/types";
import type { ConsoleTab } from "@/components/console-shell";
import { cn } from "@/lib/utils";

type Props = {
  draft: AnalysisDraft | null;
  spec: AnalysisSpec | null;
  decisions?: Record<string, { chosenOption: string }>;
  tab?: ConsoleTab;
};

const AXIS_BORDER: Record<string, string> = {
  time: "border-amber-500/30",
  identity: "border-sky-500/30",
  measure: "border-teal-500/30",
  population: "border-emerald-500/30",
};

const AXIS_DOT: Record<string, string> = {
  time: "bg-amber-400",
  identity: "bg-sky-400",
  measure: "bg-teal-400",
  population: "bg-emerald-400",
};

export function SemanticLayer({
  draft,
  spec,
  decisions,
  tab = "ontology",
}: Props) {
  const mappings = mappingsFromDraft(draft, decisions);
  const metrics = metricsFromSpec(spec);
  const tableCount = PHYSICAL_CATALOG.schemas.reduce(
    (n, s) => n + s.tables.length,
    0,
  );
  const lockedMaps = mappings.filter((m) => m.locked).length;
  const mappedCols = mappings.reduce((n, m) => n + m.physical.length, 0);
  const lockedMetrics = metrics.filter((m) => m.locked).length;

  const statusLabel = spec
    ? "기준 반영됨"
    : draft
      ? "매핑 초안"
      : "카탈로그만";

  return (
    <div className="space-y-6">
      {/* KPI strip — dashboard feel, accents kept */}
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          label="물리 테이블"
          value={String(tableCount)}
          hint={`${PHYSICAL_CATALOG.name} · core`}
          badge={`${PHYSICAL_CATALOG.schemas.length} schema`}
          tone="teal"
        />
        <KpiCard
          label="온톨로지 매핑"
          value={`${lockedMaps}/${mappings.length}`}
          hint={
            draft
              ? "의도 → 용어 → 컬럼 연결"
              : "소개 페이지에서 분석을 돌리면 채워집니다"
          }
          badge={
            lockedMaps === mappings.length && draft ? (
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <TrendingUp className="size-3" />
                전부 확정
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-400">
                <TrendingDown className="size-3" />
                {mappings.length - lockedMaps} 미확정
              </span>
            )
          }
          tone="sky"
        />
        <KpiCard
          label="시맨틱 지표"
          value={String(metrics.length)}
          hint={
            lockedMetrics
              ? `${lockedMetrics}개 확정 · grain 고정`
              : "측정값 · 필터 · grain"
          }
          badge={`${mappedCols} cols`}
          tone="amber"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#16181d]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-sm font-medium text-zinc-100">
              {tabTitle(tab)}
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">{tabSubtitle(tab)}</p>
          </div>
          <span
            className={cn(
              "rounded-md border px-2.5 py-1 text-[11px]",
              spec
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : draft
                  ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                  : "border-white/10 bg-white/[0.04] text-zinc-400",
            )}
          >
            {statusLabel}
          </span>
        </div>

        <div className="p-5">
          {tab === "catalog" ? <CatalogPanel /> : null}
          {tab === "ontology" ? (
            <OntologyPanel mappings={mappings} />
          ) : null}
          {tab === "metrics" ? <MetricsPanel metrics={metrics} /> : null}
          {tab === "lineage" ? <LineagePanel /> : null}
        </div>
      </div>
    </div>
  );
}

function tabTitle(tab: ConsoleTab) {
  switch (tab) {
    case "catalog":
      return "Catalog";
    case "ontology":
      return "Ontology";
    case "metrics":
      return "Metrics";
    case "lineage":
      return "Lineage";
  }
}

function tabSubtitle(tab: ConsoleTab) {
  switch (tab) {
    case "catalog":
      return "웨어하우스 물리 스키마 · 테이블 · 컬럼";
    case "ontology":
      return "의도 → 용어 → 컬럼을 한 줄로 고정";
    case "metrics":
      return "시맨틱 레이어에 올린 측정값";
    case "lineage":
      return "엔터티 사이 조인 관계";
  }
}

function KpiCard({
  label,
  value,
  hint,
  badge,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  badge: React.ReactNode;
  tone: "teal" | "sky" | "amber";
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#16181d] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-zinc-500">{label}</p>
        <span className="text-[11px] text-zinc-400">{badge}</span>
      </div>
      <p
        className={cn(
          "mt-2 text-3xl font-semibold tracking-tight",
          tone === "teal" && "text-teal-300",
          tone === "sky" && "text-sky-300",
          tone === "amber" && "text-amber-300",
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">{hint}</p>
    </div>
  );
}

function CatalogPanel() {
  return (
    <div className="space-y-4">
      {PHYSICAL_CATALOG.schemas.map((schema) => (
        <div key={schema.name}>
          <p className="mb-2 text-[11px] font-medium tracking-[0.14em] text-zinc-500 uppercase">
            schema · {schema.name}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {schema.tables.map((table) => (
              <div
                key={table.name}
                className="rounded-lg border border-white/10 bg-black/20 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-100">
                    <Table2 className="size-3.5 text-sky-400" />
                    {table.name}
                  </span>
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-400">
                    {table.role}
                  </span>
                </div>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-zinc-500">
                  {table.columns.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function OntologyPanel({
  mappings,
}: {
  mappings: ReturnType<typeof mappingsFromDraft>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {INTENT_AXES.map((axis) => (
          <span
            key={axis.id}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-300"
          >
            <span
              className={cn("size-1.5 rounded-full", AXIS_DOT[axis.id])}
            />
            {axis.label}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        {mappings.map((m) => {
          const axis = AXIS_BY_ID[m.axis];
          return (
            <div
              key={m.id}
              className={cn(
                "rounded-lg border bg-black/20 p-3",
                AXIS_BORDER[m.axis] ?? "border-white/10",
              )}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-zinc-200">
                  <span
                    className={cn("size-1.5 rounded-full", AXIS_DOT[m.axis])}
                  />
                  {axis.label}
                </span>
                {m.locked ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                    <Lock className="size-3" />
                    확정
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-500">미확정</span>
                )}
              </div>

              <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
                <LayerNode tone="intent" title="의도" body={m.intentConcept} />
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
                    m.physical.length ? m.physical.join(", ") : "연결 대기"
                  }
                />
              </div>

              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                {m.chosen ? (
                  <>
                    <span className="text-zinc-200">선택: </span>
                    {m.chosen}
                  </>
                ) : (
                  m.condition
                )}
              </p>
              {m.exceptions.length ? (
                <p className="mt-1 text-[11px] text-amber-400/90">
                  제외: {m.exceptions.join(", ")}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricsPanel({
  metrics,
}: {
  metrics: ReturnType<typeof metricsFromSpec>;
}) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {metrics.map((metric) => (
        <li
          key={metric.id}
          className="rounded-lg border border-white/10 bg-black/20 p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-zinc-100">{metric.name}</p>
            {metric.locked ? (
              <Lock className="size-3.5 shrink-0 text-emerald-400" />
            ) : null}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">
            {metric.expression}
          </p>
          <p className="mt-3 font-mono text-[11px] text-sky-400">
            grain · {metric.grain}
          </p>
          {metric.filters.length ? (
            <ul className="mt-2 space-y-1">
              {metric.filters.map((f) => (
                <li
                  key={f}
                  className="rounded-md bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-400"
                >
                  {f}
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function LineagePanel() {
  return (
    <div>
      <p className="mb-3 flex items-center gap-1.5 text-xs text-zinc-500">
        <GitBranchPlus className="size-3.5" />
        엔터티 관계
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {ENTITY_GRAPH.map((edge) => (
          <div
            key={`${edge.from}-${edge.to}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs"
          >
            <span className="font-medium text-sky-400">{edge.from}</span>
            <span className="text-zinc-500">—{edge.label}→</span>
            <span className="font-medium text-teal-400">{edge.to}</span>
            <span className="font-mono text-[10px] text-zinc-600">
              {edge.on}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-black/30">
        <svg
          viewBox="0 0 640 160"
          className="h-40 w-full text-zinc-600"
          aria-hidden
        >
          <defs>
            <linearGradient id="waveA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="waveB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a1a1aa" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#a1a1aa" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 110 C80 90 120 40 200 55 C280 70 320 120 400 100 C480 80 520 30 640 50 L640 160 L0 160 Z"
            fill="url(#waveB)"
          />
          <path
            d="M0 120 C100 100 140 70 220 85 C300 100 340 130 420 115 C500 100 560 60 640 80 L640 160 L0 160 Z"
            fill="url(#waveA)"
          />
          <path
            d="M0 110 C80 90 120 40 200 55 C280 70 320 120 400 100 C480 80 520 30 640 50"
            fill="none"
            stroke="#a1a1aa"
            strokeWidth="1.2"
            opacity="0.5"
          />
          <path
            d="M0 120 C100 100 140 70 220 85 C300 100 340 130 420 115 C500 100 560 60 640 80"
            fill="none"
            stroke="#5eead4"
            strokeWidth="1.4"
            opacity="0.7"
          />
        </svg>
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
        "rounded-md border px-2.5 py-2",
        tone === "intent" && "border-teal-500/25 bg-teal-500/5",
        tone === "glossary" && "border-sky-500/25 bg-sky-500/5",
        tone === "physical" && "border-amber-500/25 bg-amber-500/5",
      )}
    >
      <p className="flex items-center gap-1 text-[10px] tracking-wide text-zinc-500">
        {tone === "glossary" ? <Link2 className="size-3" /> : null}
        {title}
      </p>
      <p className="mt-0.5 text-sm font-medium leading-snug text-zinc-100">
        {body}
      </p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden justify-center text-zinc-600 md:flex">→</div>
  );
}
