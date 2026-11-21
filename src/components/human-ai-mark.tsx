import { cn } from "@/lib/utils";

type Props = {
  size?: "nav" | "hero";
  className?: string;
};

/**
 * White disc → black disc with a pulse that travels on the bridge.
 * Bridge endpoints sit on the circle edges only.
 */
export function HumanAiMark({ size = "nav", className }: Props) {
  const hero = size === "hero";

  // Shared geometry in a fixed viewBox so ends land on circle rims.
  // Circles at (28,40) r=20 and (172,40) r=20. Bridge from x=48 to x=152.
  const vb = "0 0 200 80";

  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      aria-label="사람과 AI의 소통"
      title="사람과 AI의 소통"
    >
      <svg
        viewBox={vb}
        className={cn(hero ? "h-14 w-44 sm:h-16 sm:w-52" : "h-5 w-12")}
        fill="none"
        aria-hidden
      >
        {/* Bridge baseline — rim to rim */}
        <line
          x1="48"
          y1="40"
          x2="152"
          y2="40"
          className="stroke-ink/20"
          strokeWidth={hero ? 1.5 : 1.25}
          strokeLinecap="round"
        />
        {/* Traveling pulse — clipped to the bridge segment */}
        <line
          x1="48"
          y1="40"
          x2="152"
          y2="40"
          className="human-ai-bridge-pulse stroke-primary"
          strokeWidth={hero ? 2.25 : 1.75}
          strokeLinecap="round"
          strokeDasharray={hero ? "18 120" : "10 94"}
        />

        {/* White disc (human) */}
        <circle
          cx="28"
          cy="40"
          r="20"
          className="fill-white stroke-ink/25"
          strokeWidth="1.25"
        />
        {/* Black disc (AI) */}
        <circle cx="172" cy="40" r="20" className="fill-ink" />
      </svg>
    </span>
  );
}
