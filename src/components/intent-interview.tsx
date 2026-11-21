"use client";

import { CheckCircle2, Circle } from "lucide-react";
import {
  AXIS_BY_ID,
  INTENT_AXES,
  KIND_LABEL,
  kindToAxis,
} from "@/lib/intent-axes";
import type { Ambiguity, ResearcherDecision } from "@/lib/types";
import { AxisCardGrid, AxisFlowPills } from "@/components/axis-card-grid";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
  ambiguities: Ambiguity[];
  decisions: Record<string, ResearcherDecision>;
  focusIdx: number;
  onFocus: (idx: number) => void;
  onChoose: (ambiguityId: string, option: string) => void;
  onNote: (ambiguityId: string, note: string) => void;
};

export function IntentAxisMap({
  ambiguities,
  decisions,
  focusIdx,
  onFocus,
}: Pick<Props, "ambiguities" | "decisions" | "focusIdx" | "onFocus">) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-mist/50 px-5 py-3">
        <p className="text-sm font-semibold text-foreground">
          네 가지를 고르면 잠글 수 있어요
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          색 칸을 누르면 해당 질문으로 이동합니다
        </p>
      </div>
      <div className="p-4 sm:p-5">
        <AxisCardGrid
          cards={INTENT_AXES.map((axis) => {
            const related = ambiguities
              .map((a, i) => ({ a, i }))
              .filter(({ a }) => kindToAxis(a.kind) === axis.id);
            const first = related[0];
            const done =
              related.length > 0 &&
              related.every(({ a }) => decisions[a.id]?.chosenOption);
            const picked = first
              ? decisions[first.a.id]?.chosenOption
              : undefined;
            return {
              id: axis.id,
              emoji: axis.emoji,
              label: axis.label,
              question: axis.question,
              swatch: axis.swatch,
              soft: axis.soft,
              softDark: axis.softDark,
              done,
              active: related.some(({ i }) => i === focusIdx),
              disabled: !first,
              picked,
              onClick: () => first && onFocus(first.i),
            };
          })}
        />
      </div>

      <div className="border-t border-border px-4 py-3.5 sm:px-5">
        <AxisFlowPills
          steps={[
            { t: "질문", c: "bg-zinc-200 text-zinc-800" },
            { t: "기간", c: "bg-amber-400 text-amber-950" },
            { t: "식별", c: "bg-sky-400 text-sky-950" },
            { t: "측정", c: "bg-teal-500 text-white" },
            { t: "분모", c: "bg-emerald-500 text-white" },
            { t: "잠금", c: "bg-violet-500 text-white" },
            { t: "반출", c: "bg-rose-500 text-white" },
          ]}
        />
      </div>
    </div>
  );
}

export function IntentChoicePanel({
  ambiguities,
  decisions,
  focusIdx,
  onFocus,
  onChoose,
  onNote,
}: Props) {
  const focus = ambiguities[Math.min(focusIdx, Math.max(ambiguities.length - 1, 0))];
  if (!focus) return null;
  const axis = AXIS_BY_ID[kindToAxis(focus.kind)];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {ambiguities.map((a, i) => {
          const ax = AXIS_BY_ID[kindToAxis(a.kind)];
          const done = Boolean(decisions[a.id]?.chosenOption);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onFocus(i)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                i === focusIdx ? "ring-2 ring-offset-1" : "",
                done ? "border-transparent text-white" : "bg-card text-foreground",
              )}
              style={
                done || i === focusIdx
                  ? {
                      backgroundColor: done ? ax.swatch : undefined,
                      borderColor: ax.swatch,
                      ["--tw-ring-color" as string]: ax.swatch,
                    }
                  : undefined
              }
            >
              <span>{ax.emoji}</span>
              {done ? "✓" : i + 1} {ax.short}
            </button>
          );
        })}
      </div>

      <div
        className={cn("rounded-2xl border-2 p-5", axis.soft, axis.softDark)}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-2xl">{axis.emoji}</span>
          <Badge className="border-0 bg-white/70 text-foreground dark:bg-black/30">
            {KIND_LABEL[focus.kind] ?? focus.kind}
          </Badge>
          <span className="text-xs opacity-70">
            {focusIdx + 1} / {ambiguities.length}
          </span>
        </div>
        <h3 className="mt-3 text-xl font-bold leading-snug">{focus.title}</h3>
        <p className="mt-2 text-sm leading-relaxed opacity-90">
          {focus.whyItMatters}
        </p>

        {/* Mini diagram: fork */}
        <div className="mt-4 rounded-xl border border-black/10 bg-white/60 p-3 dark:border-white/10 dark:bg-black/25">
          <p className="mb-2 text-center text-[11px] font-semibold tracking-wide opacity-70">
            갈림길 · 하나만 고르세요
          </p>
          <div className="flex flex-col items-center gap-2">
            <div
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
              style={{ backgroundColor: axis.swatch }}
            >
              {axis.question}
            </div>
            <svg width="120" height="28" viewBox="0 0 120 28" aria-hidden>
              <path
                d="M60 0 V10 M60 10 L20 26 M60 10 L100 26"
                stroke={axis.swatch}
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          {focus.options.map((opt, oi) => {
            const selected = decisions[focus.id]?.chosenOption === opt;
            const letter = String.fromCharCode(65 + oi);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChoose(focus.id, opt)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 bg-white/80 px-3.5 py-3 text-left transition dark:bg-black/30",
                  selected
                    ? "border-current shadow-md"
                    : "border-black/10 hover:border-black/25 dark:border-white/15",
                )}
                style={selected ? { borderColor: axis.swatch } : undefined}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                    selected ? "text-white" : "bg-black/5 dark:bg-white/10",
                  )}
                  style={
                    selected ? { backgroundColor: axis.swatch } : undefined
                  }
                >
                  {selected ? <CheckCircle2 className="size-5" /> : letter}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-snug">
                    {opt}
                  </span>
                  {focus.recommended === opt ? (
                    <span className="mt-1 inline-block rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-800 dark:text-violet-200">
                      추천 · 눌러야 선택됨
                    </span>
                  ) : null}
                </span>
                {!selected ? (
                  <Circle className="size-4 shrink-0 opacity-30" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <Label className="text-xs opacity-70">메모 (선택)</Label>
          <Textarea
            className="mt-1 border-black/10 bg-white/70 dark:border-white/15 dark:bg-black/30"
            rows={2}
            value={decisions[focus.id]?.note ?? ""}
            onChange={(e) => onNote(focus.id, e.target.value)}
            placeholder="왜 이쪽으로 골랐는지"
          />
        </div>

        {focus.evidence?.length ? (
          <ul className="mt-3 space-y-1 text-xs opacity-80">
            {focus.evidence.map((e) => (
              <li key={e}>· {e}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
