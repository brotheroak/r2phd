"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { ConsoleEntryButton } from "@/components/console-entry-button";
import { WORK_CASES } from "@/lib/work-cases";
import { cn } from "@/lib/utils";

export function ScopeShell({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const caseParam = searchParams.get("case");

  return (
    <div className="min-h-svh bg-[color-mix(in_oklab,var(--mist)_55%,white)]">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-5">
          <Link href="/" className="flex items-baseline gap-2.5">
            <span className="font-display text-2xl text-ink">IntentSpec</span>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              의도 구체화 에이전트
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <StatusPill />
            <Link
              href="/#cases"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              케이스
            </Link>
            <ConsoleEntryButton />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-3 pb-3 sm:px-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {WORK_CASES.map((s) => {
              const analysisActive =
                pathname.startsWith("/console") &&
                (s.id === "finance"
                  ? caseParam === "vat" || caseParam === "payroll"
                  : caseParam === s.id ||
                    (!caseParam && s.id === "quality"));
              const active =
                s.kind === "clarify"
                  ? pathname.startsWith(s.href)
                  : analysisActive;
              return (
                <Link
                  key={s.id}
                  href={s.href}
                  className={cn(
                    "shrink-0 rounded-xl border-2 px-3 py-2 transition",
                    active
                      ? "shadow-sm"
                      : "border-border bg-card/70 opacity-80 hover:opacity-100",
                  )}
                  style={
                    active
                      ? {
                          borderColor: s.swatch,
                          backgroundColor: `${s.swatch}18`,
                        }
                      : undefined
                  }
                >
                  <p className="text-sm font-semibold whitespace-nowrap text-foreground">
                    {s.emoji} {s.label}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-7 sm:px-5">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-sm font-medium tracking-wide text-primary uppercase">
              <Sparkles className="size-4" />
              {eyebrow}
            </p>
            <h1 className="mt-1.5 font-display text-3xl leading-snug text-ink sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border bg-mist/40 px-4 py-3 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-primary" />
            Agent core · 애매한 질문을 선택지로 구체화 · 잠금 전 확정 금지
          </div>
          <div className="p-5 md:p-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
