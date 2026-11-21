"use client";

import { cn } from "@/lib/utils";

export type AxisCardModel = {
  id: string;
  emoji: string;
  label: string;
  question: string;
  swatch: string;
  soft: string;
  softDark: string;
  done: boolean;
  active: boolean;
  disabled?: boolean;
  /** Joined selection summary, if any */
  picked?: string;
  onClick: () => void;
};

/**
 * Shared 2×2 axis map used by every clarify case and the analysis interview.
 * Equal gutters, equal min-height, reserved pick row so cards stay aligned.
 */
export function AxisCardGrid({ cards }: { cards: AxisCardModel[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          disabled={card.disabled}
          onClick={card.onClick}
          className={cn(
            "flex min-h-[8.5rem] h-full flex-col rounded-xl border-2 px-4 py-3.5 text-left transition",
            card.soft,
            card.softDark,
            card.disabled && "pointer-events-none opacity-40",
          )}
          style={
            card.active ? { boxShadow: `0 0 0 2px ${card.swatch}` } : undefined
          }
        >
          <div className="flex h-7 items-center justify-between gap-2">
            <span className="text-xl leading-none" aria-hidden>
              {card.emoji}
            </span>
            <span className="text-[11px] font-semibold tracking-tight opacity-80">
              {card.done ? "✓ 골랐어요" : "고르기"}
            </span>
          </div>
          <p className="mt-3 text-base font-bold leading-snug">{card.label}</p>
          <p className="mt-1.5 text-xs leading-relaxed opacity-80">
            {card.question}
          </p>
          <div className="mt-auto min-h-[2.25rem] pt-3">
            {card.picked ? (
              <p className="rounded-md bg-white/55 px-2.5 py-1.5 text-[11px] font-medium leading-snug dark:bg-black/20">
                → {card.picked}
              </p>
            ) : null}
          </div>
        </button>
      ))}
    </div>
  );
}

export function AxisFlowPills({
  steps,
}: {
  steps: { t: string; c: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 py-1 text-[11px] font-medium">
      {steps.map((n, i) => (
        <span key={n.t} className="inline-flex items-center gap-2">
          <span className={cn("rounded-full px-3 py-1.5 leading-none", n.c)}>
            {n.t}
          </span>
          {i < steps.length - 1 ? (
            <span className="text-muted-foreground" aria-hidden>
              →
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
