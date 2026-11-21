"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  FileSearch,
  Loader2,
  Lock,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { undecidedCount } from "@/lib/intent-lock";
import {
  ANALYSIS_SCENARIOS,
  getScenario,
  type AnalysisScenarioId,
} from "@/lib/analysis-scenarios";
import { useConsoleStore } from "@/lib/console-store";
import {
  IntentAxisMap,
  IntentChoicePanel,
} from "@/components/intent-interview";
import { IntentLockCard } from "@/components/intent-lock-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
type EntryMode = "verify" | "fresh";

const STEPS: { id: Step; label: string; gate?: boolean }[] = [
  { id: "input", label: "1 입력" },
  { id: "confirm", label: "2 기준 잠금", gate: true },
  { id: "spec", label: "3 반출 명세" },
  { id: "audit", label: "4 반출 전 점검" },
];

type WorkspaceProps = {
  variant?: "landing" | "console";
  /** Analyze case: payroll | vat | quality */
  scenarioId?: AnalysisScenarioId | string | null;
};

export function Workspace({
  variant = "landing",
  scenarioId,
}: WorkspaceProps) {
  const store = useConsoleStore();
  const {
    researchQuestion,
    glossary,
    schema,
    resultCsv,
    candidateSql,
    draft,
    scholar,
    decisions,
    spec,
    report,
    hydrated,
    intentLocked,
    lockedAt,
    setResearchQuestion,
    setGlossary,
    setSchema,
    setResultCsv,
    setCandidateSql,
    setDraft,
    setScholar,
    setDecisions,
    setSpec,
    setReport,
    setLinkedTables,
    setIntentLocked,
    patch,
  } = store;
  const isConsole = variant === "console";

  const [step, setStep] = useState<Step>("input");
  const [mode, setMode] = useState<EntryMode>("verify");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [bootstrapped, setBootstrapped] = useState(false);
  /** Interview cursor: ask one ambiguity at a time */
  const [focusIdx, setFocusIdx] = useState(0);
  const [activeCase, setActiveCase] = useState<AnalysisScenarioId>(
    () => getScenario(scenarioId).id,
  );

  useEffect(() => {
    setActiveCase(getScenario(scenarioId).id);
  }, [scenarioId]);

  useEffect(() => {
    if (!hydrated || bootstrapped) return;
    const scenario = getScenario(activeCase);
    const forceCase = Boolean(scenarioId);
    if (forceCase || !researchQuestion.trim()) {
      patch({
        researchQuestion: scenario.researchQuestion,
        glossary: scenario.glossary,
        schema: scenario.schema,
        resultCsv: scenario.resultRowsCsv,
        candidateSql: scenario.naiveSql,
        linkedTables: scenario.linkedTables,
        draft: null,
        decisions: {},
        spec: null,
        report: null,
        intentLocked: false,
        lockedAt: null,
      });
    }
    if (!forceCase) {
      if (report && intentLocked) setStep("audit");
      else if (spec && intentLocked) setStep("spec");
      else if (draft) setStep("confirm");
    }
    setBootstrapped(true);
  }, [
    hydrated,
    bootstrapped,
    researchQuestion,
    draft,
    spec,
    report,
    intentLocked,
    patch,
    activeCase,
    scenarioId,
  ]);

  const openCount = useMemo(
    () => undecidedCount(draft, decisions),
    [draft, decisions],
  );
  const allAmbiguitiesDecided = Boolean(draft) && openCount === 0;

  const orderedAmbiguities = draft?.ambiguities ?? [];

  useEffect(() => {
    if (!draft) return;
    const firstOpen = draft.ambiguities.findIndex(
      (a) => !decisions[a.id]?.chosenOption,
    );
    if (firstOpen >= 0) setFocusIdx(firstOpen);
  }, [draft, decisions]);

  function loadScenario(id: AnalysisScenarioId) {
    const scenario = getScenario(id);
    setActiveCase(scenario.id);
    setResearchQuestion(scenario.researchQuestion);
    setGlossary(scenario.glossary);
    setSchema(scenario.schema);
    setResultCsv(scenario.resultRowsCsv);
    setCandidateSql(scenario.naiveSql);
    setLinkedTables(scenario.linkedTables);
    setDraft(null);
    setSpec(null);
    setReport(null);
    setDecisions({});
    setIntentLocked(false);
    setMode("verify");
    setStep("input");
    setNotice(
      `${scenario.label} 예제를 넣었습니다. 기준을 확정하기 전에는 반출할 수 없습니다.`,
    );
  }

  function loadSample() {
    loadScenario(activeCase);
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
    // Advance interview to next unanswered
    if (draft) {
      const next = draft.ambiguities.findIndex(
        (a, i) => i > focusIdx && !decisions[a.id]?.chosenOption && a.id !== ambiguityId,
      );
      const fallback = draft.ambiguities.findIndex(
        (a) => a.id !== ambiguityId && !decisions[a.id]?.chosenOption,
      );
      const idx = next >= 0 ? next : fallback;
      if (idx >= 0) setFocusIdx(idx);
    }
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
        setError(json.error ?? "기준을 찾지 못했습니다.");
        return;
      }
      // Do NOT auto-pick recommendations — person must choose
      setDraft(json.draft);
      setScholar(json.scholar ?? []);
      setDecisions({});
      setSpec(null);
      setReport(null);
      setIntentLocked(false);
      setFocusIdx(0);
      setStep("confirm");
      setNotice(
        (json.notice ? json.notice + " · " : "") +
          "헷갈리는 기준을 하나씩 고르세요. 잠그기 전에는 SQL을 반출하지 않습니다.",
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
        setError(json.error ?? "의도를 잠그지 못했습니다.");
        return;
      }
      const when = new Date().toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
      });
      setSpec(json.spec);
      setIntentLocked(true, `${when} (Asia/Seoul)`);
      setNotice(
        (json.notice ? json.notice + " · " : "") +
          "의도가 잠겼습니다. 잠금 카드와 함께 SQL·결과를 공유하세요.",
      );
      setStep("spec");
    });
  }

  function runAudit() {
    if (!spec || !intentLocked) return;
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
        setError(json.error ?? "결과를 점검하지 못했습니다.");
        return;
      }
      setReport(json.report);
      setNotice(json.notice ?? null);
      setStep("audit");
    });
  }

  function goStep(next: Step) {
    if (next === "input") {
      setStep("input");
      return;
    }
    if (next === "confirm" && draft) {
      setStep("confirm");
      return;
    }
    if (next === "spec") {
      if (!intentLocked || !spec) {
        setError("의도를 잠가야 반출 명세·SQL을 볼 수 있습니다.");
        setStep(draft ? "confirm" : "input");
        return;
      }
      setStep("spec");
      return;
    }
    if (next === "audit") {
      if (!intentLocked || !report) {
        if (intentLocked && spec) setStep("spec");
        else setError("잠금 후 결과 점검을 먼저 실행하세요.");
        return;
      }
      setStep("audit");
    }
  }

  return (
    <section className={cn(isConsole && "space-y-0")}>
      {/* Gate status strip */}
      <div
        className={cn(
          "mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm",
          intentLocked
            ? "border-ok/35 bg-ok/5"
            : "border-signal/35 bg-signal/5",
        )}
      >
        <div className="flex items-center gap-2">
          <Lock
            className={cn(
              "size-4",
              intentLocked ? "text-ok" : "text-signal",
            )}
          />
          <span className="font-medium text-foreground">
            {intentLocked
              ? "의도 잠금 · SQL·숫자 반출 가능"
              : "의도 미잠금 · SQL·숫자 반출 불가"}
          </span>
          {draft && !intentLocked ? (
            <span className="text-xs text-muted-foreground">
              남은 선택 {openCount}개
            </span>
          ) : null}
        </div>
        <span className="text-xs text-muted-foreground">
          선택지로 기준을 구체화한 뒤에만 반출합니다
        </span>
      </div>

      {!isConsole ? (
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">의도 게이트</p>
          <h2 className="font-display text-3xl text-ink sm:text-4xl">
            애매한 기준을 고르게 한 뒤, 잠그고 내보냅니다
          </h2>
        </div>
      ) : null}

      {/* Entry mode */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("verify")}
          className={cn(
            "rounded-md border px-3 py-1.5 text-xs sm:text-sm",
            mode === "verify"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          이미 나온 쿼리·결과 검증
        </button>
        <button
          type="button"
          onClick={() => setMode("fresh")}
          className={cn(
            "rounded-md border px-3 py-1.5 text-xs sm:text-sm",
            mode === "fresh"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          새 질문에서 시작
        </button>
      </div>

      <ol className="mb-6 flex flex-wrap gap-1.5">
        {STEPS.map((s) => {
          const blocked =
            (s.id === "spec" || s.id === "audit") && !intentLocked;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => goStep(s.id)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs transition sm:text-sm",
                  step === s.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : blocked
                      ? "border-border/50 bg-muted/40 text-muted-foreground/70"
                      : "border-border/80 bg-card/60 text-muted-foreground hover:border-primary/40",
                )}
              >
                {s.label}
                {s.gate && !intentLocked ? " 🔒" : null}
              </button>
            </li>
          );
        })}
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
          <AlertTitle>막힘</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {step === "input" ? (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap gap-2">
                {ANALYSIS_SCENARIOS.map((s) => (
                  <Button
                    key={s.id}
                    type="button"
                    variant={activeCase === s.id ? "default" : "secondary"}
                    size="sm"
                    onClick={() => loadScenario(s.id)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
              <Badge variant="outline" className="font-normal">
                가상 데이터 · 추천 자동선택 없음
              </Badge>
            </div>

            <Field
              label="하고 싶은 질문 / 검증할 분석 의도"
              value={researchQuestion}
              onChange={setResearchQuestion}
              rows={6}
            />
            <Field
              label="용어 정의"
              value={glossary}
              onChange={setGlossary}
              rows={8}
              mono
            />
            <Field
              label="표 구조"
              value={schema}
              onChange={setSchema}
              rows={8}
              mono
            />

            {mode === "verify" ? (
              <>
                <Field
                  label="의심되는 SQL (이미 돌아간 쿼리)"
                  value={candidateSql}
                  onChange={setCandidateSql}
                  rows={8}
                  mono
                />
                <Field
                  label="결과 CSV (반출 직전 표)"
                  value={resultCsv}
                  onChange={setResultCsv}
                  rows={6}
                  mono
                />
              </>
            ) : null}

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

          <aside className="space-y-4">
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                게이트 규칙
              </p>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                <li>1. 애매한 축만 선택지로 묻습니다.</li>
                <li>2. 추천은 보이되, 자동으로 고르지 않습니다.</li>
                <li>3. 전부 고르고 「의도 잠금」해야 SQL이 나갑니다.</li>
                <li>4. 기준을 바꾸면 잠금·SQL·점검이 무효가 됩니다.</li>
              </ul>
            </div>
            {mode === "verify" && candidateSql ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm font-medium text-foreground">
                  반출 직전 쿼리 (잠금 전 신뢰 금지)
                </p>
                <pre className="mt-2 max-h-48 overflow-auto font-mono text-[11px] text-muted-foreground">
                  {candidateSql.slice(0, 900)}
                  {candidateSql.length > 900 ? "…" : ""}
                </pre>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}

      {step === "confirm" && draft ? (
        <div className="space-y-5">
          <IntentLockCard
            researchQuestion={researchQuestion}
            draft={draft}
            decisions={decisions}
            spec={spec}
            locked={intentLocked}
            lockedAt={lockedAt}
          />

          <div className="rounded-lg border border-violet-300 bg-violet-50 p-4 dark:border-violet-500/40 dark:bg-violet-500/10">
            <p className="text-sm font-medium text-foreground">{draft.summary}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              아래 색 카드를 보고 A/B/C만 고르면 됩니다. 추천은 보이기만 하고 자동
              선택은 하지 않습니다.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <IntentAxisMap
              ambiguities={orderedAmbiguities}
              decisions={decisions}
              focusIdx={focusIdx}
              onFocus={setFocusIdx}
            />
            <IntentChoicePanel
              ambiguities={orderedAmbiguities}
              decisions={decisions}
              focusIdx={focusIdx}
              onFocus={setFocusIdx}
              onChoose={chooseOption}
              onNote={setNote}
            />
          </div>

          {scholar.length ? (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium">참고 자료 (Scholar)</p>
              <ul className="mt-2 space-y-2 text-sm">
                {scholar.slice(0, 3).map((h) => (
                  <li key={h.url}>
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {h.title}
                    </a>
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
            {allAmbiguitiesDecided
              ? "의도 잠금 · SQL 만들기"
              : `아직 ${openCount}개 · 색 카드에서 골라 주세요`}
          </Button>
        </div>
      ) : null}

      {step === "spec" && spec && intentLocked ? (
        <div className="space-y-5">
          {draft ? (
            <IntentLockCard
              researchQuestion={researchQuestion}
              draft={draft}
              decisions={decisions}
              spec={spec}
              locked={intentLocked}
              lockedAt={lockedAt}
            />
          ) : null}

          <div className="rounded-lg border border-ok/30 bg-ok/5 px-3 py-2 text-sm text-foreground">
            이 SQL은 잠긴 기준에서만 나왔습니다. 카드 없이 숫자만 공유하지 마세요.
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex flex-wrap gap-2">
              <Badge>{spec.mode === "live" ? "Liner" : "Demo"}</Badge>
              <Badge variant="outline" className="border-ok/40 text-ok">
                잠금 반영
              </Badge>
            </div>
            <h3 className="mt-3 text-xl font-semibold">{spec.title}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
              <SpecBlock label="기간" value={spec.dateAnchor} />
              <SpecBlock label="식별" value={spec.identifierScope} />
              <SpecBlock label="대상" value={spec.population} />
              <SpecBlock
                label="제외"
                value={spec.exclusions.join(", ") || "없음"}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted p-4">
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                잠금 기준 SQL
              </h4>
              <pre className="max-h-[360px] overflow-auto font-mono text-[11px] text-foreground">
                {spec.sql}
              </pre>
            </div>
            {candidateSql ? (
              <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-4">
                <h4 className="mb-2 text-sm font-medium text-foreground">
                  잠금 전 의심 SQL (비교)
                </h4>
                <pre className="max-h-[360px] overflow-auto font-mono text-[11px] text-muted-foreground">
                  {candidateSql}
                </pre>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-4">
                <h4 className="mb-3 text-sm font-medium">점검 항목</h4>
                <ul className="space-y-2 text-sm">
                  {spec.checks.map((c) => (
                    <li key={c.id}>
                      <Badge variant="outline" className="mr-2">
                        {SEVERITY_LABEL[c.severity]}
                      </Badge>
                      {c.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h4 className="font-medium">결과 CSV · 반출 전 점검</h4>
            <Textarea
              className="mt-3 font-mono text-xs"
              rows={7}
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
              잠금 기준과 결과가 맞는지 보기
            </Button>
          </div>
        </div>
      ) : null}

      {step === "spec" && !intentLocked ? (
        <div className="rounded-lg border border-signal/40 bg-signal/5 p-5">
          <p className="font-medium text-foreground">반출 차단</p>
          <p className="mt-1 text-sm text-muted-foreground">
            의도가 잠기지 않아 SQL·명세를 보여 주지 않습니다. 기준 잠금 단계로
            돌아가세요.
          </p>
          <Button
            type="button"
            className="mt-3"
            onClick={() => setStep(draft ? "confirm" : "input")}
          >
            기준 잠금으로
          </Button>
        </div>
      ) : null}

      {step === "audit" && report && intentLocked ? (
        <div className="space-y-5">
          {draft ? (
            <IntentLockCard
              researchQuestion={researchQuestion}
              draft={draft}
              decisions={decisions}
              spec={spec}
              locked={intentLocked}
              lockedAt={lockedAt}
            />
          ) : null}

          <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-signal/30 bg-signal/10 p-5">
              <p className="text-xs tracking-wide text-signal">불일치 점수</p>
              <p className="mt-2 font-display text-5xl text-signal">
                {report.intentDriftScore}
              </p>
              <p className="mt-2 text-sm">{report.summary}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold">다음에</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
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
                  "rounded-lg border p-4",
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
                    {STATUS_LABEL[f.status]}
                  </Badge>
                  <h4 className="font-medium">{f.title}</h4>
                </div>
                <p className="mt-2 text-sm">{f.detail}</p>
              </div>
            ))}
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
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
