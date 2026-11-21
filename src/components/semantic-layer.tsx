"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
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
  allCatalogTableNames,
  buildSchemaFromTables,
  mappingsFromDraft,
  metricsFromSpec,
} from "@/lib/semantic-model";
import type { AnalysisDraft, AnalysisSpec } from "@/lib/types";
import type { ConsoleTab } from "@/components/console-shell";
import { useConsoleStore } from "@/lib/console-store";
import { useConsoleTheme } from "@/lib/console-theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  draft: AnalysisDraft | null;
  spec: AnalysisSpec | null;
  decisions?: Record<string, { chosenOption: string }>;
  tab?: ConsoleTab;
};

export function SemanticLayer({
  draft,
  spec,
  decisions,
  tab = "ontology",
}: Props) {
  const { isDark } = useConsoleTheme();
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
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          isDark={isDark}
          label="물리 테이블"
          value={String(tableCount)}
          hint={`${PHYSICAL_CATALOG.name} · core+finance`}
          badge={`${PHYSICAL_CATALOG.schemas.length} schemas`}
          tone="teal"
        />
        <KpiCard
          isDark={isDark}
          label="온톨로지 매핑"
          value={`${lockedMaps}/${mappings.length}`}
          hint={
            draft
              ? "의도 → 용어 → 컬럼 연결"
              : "Agent에게 「온톨로지 초안」또는 Analyze에서 채우기"
          }
          badge={
            lockedMaps === mappings.length && draft ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  isDark ? "text-emerald-400" : "text-ok",
                )}
              >
                <TrendingUp className="size-3" />
                전부 확정
              </span>
            ) : (
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  isDark ? "text-amber-400" : "text-signal",
                )}
              >
                <TrendingDown className="size-3" />
                {mappings.length - lockedMaps} 미확정
              </span>
            )
          }
          tone="sky"
        />
        <KpiCard
          isDark={isDark}
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

      <div
        className={cn(
          "overflow-hidden rounded-lg border",
          isDark
            ? "border-white/10 bg-[#16181d]"
            : "border-border/80 bg-card shadow-sm",
        )}
      >
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3",
            isDark ? "border-white/10" : "border-border/70 bg-mist/40",
          )}
        >
          <div>
            <h2
              className={cn(
                "text-sm font-semibold",
                isDark ? "text-zinc-100" : "text-ink",
              )}
            >
              {tabTitle(tab)}
            </h2>
            <p
              className={cn(
                "mt-0.5 text-xs",
                isDark ? "text-zinc-500" : "text-muted-foreground",
              )}
            >
              {tabSubtitle(tab)}
            </p>
          </div>
          <span
            className={cn(
              "rounded-md border px-2.5 py-1 text-[11px]",
              spec
                ? isDark
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-ok/30 bg-ok/10 text-ok"
                : draft
                  ? isDark
                    ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                    : "border-sky/30 bg-sky/10 text-sky"
                  : isDark
                    ? "border-white/10 bg-white/[0.04] text-zinc-400"
                    : "border-border bg-secondary/50 text-muted-foreground",
            )}
          >
            {statusLabel}
          </span>
        </div>

        <div className="p-4">
          {tab === "catalog" ? <CatalogPanel /> : null}
          {tab === "ontology" ? (
            <OntologyPanel mappings={mappings} isDark={isDark} />
          ) : null}
          {tab === "metrics" ? (
            <MetricsPanel metrics={metrics} isDark={isDark} />
          ) : null}
          {tab === "lineage" ? <LineagePanel isDark={isDark} /> : null}
        </div>
      </div>
    </div>
  );
}

function tabTitle(tab: ConsoleTab) {
  switch (tab) {
    case "analyze":
      return "Analyze";
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
    case "analyze":
      return "질문부터 결과 점검까지";
    case "catalog":
      return "테이블을 선택해 분석 스키마에 연결합니다";
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
  isDark,
}: {
  label: string;
  value: string;
  hint: string;
  badge: React.ReactNode;
  tone: "teal" | "sky" | "amber";
  isDark: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3.5",
        isDark
          ? "border-white/10 bg-[#16181d]"
          : "border-border/80 bg-card shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "text-[11px] font-medium tracking-wide uppercase",
            isDark ? "text-zinc-500" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
        <span
          className={cn(
            "text-[11px]",
            isDark ? "text-zinc-400" : "text-muted-foreground",
          )}
        >
          {badge}
        </span>
      </div>
      <p
        className={cn(
          "mt-1.5 text-2xl font-semibold tracking-tight tabular-nums",
          tone === "teal" && (isDark ? "text-teal-300" : "text-primary"),
          tone === "sky" && (isDark ? "text-sky-300" : "text-sky"),
          tone === "amber" && (isDark ? "text-amber-300" : "text-signal"),
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "mt-1.5 text-xs leading-relaxed",
          isDark ? "text-zinc-500" : "text-muted-foreground",
        )}
      >
        {hint}
      </p>
    </div>
  );
}

