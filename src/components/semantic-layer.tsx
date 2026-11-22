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
import {
  ENTITY_GRAPH,
  PHYSICAL_CATALOG,
  allCatalogTableNames,
  buildSchemaFromTables,
  mappingsFromDraft,
  metricsFromSpec,
} from "@/lib/semantic-model";
import {
  ONTOLOGY_SECTIONS,
  buildOntologyActions,
  buildOntologyKnowledge,
  buildOntologyLinks,
  buildOntologyObjects,
  buildOntologyProperties,
  type OntologySection,
} from "@/lib/ontology-manager";
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
  const { linkedTables, glossary, intentLocked } = useConsoleStore();
  const mappings = mappingsFromDraft(draft, decisions);
  const metrics = metricsFromSpec(spec);
  const tableCount = PHYSICAL_CATALOG.schemas.reduce(
    (n, s) => n + s.tables.length,
    0,
  );
  const lockedMaps = mappings.filter((m) => m.locked).length;
  const mappedCols = mappings.reduce((n, m) => n + m.physical.length, 0);
  const lockedMetrics = metrics.filter((m) => m.locked).length;
  const objects = buildOntologyObjects(linkedTables, draft, spec);
  const properties = buildOntologyProperties(objects, draft, decisions);
  const links = buildOntologyLinks();
  const actions = buildOntologyActions(Boolean(spec) || intentLocked);
  const knowledge = buildOntologyKnowledge(draft, spec, glossary);

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
          label="온톨로지"
          value={`${objects.filter((o) => o.linked).length}`}
          hint={
            draft
              ? `대상 ${objects.filter((o) => o.linked).length} · 속성 ${properties.length} · 관계 ${links.length}`
              : "대상·속성·관계·규칙으로 뜻을 정리해요"
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
            <OntologyPanel
              isDark={isDark}
              objects={objects}
              properties={properties}
              links={links}
              actions={actions}
              knowledge={knowledge}
            />
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
      return "대상·속성·관계·할 일·규칙을 한곳에서 봐요";
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
  isDark,
  objects,
  properties,
  links,
  actions,
  knowledge,
}: {
  isDark: boolean;
  objects: ReturnType<typeof buildOntologyObjects>;
  properties: ReturnType<typeof buildOntologyProperties>;
  links: ReturnType<typeof buildOntologyLinks>;
  actions: ReturnType<typeof buildOntologyActions>;
  knowledge: ReturnType<typeof buildOntologyKnowledge>;
}) {
  const [section, setSection] = useState<OntologySection>("objects");
  const counts: Record<OntologySection, number> = {
    objects: objects.filter((o) => o.linked).length,
    properties: properties.length,
    links: links.length,
    actions: actions.length,
    knowledge: knowledge.length,
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-lg border px-3.5 py-3 text-sm leading-relaxed",
          isDark
            ? "border-white/10 bg-white/[0.03] text-zinc-300"
            : "border-border/70 bg-mist/50 text-foreground/85",
        )}
      >
        <p className="font-medium">온톨로지 매니저</p>
        <p
          className={cn(
            "mt-1 text-xs leading-relaxed",
            isDark ? "text-zinc-500" : "text-muted-foreground",
          )}
        >
          흩어진 표를 「대상 · 속성 · 관계 · 할 일 · 규칙」으로 정리하는
          화면이에요. Foundry Ontology Manager와 Enhans Ontology Manager의
          뼈대를 따랐고, 말은 쉽게 썼습니다.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <nav
          className={cn(
            "flex shrink-0 flex-row gap-1.5 overflow-x-auto lg:w-44 lg:flex-col",
          )}
        >
          {ONTOLOGY_SECTIONS.map((s) => {
            const on = section === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-left transition",
                  on
                    ? isDark
                      ? "border-teal-500/40 bg-teal-500/10 text-teal-200"
                      : "border-primary/40 bg-primary/10 text-foreground"
                    : isDark
                      ? "border-transparent bg-transparent text-zinc-400 hover:bg-white/[0.04]"
                      : "border-transparent text-muted-foreground hover:bg-secondary/60",
                )}
              >
                <span className="flex items-center justify-between gap-2 text-sm font-medium">
                  {s.label}
                  <span
                    className={cn(
                      "tabular-nums text-[11px]",
                      isDark ? "text-zinc-500" : "text-muted-foreground",
                    )}
                  >
                    {counts[s.id]}
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-[11px] leading-snug",
                    isDark ? "text-zinc-500" : "text-muted-foreground",
                  )}
                >
                  {s.blurb}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1 space-y-2.5">
          {section === "objects"
            ? objects
                .filter((o) => o.linked)
                .map((o) => (
                  <div
                    key={o.id}
                    className={cn(
                      "rounded-lg border p-3.5",
                      isDark
                        ? "border-white/10 bg-black/20"
                        : "border-border/70 bg-card",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          isDark ? "text-zinc-100" : "text-ink",
                        )}
                      >
                        {o.name}
                      </p>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[11px]",
                          o.status === "locked"
                            ? isDark
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-ok/10 text-ok"
                            : o.status === "mapped"
                              ? isDark
                                ? "bg-sky-500/15 text-sky-400"
                                : "bg-sky/10 text-sky"
                              : isDark
                                ? "bg-white/[0.06] text-zinc-400"
                                : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {o.status === "locked"
                          ? "확정"
                          : o.status === "mapped"
                            ? "초안"
                            : "연결됨"}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-xs leading-relaxed",
                        isDark ? "text-zinc-400" : "text-muted-foreground",
                      )}
                    >
                      {o.description}
                    </p>
                    <p
                      className={cn(
                        "mt-2 font-mono text-[11px]",
                        isDark ? "text-zinc-500" : "text-muted-foreground",
                      )}
                    >
                      {o.schema} · 키 {o.primaryKey} · 속성 {o.propertyCount}개 ·{" "}
                      {o.role}
                    </p>
                  </div>
                ))
            : null}

          {section === "properties"
            ? properties.slice(0, 40).map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "rounded-lg border p-3.5",
                    isDark
                      ? "border-white/10 bg-black/20"
                      : "border-border/70 bg-card",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isDark ? "text-zinc-100" : "text-ink",
                      )}
                    >
                      {p.name}
                    </p>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px]",
                        isDark
                          ? "bg-white/[0.06] text-zinc-400"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {p.objectName}
                    </span>
                    {p.kind !== "physical" ? (
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px]",
                          isDark
                            ? "bg-violet-500/15 text-violet-300"
                            : "bg-violet-100 text-violet-800",
                        )}
                      >
                        {p.kind === "intent" ? "의도 연결" : "파생"}
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      isDark ? "text-zinc-400" : "text-muted-foreground",
                    )}
                  >
                    {p.meaning}
                  </p>
                  <p
                    className={cn(
                      "mt-1.5 font-mono text-[11px]",
                      isDark ? "text-sky-400/80" : "text-sky",
                    )}
                  >
                    {p.sourceColumn}
                  </p>
                </div>
              ))
            : null}

          {section === "links"
            ? links.map((l) => (
                <div
                  key={l.id}
                  className={cn(
                    "flex flex-wrap items-center gap-2 rounded-lg border px-3.5 py-3 text-sm",
                    isDark
                      ? "border-white/10 bg-black/20"
                      : "border-border/70 bg-card",
                  )}
                >
                  <span
                    className={cn(
                      "font-semibold",
                      isDark ? "text-sky-400" : "text-sky",
                    )}
                  >
                    {l.from}
                  </span>
                  <span
                    className={isDark ? "text-zinc-500" : "text-muted-foreground"}
                  >
                    —{l.label}→
                  </span>
                  <span
                    className={cn(
                      "font-semibold",
                      isDark ? "text-teal-400" : "text-primary",
                    )}
                  >
                    {l.to}
                  </span>
                  <span
                    className={cn(
                      "w-full font-mono text-[11px] sm:ml-auto sm:w-auto",
                      isDark ? "text-zinc-500" : "text-muted-foreground",
                    )}
                  >
                    연결 키 · {l.on}
                  </span>
                </div>
              ))
            : null}

          {section === "actions"
            ? actions.map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    "rounded-lg border p-3.5",
                    isDark
                      ? "border-white/10 bg-black/20"
                      : "border-border/70 bg-card",
                    !a.available && "opacity-55",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isDark ? "text-zinc-100" : "text-ink",
                      )}
                    >
                      {a.name}
                    </p>
                    <span
                      className={cn(
                        "text-[11px]",
                        a.available
                          ? isDark
                            ? "text-emerald-400"
                            : "text-ok"
                          : isDark
                            ? "text-zinc-500"
                            : "text-muted-foreground",
                      )}
                    >
                      {a.available
                        ? "사용 가능"
                        : a.requiresLock
                          ? "확정 후 가능"
                          : "준비 중"}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-xs leading-relaxed",
                      isDark ? "text-zinc-400" : "text-muted-foreground",
                    )}
                  >
                    {a.description}
                  </p>
                </div>
              ))
            : null}

          {section === "knowledge"
            ? knowledge.map((k) => (
                <div
                  key={k.id}
                  className={cn(
                    "rounded-lg border p-3.5",
                    isDark
                      ? "border-white/10 bg-black/20"
                      : "border-border/70 bg-card",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-medium",
                        isDark
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-amber-100 text-amber-900",
                      )}
                    >
                      {k.kind === "glossary"
                        ? "용어"
                        : k.kind === "constraint"
                          ? "제약"
                          : k.kind === "exclusion"
                            ? "제외"
                            : "규칙"}
                    </span>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isDark ? "text-zinc-100" : "text-ink",
                      )}
                    >
                      {k.title}
                    </p>
                    {k.locked ? (
                      <Lock
                        className={cn(
                          "size-3.5",
                          isDark ? "text-emerald-400" : "text-ok",
                        )}
                      />
                    ) : null}
                  </div>
                  <p
                    className={cn(
                      "mt-1.5 text-xs leading-relaxed whitespace-pre-wrap",
                      isDark ? "text-zinc-400" : "text-muted-foreground",
                    )}
                  >
                    {k.body}
                  </p>
                </div>
              ))
            : null}

          {section === "objects" &&
          objects.filter((o) => o.linked).length === 0 ? (
            <p
              className={cn(
                "rounded-lg border border-dashed px-4 py-8 text-center text-sm",
                isDark
                  ? "border-white/10 text-zinc-500"
                  : "border-border text-muted-foreground",
              )}
            >
              Catalog에서 테이블을 고르면 대상이 여기에 나타납니다.
            </p>
          ) : null}
        </div>
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

