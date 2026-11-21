import { cn } from "@/lib/utils";

type Props = {
  /** nav: compact wordmark chip · hero: larger brand signal under eyebrow */
  size?: "nav" | "hero";
  className?: string;
};

/**
 * Iconic human ↔ AI communication mark.
 * Two nodes + bridging pulse — meaning without plain text "인간 ↔ AI 소통".
 */
export function HumanAiMark({ size = "nav", className }: Props) {
  const hero = size === "hero";
  return (
    <span
      className={cn(
        "human-ai-mark inline-flex items-center gap-2.5",
        hero ? "flex-col gap-3" : "rounded-full border border-border/80 bg-white/70 px-2.5 py-1 backdrop-blur-sm",
        className,
      )}
      title="인간 ↔ AI 소통"
    >
      <span
        className={cn(
          "relative inline-flex items-center",
          hero ? "gap-3" : "gap-1.5",
        )}
        aria-hidden
      >
        {/* Human node */}
        <span
          className={cn(
            "relative z-[1] inline-flex items-center justify-center rounded-full border border-ink/20 bg-white text-ink shadow-[0_0_0_3px_color-mix(in_oklab,white_70%,transparent)]",
            hero ? "size-11" : "size-6",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className={hero ? "size-5" : "size-3.5"}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="3.2" />
            <path d="M5.5 19.2c1.4-3 3.7-4.5 6.5-4.5s5.1 1.5 6.5 4.5" />
          </svg>
        </span>

        {/* Bridge */}
        <span
          className={cn(
            "relative overflow-hidden rounded-full bg-ink/10",
            hero ? "h-1.5 w-16" : "h-1 w-8",
          )}
        >
          <span className="human-ai-pulse absolute inset-y-0 left-0 w-1/2 rounded-full bg-primary" />
        </span>

        {/* AI node */}
        <span
          className={cn(
            "relative z-[1] inline-flex items-center justify-center rounded-full border border-primary/35 bg-primary text-primary-foreground",
            hero ? "size-11" : "size-6",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className={hero ? "size-5" : "size-3.5"}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="6.5" y="7" width="11" height="10" rx="2.2" />
            <path d="M9.2 11.2h5.6M9.2 14.2h3.6" />
            <circle cx="12" cy="5.2" r="1" fill="currentColor" stroke="none" />
          </svg>
        </span>
      </span>

      <span
        className={cn(
          "font-medium tracking-tight text-ink",
          hero ? "text-base sm:text-lg" : "text-xs",
        )}
      >
        {hero ? (
          <>
            <span className="text-muted-foreground">사람</span>
            <span className="mx-1.5 text-primary">⟷</span>
            <span className="text-muted-foreground">AI</span>
            <span className="mx-2 text-border">·</span>
            <span>뜻이 맞는 소통</span>
          </>
        ) : (
          <>
            사람<span className="mx-1 text-primary">⟷</span>AI
          </>
        )}
      </span>
    </span>
  );
}
