"use client";

import { useState } from "react";
import { Check, Copy, Lock, Unlock } from "lucide-react";
import { KIND_LABEL } from "@/lib/intent-axes";
import { buildIntentLockMarkdown } from "@/lib/intent-lock";
import type {
  AnalysisDraft,
  AnalysisSpec,
  ResearcherDecision,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  researchQuestion: string;
  draft: AnalysisDraft;
  decisions: Record<string, ResearcherDecision>;
  spec: AnalysisSpec | null;
  locked: boolean;
  lockedAt?: string | null;
};

export function IntentLockCard({
  researchQuestion,
  draft,
  decisions,
  spec,
  locked,
  lockedAt,
}: Props) {
  const [copied, setCopied] = useState(false);
  const undecided = draft.ambiguities.filter(
    (a) => !decisions[a.id]?.chosenOption,
  ).length;

  async function copyCard() {
    const md = buildIntentLockMarkdown({
      researchQuestion,
      draft,
      decisions,
      spec,
      lockedAt,
    });
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        locked
          ? "border-ok/40 bg-ok/5"
          : "border-signal/40 bg-signal/5",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          {locked ? (
            <Lock className="mt-0.5 size-4 text-ok" />
          ) : (
            <Unlock className="mt-0.5 size-4 text-signal" />
          )}
          <div>
            <p className="text-sm font-semibold text-foreground">
              기준 확정 카드
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {locked
                ? "기준이 고정됐어요. 이 카드랑 같이 SQL·숫자를 공유하세요."
                : undecided
                  ? `아직 ${undecided}개 기준이 비어 있어요. 확정 전에는 SQL을 내보낼 수 없어요.`
                  : "선택은 끝났어요. 「기준 확정」을 눌러야 SQL이 나가요."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "font-normal",
              locked
                ? "border-ok/40 text-ok"
                : "border-signal/40 text-signal",
            )}
          >
            {locked ? "확정됨 · 내보내기 가능" : "아직 미확정 · 내보내기 불가"}
          </Badge>
          <Button type="button" size="sm" variant="outline" onClick={copyCard}>
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "복사됨" : "카드 복사"}
          </Button>
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        {draft.ambiguities.map((a) => {
          const chosen = decisions[a.id]?.chosenOption;
          return (
            <li
              key={a.id}
              className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-md border border-border/70 bg-card/80 px-2.5 py-2 text-sm"
            >
              <span className="text-xs text-muted-foreground">
                {KIND_LABEL[a.kind] ?? a.kind}
              </span>
              <span className="font-medium text-foreground">{a.title}</span>
              <span
                className={cn(
                  "text-xs",
                  chosen ? "text-foreground" : "text-signal",
                )}
              >
                → {chosen ?? "미선택"}
              </span>
            </li>
          );
        })}
      </ul>

      {locked && lockedAt ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          확정 시각 · {lockedAt}
        </p>
      ) : null}
    </div>
  );
}
