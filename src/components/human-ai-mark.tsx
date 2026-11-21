import { cn } from "@/lib/utils";

type Props = {
  size?: "nav" | "hero";
  className?: string;
};

/**
 * Geometric human↔AI signal only — white disc, black disc, pulse between.
 * No “사람 AI” label (kept out of chrome on purpose).
 */
export function HumanAiMark({ size = "nav", className }: Props) {
  const hero = size === "hero";
  const disc = hero ? "size-10 sm:size-12" : "size-3.5";
  const bridge = hero ? "h-px w-24 sm:w-28" : "h-px w-8";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        hero ? "gap-0" : "gap-0",
        className,
      )}
      aria-label="사람과 AI의 소통"
      title="사람과 AI의 소통"
    >
      <span
        className={cn(
          "relative inline-flex items-center",
          hero ? "h-12 w-[9.5rem] sm:h-14 sm:w-44" : "h-5 w-11",
        )}
        aria-hidden
      >
        <span
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-ink/25 bg-white",
            disc,
          )}
        />
        <span
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-ink/15",
            bridge,
          )}
        />
        <span
          className={cn(
            "human-ai-dot absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-primary",
            hero ? "size-2" : "size-1",
          )}
        />
        <span
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-ink",
            disc,
          )}
        />
      </span>
    </span>
  );
}
