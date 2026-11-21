import { cn } from "@/lib/utils";

type Props = {
  size?: "nav" | "hero" | "compact";
  className?: string;
  /** Hide hover title when nested inside SphereMark */
  quiet?: boolean;
};

/**
 * White disc ↔ black disc — bidirectional bridge pulses.
 * compact: tiny center glyph for SphereMark (not face-sized).
 */
export function HumanAiMark({ size = "nav", className, quiet = false }: Props) {
  const hero = size === "hero";
  const compact = size === "compact";
  const dash = hero ? 12 : compact ? 7 : 8;
  const gap = compact ? 48 : hero ? 74 : 78;

  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      aria-label={quiet ? undefined : "사람과 AI의 소통"}
      title={quiet ? undefined : "사람과 AI의 소통"}
    >
      <svg
        viewBox="0 0 200 80"
        className={cn(
          hero && "h-16 w-48 sm:h-[4.5rem] sm:w-56",
          size === "nav" && "h-6 w-14",
          compact && "h-5 w-11"
        )}
        fill="none"
        aria-hidden
      >
        <line
          x1="62"
          y1="40"
          x2="138"
          y2="40"
          className="stroke-ink/20"
          strokeWidth={hero ? 1.5 : 1.1}
          strokeLinecap="round"
        />
        <line
          x1="62"
          y1="40"
          x2="138"
          y2="40"
          className="human-ai-bridge-pulse-fwd stroke-primary"
          strokeWidth={hero ? 2.25 : compact ? 1.5 : 1.75}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
        />
        <line
          x1="62"
          y1="40"
          x2="138"
          y2="40"
          className="human-ai-bridge-pulse-rev stroke-ink/70"
          strokeWidth={hero ? 2 : compact ? 1.25 : 1.5}
          strokeLinecap="round"
          strokeDasharray={`${dash * 0.85} ${gap}`}
        />

        <circle
          cx="36"
          cy="40"
          r={compact ? 18 : 26}
          className="fill-white stroke-ink/25"
          strokeWidth="1.25"
        />
        <circle
          cx="164"
          cy="40"
          r={compact ? 18 : 26}
          className="fill-ink"
        />
      </svg>
    </span>
  );
}
