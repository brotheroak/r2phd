import { cn } from "@/lib/utils";

type Props = {
  /** CSS width of the glyph — height follows viewBox aspect */
  width?: number | string;
  className?: string;
  quiet?: boolean;
};

/**
 * White disc ↔ black disc — one geometry, scaled only by width.
 * Bridge is short; discs are large relative to the gap (rim-to-rim).
 * viewBox 0 0 200 80 · discs r=24 at cx 40 / 160 · bridge 64→136
 */
export function HumanAiMark({
  width = 56,
  className,
  quiet = false,
}: Props) {
  const dash = 10;
  const gap = 62;

  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      style={{ width }}
      aria-label={quiet ? undefined : "사람과 AI의 소통"}
      title={quiet ? undefined : "사람과 AI의 소통"}
    >
      <svg
        viewBox="0 0 200 80"
        className="h-auto w-full"
        fill="none"
        aria-hidden
      >
        <line
          x1="64"
          y1="40"
          x2="136"
          y2="40"
          className="stroke-ink/20"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <line
          x1="64"
          y1="40"
          x2="136"
          y2="40"
          className="human-ai-bridge-pulse-fwd stroke-primary"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
        />
        <line
          x1="64"
          y1="40"
          x2="136"
          y2="40"
          className="human-ai-bridge-pulse-rev stroke-ink/70"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={`${dash * 0.85} ${gap}`}
        />
        {/* Coral complement to teal/ink — readable when small */}
        <circle
          cx="40"
          cy="40"
          r="24"
          className="fill-[var(--glow-coral)] stroke-ink/20"
          strokeWidth="1.25"
        />
        <circle cx="160" cy="40" r="24" className="fill-ink" />
      </svg>
    </span>
  );
}
