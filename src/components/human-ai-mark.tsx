import { cn } from "@/lib/utils";

type Props = {
  size?: "nav" | "hero";
  className?: string;
};

/**
 * Brand signal for human↔AI communication.
 * Typographic + geometric — not a clipart pill.
 */
export function HumanAiMark({ size = "nav", className }: Props) {
  const hero = size === "hero";

  if (hero) {
    return (
      <div
        className={cn(
          "inline-flex flex-col items-center gap-4 text-ink",
          className,
        )}
      >
        <div
          className="relative flex h-14 w-[min(72vw,420px)] items-center justify-center"
          aria-hidden
        >
          {/* Left disc — human */}
          <span className="absolute left-[12%] top-1/2 size-11 -translate-y-1/2 rounded-full border border-ink/25 bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />
          {/* Right disc — AI */}
          <span className="absolute right-[12%] top-1/2 size-11 -translate-y-1/2 rounded-full bg-ink" />
          {/* Bridging arc */}
          <svg
            className="absolute inset-x-[18%] top-1/2 h-10 -translate-y-1/2 overflow-visible"
            viewBox="0 0 240 40"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M8 20 C 70 2, 170 2, 232 20"
              className="human-ai-arc stroke-ink/25"
              strokeWidth="1.25"
            />
            <path
              d="M8 20 C 70 2, 170 2, 232 20"
              className="human-ai-arc-draw stroke-primary"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
          {/* Center lock glyph */}
          <span className="relative z-[1] flex size-9 items-center justify-center rounded-full border border-primary/30 bg-white font-display text-lg text-ink">
            ⟷
          </span>
        </div>
        <p className="font-display text-xl tracking-tight text-ink sm:text-2xl">
          사람 <span className="text-primary">⟷</span> AI
        </p>
        <p className="text-sm tracking-[0.18em] text-muted-foreground uppercase">
          뜻이 맞는 소통
        </p>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-ink",
        className,
      )}
      title="사람 ⟷ AI · 뜻이 맞는 소통"
    >
      <span className="relative inline-flex h-5 w-11 items-center" aria-hidden>
        <span className="absolute left-0 size-3.5 rounded-full border border-ink/30 bg-white" />
        <span className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-ink/20" />
        <span className="human-ai-dot absolute left-3 top-1/2 size-1 -translate-y-1/2 rounded-full bg-primary" />
        <span className="absolute right-0 size-3.5 rounded-full bg-ink" />
      </span>
      <span className="font-display text-[15px] leading-none tracking-tight">
        사람 <span className="text-primary">⟷</span> AI
      </span>
    </span>
  );
}
