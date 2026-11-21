"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  Loader2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { KIND_LABEL } from "@/lib/intent-axes";
import { SAMPLE_PROJECT } from "@/lib/sample-project";
import type {
  AnalysisDraft,
  ResearcherDecision,
} from "@/lib/types";
import Link from "next/link";
import { useConsoleStore } from "@/lib/console-store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const STATUS_LABEL = {
  pass: "문제 없음",
  fail: "불일치",
  needs_review: "재확인",
} as const;

const SEVERITY_LABEL = {
  blocker: "필수",
  warning: "주의",
  info: "참고",
} as const;

type Step = "input" | "confirm" | "spec" | "audit";

const STEPS: { id: Step; label: string }[] = [
  { id: "input", label: "1 질문" },
  { id: "confirm", label: "2 기준 확인" },
  { id: "spec", label: "3 SQL" },
  { id: "audit", label: "4 결과 점검" },
];

type WorkspaceProps = {
  /** Console embed: denser chrome, no marketing headline. */
  variant?: "landing" | "console";
};

export function Workspace({ variant = "landing" }: WorkspaceProps) {
  const store = useConsoleStore();
  const {
    researchQuestion,
    glossary,
    schema,
    resultCsv,
    draft,
    scholar,
    decisions,
    spec,
    report,
    hydrated,
    linkedTables,
    setResearchQuestion,
    setGlossary,
    setSchema,
    setResultCsv,
    setDraft,
    setScholar,
    setDecisions,
    setSpec,
    setReport,
    setLinkedTables,
    patch,
  } = store;
  const isConsole = variant === "console";

  const [step, setStep] = useState<Step>("input");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showNaive, setShowNaive] = useState(true);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    if (!hydrated || bootstrapped) return;
    if (!researchQuestion.trim()) {
      patch({
        researchQuestion: SAMPLE_PROJECT.researchQuestion,
        glossary: SAMPLE_PROJECT.glossary,
        schema: SAMPLE_PROJECT.schema,
        resultCsv: SAMPLE_PROJECT.resultRowsCsv,
      });
    }
    if (report) setStep("audit");
    else if (spec) setStep("spec");
    else if (draft) setStep("confirm");
    setBootstrapped(true);
  }, [hydrated, bootstrapped, researchQuestion, draft, spec, report, patch]);

  const allAmbiguitiesDecided = useMemo(() => {
    if (!draft) return false;
    return draft.ambiguities.every((a) => decisions[a.id]?.chosenOption);
  }, [draft, decisions]);

  function loadSample() {
    setResearchQuestion(SAMPLE_PROJECT.researchQuestion);
    setGlossary(SAMPLE_PROJECT.glossary);
    setSchema(SAMPLE_PROJECT.schema);
    setResultCsv(SAMPLE_PROJECT.resultRowsCsv);
    setLinkedTables(["products", "lots", "tests", "dispositions"]);
    setNotice("로트 실패율 예시를 넣었습니다. Catalog에 네 테이블이 연결됩니다.");
  }

  function chooseOption(ambiguityId: string, chosenOption: string) {
    setDecisions((prev) => ({
      ...prev,
      [ambiguityId]: {
        ambiguityId,
        chosenOption,
        note: prev[ambiguityId]?.note,
      },
    }));
  }

  function setNote(ambiguityId: string, note: string) {
    setDecisions((prev) => ({
      ...prev,
      [ambiguityId]: {
        ambiguityId,
        chosenOption: prev[ambiguityId]?.chosenOption ?? "",
        note,
      },
    }));
  }

  function runAnalyze() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          researchQuestion,
          glossary,
          schema,
          includeScholar: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "분석을 끝내지 못했습니다.");
        return;
      }
      setDraft(json.draft);
      setScholar(json.scholar ?? []);
      setNotice(json.notice ?? null);
      const seeded: Record<string, ResearcherDecision> = {};
      for (const a of json.draft.ambiguities as AnalysisDraft["ambiguities"]) {
        if (a.recommended) {
          seeded[a.id] = {
            ambiguityId: a.id,
            chosenOption: a.recommended,
          };
        }
      }
      setDecisions(seeded);
      setStep("confirm");
      setNotice(
        (json.notice ? json.notice + " · " : "") +
          (isConsole
            ? "Ontology 탭에서 매핑을 확인하세요."
            : "시맨틱 콘솔 Ontology에서 매핑을 확인할 수 있습니다."),
      );
    });
  }

  function runConfirm() {
    if (!draft || !allAmbiguitiesDecided) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          researchQuestion,
          glossary,
          schema,
          draft,
          decisions: Object.values(decisions),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "기준과 SQL을 만들지 못했습니다.");
        return;
      }
      setSpec(json.spec);
      setNotice(json.notice ?? null);
      setStep("spec");
    });
  }

  function runAudit() {
    if (!spec) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spec,
          resultRowsCsv: resultCsv,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "결과를 다시 보지 못했습니다.");
        return;
      }
      setReport(json.report);
      setNotice(json.notice ?? null);
      setStep("audit");
    });
  }

  return (
    <section className={cn(isConsole && "space-y-0")}>
      {isConsole ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-normal">
              {linkedTables.length
                ? `연결 테이블 ${linkedTables.length}`
                : "테이블 미연결"}
            </Badge>
            <Link
              href="/console/semantic?tab=catalog"
              className="text-xs font-medium text-primary hover:underline"
            >
              Catalog에서 연결
            </Link>
          </div>
          <Link
            href="/console/semantic?tab=ontology"
            className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-2.5 text-xs font-medium shadow-sm hover:bg-accent/40"
          >
            Ontology 보기
          </Link>
        </div>
      ) : (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">이 페이지에서 분석하기</p>
            <h2 className="font-display text-3xl text-ink sm:text-4xl">
              질문을 적은 뒤, 헷갈리는 기준부터 정리하세요
            </h2>
          </div>
          <Link
            href="/console/semantic?tab=analyze"
            className="inline-flex h-9 items-center rounded-xl border border-border bg-card px-3 text-sm font-medium shadow-sm hover:bg-accent/40"
          >
            시맨틱 콘솔 열기
          </Link>
        </div>
      )}

      <ol className={cn("mb-6 flex flex-wrap gap-1.5", !isConsole && "mb-8 gap-2")}>
        {STEPS.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => {
                if (s.id === "input") setStep("input");
                if (s.id === "confirm" && draft) setStep("confirm");
                if (s.id === "spec" && spec) setStep("spec");
                if (s.id === "audit" && report) setStep("audit");
              }}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs transition sm:text-sm",
                step === s.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/80 bg-card/60 text-muted-foreground hover:border-primary/40",
              )}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ol>

      {notice ? (
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <Sparkles className="size-4" />
          <AlertTitle>안내</AlertTitle>
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="size-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {step === "input" ? (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="secondary" onClick={loadSample}>
                예시 불러오기
              </Button>
              <Badge variant="outline" className="font-normal">
                가상 데이터만 사용합니다
              </Badge>
            </div>

            <Field
              label="하고 싶은 질문"
              value={researchQuestion}
              onChange={setResearchQuestion}
              rows={7}
            />
            <Field
              label="용어 정의"
              value={glossary}
              onChange={setGlossary}
              rows={10}
              mono
            />
            <Field
              label="표 구조"
              value={schema}
              onChange={setSchema}
              rows={10}
              mono
            />

            <Button
              type="button"
              size="lg"
              onClick={runAnalyze}
              disabled={pending}
              className="gap-2"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileSearch className="size-4" />
              )}
              헷갈리는 기준 찾기
              <ArrowRight className="size-4" />
            </Button>
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-border/70 bg-ink text-primary-foreground p-6">
              <p className="text-xs tracking-wide text-white/60">
                이런 일이 자주 있습니다
              </p>
              <h3 className="mt-2 font-display text-2xl text-white">
                쿼리는 됐는데 답이 이상할 때
              </h3>
              <dl className="mt-5 space-y-4 text-sm text-white/85">
                <div>
                  <dt className="text-white/50">누구</dt>
                  <dd>{SAMPLE_PROJECT.drama.who}</dd>
                </div>
                <div>
                  <dt className="text-white/50">언제</dt>
                  <dd>{SAMPLE_PROJECT.drama.when}</dd>
                </div>
                <div>
                  <dt className="text-white/50">왜 답답한가</dt>
                  <dd>{SAMPLE_PROJECT.drama.pain}</dd>
                </div>
                <div>
                  <dt className="text-white/50">얼마나 걸리냐면</dt>
                  <dd>{SAMPLE_PROJECT.drama.cost}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-border/70 bg-card/70 p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="font-display text-xl">겉보기엔 정상인 SQL</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowNaive((v) => !v)}
                >
                  {showNaive ? "접기" : "펼치기"}
                </Button>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                AI가 자주 짜 주는 쿼리입니다. 실행은 되지만 기준이 다릅니다.
              </p>
              {showNaive ? (
                <pre className="overflow-x-auto rounded-lg bg-ink p-4 font-mono text-[11px] leading-relaxed text-emerald-100/90">
                  {SAMPLE_PROJECT.naiveSql}
                </pre>
              ) : null}
              <ul className="mt-4 space-y-2">
                {SAMPLE_PROJECT.knownTraps.map((t) => (
                  <li
                    key={t.id}
                    className="flex gap-2 text-sm text-foreground/90"
                  >
                    <ShieldAlert className="mt-0.5 size-4 shrink-0 text-signal" />
                    <span>
                      <strong className="font-medium">{t.title}</strong> — {t.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      ) : null}

      {step === "confirm" && draft ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-border/70 bg-card/80 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{draft.mode === "live" ? "Liner Model" : "Demo"}</Badge>
              <Badge variant="outline">확인할 점 {draft.ambiguities.length}개</Badge>
            </div>
            <p className="mt-3 text-base leading-relaxed">{draft.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {draft.concepts.map((c) => (
              <div
                key={`${c.concept}-${c.glossaryTerm}`}
                className="rounded-xl border border-border/70 bg-card/60 p-4"
              >
                <h3 className="font-display text-lg">{c.concept}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {c.glossaryTerm} · {c.columns.join(", ")}
                </p>
                <p className="mt-2 text-sm">{c.condition}</p>
                {c.exceptions.length ? (
                  <p className="mt-2 text-xs text-signal">
                    빼야 할 것: {c.exceptions.join(", ")}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-display text-2xl">기준을 정해 주세요</h3>
            {draft.ambiguities.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-border/80 bg-card/80 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Badge variant="outline" className="mb-2 font-normal">
                      {KIND_LABEL[a.kind] ?? a.kind}
                    </Badge>
                    <h4 className="text-lg font-medium">{a.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {a.whyItMatters}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  {a.options.map((opt) => {
                    const selected = decisions[a.id]?.chosenOption === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => chooseOption(a.id, opt)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-left text-sm transition",
                          selected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border/70 bg-background/50 hover:border-primary/40",
                        )}
                      >
                        <span className="inline-flex items-center gap-2">
                          {selected ? (
                            <CheckCircle2 className="size-4 text-primary" />
                          ) : (
                            <span className="size-4 rounded-full border border-border" />
                          )}
                          {opt}
                          {a.recommended === opt ? (
                            <Badge className="ml-1" variant="secondary">
                              추천
                            </Badge>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <Label htmlFor={`note-${a.id}`} className="text-xs text-muted-foreground">
                    메모 (선택 사항)
                  </Label>
                  <Textarea
                    id={`note-${a.id}`}
                    className="mt-1"
                    rows={2}
                    value={decisions[a.id]?.note ?? ""}
                    onChange={(e) => setNote(a.id, e.target.value)}
                    placeholder="왜 이렇게 골랐는지 적어 두세요"
                  />
                </div>
                {a.evidence?.length ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                    {a.evidence.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>

          {scholar.length ? (
            <div className="rounded-xl border border-border/70 bg-card/70 p-5">
              <h3 className="font-display text-xl">Liner Scholar로 찾은 글</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                헷갈리는 기준을 논문·자료로 같이 살펴봅니다.
              </p>
              <ul className="mt-4 space-y-3">
                {scholar.map((h) => (
                  <li key={h.url} className="text-sm">
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                      {h.title}
                    </a>
                    <p className="text-muted-foreground">{h.description}</p>
                    <p className="text-xs text-muted-foreground/80">
                      {[h.journal, h.date, h.citationCount != null ? `cited ${h.citationCount}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Button
            type="button"
            size="lg"
            onClick={runConfirm}
            disabled={pending || !allAmbiguitiesDecided}
            className="gap-2"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ClipboardCheck className="size-4" />
            )}
            정한 기준으로 SQL 만들기
          </Button>
        </div>
      ) : null}

      {step === "spec" && spec ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-border/70 bg-card/80 p-6">
            <div className="flex flex-wrap gap-2">
              <Badge>{spec.mode === "live" ? "Liner로 작성" : "예시로 작성"}</Badge>
              <Badge variant="outline">확인 항목 {spec.checks.length}개</Badge>
            </div>
            <h3 className="mt-3 font-display text-3xl">{spec.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{spec.researchQuestion}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SpecBlock label="누구를 보나" value={spec.population} />
              <SpecBlock label="기간은" value={spec.dateAnchor} />
              <SpecBlock label="같은 걸로 묶는 기준" value={spec.identifierScope} />
              <SpecBlock
                label="빼는 것"
                value={spec.exclusions.join(", ") || "없음"}
              />
            </div>
            <div className="mt-4">
              <p className="text-xs tracking-wide text-muted-foreground">
                무엇을 세나
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {spec.measures.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-ink p-4">
              <h4 className="mb-2 text-sm text-white/70">만든 SQL</h4>
              <pre className="max-h-[420px] overflow-auto font-mono text-[11px] leading-relaxed text-emerald-100/90">
                {spec.sql}
              </pre>
            </div>
            <div className="rounded-xl border border-border/70 bg-card/80 p-4">
              <h4 className="mb-3 font-display text-xl">나중에 볼 것</h4>
              <ul className="space-y-3">
                {spec.checks.map((c) => (
                  <li key={c.id} className="border-b border-border/50 pb-3 last:border-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          c.severity === "blocker"
                            ? "destructive"
                            : c.severity === "warning"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {SEVERITY_LABEL[c.severity] ?? c.severity}
                      </Badge>
                      <span className="font-medium">{c.name}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/70 p-5">
            <h4 className="font-display text-xl">결과표 (CSV)</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              예제에는 기준과 다른 값이 들어 있습니다. 실제 결과로 바꿔도 됩니다.
            </p>
            <Textarea
              className="mt-3 font-mono text-xs"
              rows={8}
              value={resultCsv}
              onChange={(e) => setResultCsv(e.target.value)}
            />
            <Button
              type="button"
              size="lg"
              className="mt-4 gap-2"
              onClick={runAudit}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldAlert className="size-4" />
              )}
              결과와 기준이 맞는지 보기
            </Button>
          </div>
        </div>
      ) : null}

      {step === "audit" && report ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-xl border border-signal/30 bg-signal/10 p-6">
              <p className="text-xs tracking-wide text-signal">
                불일치 점수
              </p>
              <p className="drift-pulse mt-2 font-display text-6xl text-signal">
                {report.intentDriftScore}
              </p>
              <p className="mt-2 text-sm text-foreground/80">{report.summary}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card/80 p-6">
              <h3 className="font-display text-2xl">다음에 하면 좋은 일</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                {report.nextActions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            {report.findings.map((f) => (
              <div
                key={f.id}
                className={cn(
                  "rounded-xl border p-4",
                  f.status === "fail"
                    ? "border-destructive/40 bg-destructive/5"
                    : f.status === "needs_review"
                      ? "border-signal/30 bg-signal/5"
                      : "border-ok/30 bg-ok/5",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      f.status === "fail"
                        ? "destructive"
                        : f.status === "pass"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {STATUS_LABEL[f.status] ?? f.status}
                  </Badge>
                  <h4 className="font-medium">{f.title}</h4>
                </div>
                <p className="mt-2 text-sm">{f.detail}</p>
                {f.evidenceRows?.length ? (
                  <pre className="mt-3 overflow-x-auto rounded-md bg-ink p-3 font-mono text-[11px] text-emerald-100/90">
                    {f.evidenceRows.join("\n")}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => setStep("input")}>
              다른 질문 쓰기
            </Button>
            <Button type="button" variant="outline" onClick={() => setStep("spec")}>
              SQL 단계로
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  rows,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
  mono?: boolean;
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={cn(mono && "font-mono text-xs leading-relaxed")}
      />
    </div>
  );
}

function SpecBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
