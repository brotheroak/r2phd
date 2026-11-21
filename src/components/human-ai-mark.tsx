import { cn } from "@/lib/utils";

type Props = {
  size?: "nav" | "hero";
  className?: string;
};

/**
 * White disc ↔ black disc — bidirectional bridge pulses.
 * Circles: (36,40) r=26 and (164,40) r=26
 * Bridge: x=62 → x=138
 */
export function HumanAiMark({ size = "nav", className }: Props) {
  const hero = size === "hero";
  const bridgeLen = 76;
  const dash = hero ? 12 : 8;
  const gap = bridgeLen - dash + 10;

  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      aria-label="사람과 AI의 소통"
      title="사람과 AI의 소통"
    >
      <svg
        viewBox="0 0 200 80"
        className={cn(hero ? "h-16 w-48 sm:h-[4.5rem] sm:w-56" : "h-6 w-14")}
        fill="none"
        aria-hidden
      >
        <line
          x1="62"
          y1="40"
          x2="138"
          y2="40"
          className="stroke-ink/20"
          strokeWidth={hero ? 1.5 : 1.25}
          strokeLinecap="round"
        />
        {/* Human → AI */}
        <line
          x1="62"
          y1="40"
          x2="138"
          y2="40"
          className="human-ai-bridge-pulse-fwd stroke-primary"
          strokeWidth={hero ? 2.25 : 1.75}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
        />
        {/* AI → Human */}
        <line
          x1="62"
          y1="40"
          x2="138"
          y2="40"
          className="human-ai-bridge-pulse-rev stroke-ink/70"
          strokeWidth={hero ? 2 : 1.5}
          strokeLinecap="round"
          strokeDasharray={`${dash * 0.85} ${gap}`}
        />

        <circle
          cx="36"
          cy="40"
          r="26"
          className="fill-white stroke-ink/25"
          strokeWidth="1.25"
        />
        <circle cx="164" cy="40" r="26" className="fill-ink" />
      </svg>
    </span>
  );
}