function CatalogPanel() {
  const { linkedTables, setLinkedTables, setSchema, schema } =
    useConsoleStore();
  const selected = new Set(linkedTables);
  const [justApplied, setJustApplied] = useState(false);

  function syncSelection(next: string[], apply: boolean) {
    setLinkedTables(next);
    if (apply) {
      setSchema(next.length ? buildSchemaFromTables(next) : "");
      setJustApplied(true);
    } else {
      setJustApplied(false);
    }
  }

  function toggle(name: string) {
    const next = selected.has(name)
      ? linkedTables.filter((t) => t !== name)
      : [...linkedTables, name];
    // Selecting a table immediately updates linked set; keep schema in sync
    syncSelection(next, true);
  }

  function selectAll() {
    syncSelection(allCatalogTableNames(), true);
  }

  function clearAll() {
    syncSelection([], true);
  }

  function applyToSchema() {
    syncSelection(linkedTables, true);
  }

  const appliedHint =
    linkedTables.length > 0 &&
    linkedTables.every((t) => schema.includes(`${t}(`));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-primary/25 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">분석 스키마 연결</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            카드를 누르면 선택·스키마 반영이 함께 됩니다. Analyze 「표 구조」와
            Agent 컨텍스트에 바로 쓰입니다.
            {linkedTables.length
              ? ` · ${linkedTables.length}개 선택`
              : " · 아직 선택 없음"}
            {appliedHint || justApplied ? " · 스키마 반영됨" : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={selectAll}>
            전체
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={clearAll}>
            해제
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={applyToSchema}
            disabled={!linkedTables.length}
            className="gap-1.5"
          >
            <Link2 className="size-3.5" />
            스키마에 반영
          </Button>
          <Link
            href="/console/semantic?tab=analyze"
            className="inline-flex h-7 items-center rounded-lg border border-border bg-secondary px-2.5 text-[0.8rem] font-medium text-secondary-foreground transition hover:bg-secondary/80"
          >
            Analyze로
          </Link>
        </div>
      </div>

      {PHYSICAL_CATALOG.schemas.map((schemaNode) => (
        <div key={schemaNode.name}>
          <p className="mb-2 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            schema · {schemaNode.name}
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {schemaNode.tables.map((table) => {
              const on = selected.has(table.name);
              return (
                <button
                  key={table.name}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(table.name)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition outline-none",
                    on
                      ? "border-primary bg-primary/10 ring-2 ring-primary/35"
                      : "border-border bg-card hover:border-primary/40 hover:bg-mist/40",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded border",
                          on
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background",
                        )}
                      >
                        {on ? <Check className="size-3" /> : null}
                      </span>
                      <Table2 className="size-3.5 text-sky" />
                      {table.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {on ? (
                        <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                          선택됨
                        </span>
                      ) : null}
                      <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {table.role}
                      </span>
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                    {table.columns.join(", ")}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function OntologyPanel({
  mappings,
  isDark,
}: {
  mappings: ReturnType<typeof mappingsFromDraft>;
  isDark: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {INTENT_AXES.map((axis) => (
          <span
            key={axis.id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs",
              isDark
                ? "border-white/10 bg-white/[0.03] text-zinc-300"
                : "border-border/70 bg-secondary/40 text-foreground",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                axis.id === "time" && "bg-amber-400",
                axis.id === "identity" && "bg-sky-400",
                axis.id === "measure" && "bg-teal-500",
                axis.id === "population" && "bg-emerald-500",
              )}
            />
            {axis.label}
          </span>
        ))}
      </div>

      <div className="space-y-2.5">
        {mappings.map((m) => {
          const axis = AXIS_BY_ID[m.axis];
          return (
            <div
              key={m.id}
              className={cn(
                "rounded-lg border p-3",
                isDark ? "bg-black/20" : "bg-card",
                m.axis === "time" &&
                  (isDark ? "border-amber-500/30" : "border-amber/40"),
                m.axis === "identity" &&
                  (isDark ? "border-sky-500/30" : "border-sky/40"),
                m.axis === "measure" &&
                  (isDark ? "border-teal-500/30" : "border-primary/35"),
                m.axis === "population" &&
                  (isDark ? "border-emerald-500/30" : "border-ok/40"),
              )}
            >
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px]",
                    isDark
                      ? "bg-white/[0.06] text-zinc-200"
                      : "bg-secondary text-foreground",
                  )}
                >
                  {axis.label}
                </span>
                {m.locked ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[11px]",
                      isDark ? "text-emerald-400" : "text-ok",
                    )}
                  >
                    <Lock className="size-3" />
                    확정
                  </span>
                ) : (
                  <span
                    className={cn(
                      "text-[11px]",
                      isDark ? "text-zinc-500" : "text-muted-foreground",
                    )}
                  >
                    미확정
                  </span>
                )}
              </div>

              <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
                <LayerNode
                  isDark={isDark}
                  tone="intent"
                  title="의도"
                  body={m.intentConcept}
                />
                <Arrow isDark={isDark} />
                <LayerNode
                  isDark={isDark}
                  tone="glossary"
                  title="용어"
                  body={m.glossaryTerm}
                />
                <Arrow isDark={isDark} />
                <LayerNode
                  isDark={isDark}
                  tone="physical"
                  title="물리"
                  body={
                    m.physical.length ? m.physical.join(", ") : "연결 대기"
                  }
                />
              </div>

              <p
                className={cn(
                  "mt-2.5 text-xs leading-relaxed",
                  isDark ? "text-zinc-400" : "text-muted-foreground",
                )}
              >
                {m.chosen ? (
                  <>
                    <span className={isDark ? "text-zinc-200" : "text-foreground"}>
                      선택:{" "}
                    </span>
                    {m.chosen}
                  </>
                ) : (
                  m.condition
                )}
              </p>
              {m.exceptions.length ? (
                <p
                  className={cn(
                    "mt-1 text-[11px]",
                    isDark ? "text-amber-400/90" : "text-signal",
                  )}
                >
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
  isDark,
}: {
  metrics: ReturnType<typeof metricsFromSpec>;
  isDark: boolean;
}) {
  return (
    <ul className="grid gap-2.5 md:grid-cols-2">
      {metrics.map((metric) => (
        <li
          key={metric.id}
          className={cn(
            "rounded-lg border p-3.5",
            isDark
              ? "border-white/10 bg-black/20"
              : "border-border/70 bg-card",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-sm font-medium",
                isDark ? "text-zinc-100" : "text-ink",
              )}
            >
              {metric.name}
            </p>
            {metric.locked ? (
              <Lock
                className={cn(
                  "size-3.5 shrink-0",
                  isDark ? "text-emerald-400" : "text-ok",
                )}
              />
            ) : null}
          </div>
          <p
            className={cn(
              "mt-2 text-xs leading-relaxed",
              isDark ? "text-zinc-400" : "text-muted-foreground",
            )}
          >
            {metric.expression}
          </p>
          <p
            className={cn(
              "mt-2.5 font-mono text-[11px]",
              isDark ? "text-sky-400" : "text-sky",
            )}
          >
            grain · {metric.grain}
          </p>
          {metric.filters.length ? (
            <ul className="mt-2 space-y-1">
              {metric.filters.map((f) => (
                <li
                  key={f}
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px]",
                    isDark
                      ? "bg-white/[0.04] text-zinc-400"
                      : "bg-secondary/70 text-muted-foreground",
                  )}
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

function LineagePanel({ isDark }: { isDark: boolean }) {
  return (
    <div>
      <p
        className={cn(
          "mb-3 flex items-center gap-1.5 text-xs",
          isDark ? "text-zinc-500" : "text-muted-foreground",
        )}
      >
        <GitBranchPlus className="size-3.5" />
        엔터티 관계
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {ENTITY_GRAPH.map((edge) => (
          <div
            key={`${edge.from}-${edge.to}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs",
              isDark
                ? "border-white/10 bg-black/20"
                : "border-border/70 bg-card",
            )}
          >
            <span className={cn("font-medium", isDark ? "text-sky-400" : "text-sky")}>
              {edge.from}
            </span>
            <span className={isDark ? "text-zinc-500" : "text-muted-foreground"}>
              —{edge.label}→
            </span>
            <span
              className={cn(
                "font-medium",
                isDark ? "text-teal-400" : "text-primary",
              )}
            >
              {edge.to}
            </span>
            <span
              className={cn(
                "font-mono text-[10px]",
                isDark ? "text-zinc-600" : "text-muted-foreground",
              )}
            >
              {edge.on}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LayerNode({
  title,
  body,
  tone,
  isDark,
}: {
  title: string;
  body: string;
  tone: "intent" | "glossary" | "physical";
  isDark: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-2.5 py-2",
        tone === "intent" &&
          (isDark
            ? "border-teal-500/25 bg-teal-500/5"
            : "border-primary/25 bg-primary/5"),
        tone === "glossary" &&
          (isDark
            ? "border-sky-500/25 bg-sky-500/5"
            : "border-sky/30 bg-sky/5"),
        tone === "physical" &&
          (isDark
            ? "border-amber-500/25 bg-amber-500/5"
            : "border-amber/35 bg-amber/10"),
      )}
    >
      <p
        className={cn(
          "flex items-center gap-1 text-[10px] tracking-wide",
          isDark ? "text-zinc-500" : "text-muted-foreground",
        )}
      >
        {tone === "glossary" ? <Link2 className="size-3" /> : null}
        {title}
      </p>
      <p
        className={cn(
          "mt-0.5 text-sm font-medium leading-snug",
          isDark ? "text-zinc-100" : "text-foreground",
        )}
      >
        {body}
      </p>
    </div>
  );
}

function Arrow({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={cn(
        "hidden justify-center md:flex",
        isDark ? "text-zinc-600" : "text-muted-foreground",
      )}
    >
      →
    </div>
  );
}
