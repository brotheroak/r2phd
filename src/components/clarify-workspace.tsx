"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Copy,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  CLARIFY_AXES,
  CLARIFY_AXIS_BY_ID,
  CLARIFY_DOMAINS,
  type ClarifyDomain,
} from "@/lib/clarify";
import { useConsoleStore } from "@/lib/console-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const SAMPLES: Record<ClarifyDomain, string> = {
  analysis: "최근 로트 실패율이 왜 올랐는지, 회의 전에 원인을 잡고 싶다",
  research: "재시험 합격을 실패로 볼지에 대한 방법론을 정리하고 싶다",
  everyday: "주말에 아이랑 두 시간 안에 할 만한 걸 추천해 줘",
  collab:
    "LLM이 CTA를 연구 옆에만 붙이고, 세 현장만 남기고, 합의 없이 코드를 고친다. 내 의도를 못 읽고 있다. 합의 전에는 손대지 말고 선택지로 맞춰 달라",
};

type Props = {
  /** Lock UI to one scope page (research / everyday / analysis). */
  fixedDomain?: ClarifyDomain;
};

export function ClarifyWorkspace({ fixedDomain }: Props) {
  const {
    clarifyDomain,
    clarifyQuestion,
    clarifyBrief,
    clarifyDecisions,
    clarifyLocked,
    clarifyLockedAt,
    setClarifyDomain,
    setClarifyQuestion,
    setClarifyBrief,
    setClarifyDecisions,
    setClarifyLocked,
    setResearchQuestion,
  } = useConsoleStore();

  const domain = fixedDomain ?? clarifyDomain;

  useEffect(() => {
    if (fixedDomain) setClarifyDomain(fixedDomain);
  }, [fixedDomain, setClarifyDomain]);

  const [focusIdx, setFocusIdx] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const ambiguities = clarifyBrief?.ambiguities ?? [];
  const openCount = ambiguities.filter(
    (a) => !clarifyDecisions[a.id]?.chosenOption,
  ).length;
  const allDone = ambiguities.length > 0 && openCount === 0;
  const focus =
    ambiguities[Math.min(focusIdx, Math.max(ambiguities.length - 1, 0))];

  const lockedCard = useMemo(() => {
    if (!clarifyBrief || !allDone) return "";
    const lines = [
      `# IntentSpec 질문 잠금 카드`,
      `도메인: ${CLARIFY_DOMAINS.find((d) => d.id === clarifyBrief.domain)?.label}`,
      `상태: ${clarifyLocked ? "잠금" : "미잠금"}`,
      clarifyLockedAt ? `시각: ${clarifyLockedAt}` : "",
      ``,
      `## 원래 질문`,
      clarifyQuestion,
      ``,
      `## 구체화된 질문`,
      clarifyBrief.refinedQuestion,
      ``,
      `## 방향`,
      clarifyBrief.direction,
      ``,
      `## 선택`,
      ...ambiguities.map((a) => {
        const axis = CLARIFY_AXIS_BY_ID[a.axis];
        return `- ${axis.emoji} ${axis.label}: ${clarifyDecisions[a.id]?.chosenOption ?? "—"}`;
      }),
      ``,
      `잠금 카드 없이 답을 확정하지 마세요.`,
    ];
    return lines.filter(Boolean).join("\n");
  }, [
    clarifyBrief,
    clarifyQuestion,
    clarifyDecisions,
    clarifyLocked,
    clarifyLockedAt,
    ambiguities,
    allDone,
  ]);

  function runClarify() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: clarifyQuestion,
          domain,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "질문을 구체화하지 못했습니다.");
        return;
      }
      setClarifyBrief(json.brief);
      setClarifyDecisions({});
      setClarifyLocked(false);
      setFocusIdx(0);
      setNotice(
        (json.notice ? json.notice + " · " : "") +
          "색 카드에서 골라 주세요. 추천은 자동 선택되지 않습니다.",
      );
    });
  }

  function choose(id: string, option: string) {
    setClarifyDecisions((prev) => ({
      ...prev,
      [id]: { chosenOption: option, note: prev[id]?.note },
    }));
    if (clarifyBrief) {
      const next = clarifyBrief.ambiguities.findIndex(
        (a, i) =>
          i > focusIdx &&
          a.id !== id &&
          !clarifyDecisions[a.id]?.chosenOption,
      );
      const fallback = clarifyBrief.ambiguities.findIndex(
        (a) => a.id !== id && !clarifyDecisions[a.id]?.chosenOption,
      );
      const idx = next >= 0 ? next : fallback;
      if (idx >= 0) setFocusIdx(idx);
    }
  }

  function lock() {
    if (!allDone || !clarifyBrief) return;
    const when = new Date().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
    });
    setClarifyLocked(true, `${when} (Asia/Seoul)`);
    // If analysis-bound, seed analysis question for the gate
    if (clarifyBrief.domain === "analysis") {
      setResearchQuestion(clarifyBrief.refinedQuestion);
    }
    setNotice(
      "질문이 잠겼습니다. 카드를 복사해 챗봇·동료에게 넘기세요.",
    );
  }

  async function copyCard() {
    if (!lockedCard) return;
    await navigator.clipboard.writeText(lockedCard);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function loadSample() {
    setClarifyQuestion(SAMPLES[domain]);
    setClarifyBrief(null);
    setClarifyDecisions({});
    setClarifyLocked(false);
    setNotice("예제 질문을 넣었습니다. 「애매한 점 찾기」를 눌러 주세요.");
  }

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm",
          clarifyLocked
            ? "border-ok/35 bg-ok/5"
            : "border-violet-300/60 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-500/10",
        )}
      >
        <div className="flex items-center gap-2">
          <Lock
            className={cn(
              "size-4",
              clarifyLocked ? "text-ok" : "text-violet-600",
            )}
          />
          <span className="font-medium">
            {clarifyLocked
              ? "질문 잠금 · 방향 카드 공유 가능"
              : "질문 미잠금 · 분석·연구·일상·의도 설명 동일 패턴"}
          </span>
        </div>
        {ambiguities.length ? (
          <span className="text-xs text-muted-foreground">
            남은 선택 {openCount}개
          </span>
        ) : null}
      </div>

      {!fixedDomain ? (
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            질문 종류
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {CLARIFY_DOMAINS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setClarifyDomain(d.id)}
                className={cn(
                  "rounded-xl border-2 p-3 text-left transition",
                  domain === d.id
                    ? "border-current shadow-sm"
                    : "border-border bg-card opacity-80 hover:opacity-100",
                )}
                style={
                  domain === d.id
                    ? { borderColor: d.swatch, backgroundColor: `${d.swatch}18` }
                    : undefined
                }
              >
                <span className="text-lg">{d.emoji}</span>
                <p className="mt-1 text-sm font-semibold">{d.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {d.blurb}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <Label className="mb-1.5 block">애매한 질문</Label>
        <Textarea
          rows={4}
          value={clarifyQuestion}
          onChange={(e) => setClarifyQuestion(e.target.value)}
          placeholder="분석·연구·일상·의도 설명 무엇이든. 예: LLM이 내 뜻을 못 읽고 자기 마음대로 고친다"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={loadSample}>
            이 종류 예제
          </Button>
          <Button
            type="button"
            onClick={runClarify}
            disabled={pending || clarifyQuestion.trim().length < 3}
            className="gap-2"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            애매한 점 찾기
          </Button>
        </div>
      </div>

      {notice ? (
        <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {clarifyBrief ? (
        <>
          <div className="rounded-xl border border-violet-300 bg-violet-50 p-4 dark:border-violet-500/40 dark:bg-violet-500/10">
            <p className="text-sm font-medium">{clarifyBrief.summary}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              구체화 초안: {clarifyBrief.refinedQuestion}
            </p>
          </div>

          {/* Color axis map */}
          <div className="grid gap-2 sm:grid-cols-2">
            {CLARIFY_AXES.map((axis) => {
              const related = ambiguities
                .map((a, i) => ({ a, i }))
                .filter(({ a }) => a.axis === axis.id);
              const done =
                related.length > 0 &&
                related.every(({ a }) => clarifyDecisions[a.id]?.chosenOption);
              const first = related[0];
              const active = related.some(({ i }) => i === focusIdx);
              return (
                <button
                  key={axis.id}
                  type="button"
                  disabled={!first}
                  onClick={() => first && setFocusIdx(first.i)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-left",
                    axis.soft,
                    axis.softDark,
                    !first && "opacity-40",
                  )}
                  style={
                    active ? { boxShadow: `0 0 0 2px ${axis.swatch}` } : undefined
                  }
                >
                  <div className="flex justify-between">
                    <span className="text-lg">{axis.emoji}</span>
                    <span className="text-[11px] font-semibold">
                      {done ? "✓ 골랐음" : "고르기"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold">{axis.label}</p>
                  <p className="mt-0.5 text-xs opacity-80">{axis.question}</p>
                  {first && clarifyDecisions[first.a.id]?.chosenOption ? (
                    <p className="mt-2 rounded-md bg-white/50 px-2 py-1 text-[11px] font-medium dark:bg-black/20">
                      → {clarifyDecisions[first.a.id].chosenOption}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Flow diagram */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-medium">
            {[
              { t: "질문", c: "bg-zinc-200 text-zinc-800" },
              { t: "목적", c: "bg-violet-400 text-violet-950" },
              { t: "제약", c: "bg-amber-400 text-amber-950" },
              { t: "기준", c: "bg-sky-400 text-sky-950" },
              { t: "다음", c: "bg-teal-500 text-white" },
              { t: "잠금", c: "bg-rose-500 text-white" },
            ].map((n, i, arr) => (
              <span key={n.t} className="inline-flex items-center gap-1.5">
                <span className={cn("rounded-full px-2.5 py-1", n.c)}>
                  {n.t}
                </span>
                {i < arr.length - 1 ? (
                  <span className="text-muted-foreground">→</span>
                ) : null}
              </span>
            ))}
          </div>

          {focus ? (
            <div
              className={cn(
                "rounded-2xl border-2 p-5",
                CLARIFY_AXIS_BY_ID[focus.axis].soft,
                CLARIFY_AXIS_BY_ID[focus.axis].softDark,
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {CLARIFY_AXIS_BY_ID[focus.axis].emoji}
                </span>
                <span className="text-xs opacity-70">
                  {focusIdx + 1}/{ambiguities.length}
                </span>
              </div>
              <h3 className="mt-2 text-xl font-bold">{focus.title}</h3>
              <p className="mt-1 text-sm opacity-90">{focus.whyItMatters}</p>

              <div className="mt-4 space-y-2">
                {focus.options.map((opt, oi) => {
                  const selected =
                    clarifyDecisions[focus.id]?.chosenOption === opt;
                  const letter = String.fromCharCode(65 + oi);
                  const swatch = CLARIFY_AXIS_BY_ID[focus.axis].swatch;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => choose(focus.id, opt)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border-2 bg-white/80 p-3 text-left dark:bg-black/30",
                        selected
                          ? "shadow-md"
                          : "border-black/10 dark:border-white/15",
                      )}
                      style={
                        selected ? { borderColor: swatch } : undefined
                      }
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                          selected ? "text-white" : "bg-black/5 dark:bg-white/10",
                        )}
                        style={
                          selected ? { backgroundColor: swatch } : undefined
                        }
                      >
                        {selected ? (
                          <CheckCircle2 className="size-5" />
                        ) : (
                          letter
                        )}
                      </span>
                      <span className="flex-1 text-sm font-semibold">
                        {opt}
                        {focus.recommended === opt ? (
                          <span className="mt-1 block text-[10px] font-medium text-violet-700 dark:text-violet-200">
                            추천 · 눌러야 선택됨
                          </span>
                        ) : null}
                      </span>
                      {!selected ? (
                        <Circle className="mt-1 size-4 opacity-30" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="lg"
              className="gap-2"
              disabled={!allDone}
              onClick={lock}
            >
              <ClipboardCheck className="size-4" />
              {allDone
                ? "질문 잠금 · 카드 만들기"
                : `잠금 불가 · ${openCount}개 남음`}
            </Button>
            {clarifyLocked ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={copyCard}
                >
                  {copied ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  카드 복사
                </Button>
                {clarifyBrief.domain === "analysis" ? (
                  <Link
                    href="/console/semantic?tab=analyze"
                    className="inline-flex h-9 items-center rounded-lg border border-border bg-secondary px-3 text-sm font-medium"
                  >
                    분석 게이트로 이어가기
                  </Link>
                ) : null}
              </>
            ) : null}
          </div>

          {clarifyLocked && lockedCard ? (
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-4 font-mono text-[11px] leading-relaxed text-foreground whitespace-pre-wrap">
              {lockedCard}
            </pre>
          ) : null}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            질문을 넣고 「애매한 점 찾기」를 누르면
            <br />
            목적·제약·기준·다음을 색 선택지로 고르게 됩니다.
          </p>
          <button
            type="button"
            className="mx-auto mt-4 max-w-md rounded-lg border border-border bg-card px-4 py-3 text-left text-xs hover:border-primary/40"
            onClick={loadSample}
          >
            <span className="font-semibold">
              {CLARIFY_DOMAINS.find((d) => d.id === domain)?.emoji} 예제 불러오기
            </span>
            <span className="mt-1 block text-muted-foreground">
              {SAMPLES[domain]}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
