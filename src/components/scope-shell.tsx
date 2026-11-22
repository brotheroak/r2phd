"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { ConsoleEntryButton } from "@/components/console-entry-button";
import { SphereMark } from "@/components/sphere-mark";
import { WORK_CASES } from "@/lib/work-cases";
import { cn } from "@/lib/utils";

/** Shared page chrome — same max-width / gutters as landing */
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
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <SphereMark size="nav" />
            <span className="font-display text-2xl tracking-tight text-ink">
              IntentSpec
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <StatusPill />
            <Link
              href="/#cases"
              className="hidden text-sm font-medium text-foreground/80 hover:text-foreground sm:inline"
            >
              케이스
            </Link>
            <ConsoleEntryButton />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 pb-3 sm:px-8">
          <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                    "inline-flex h-10 shrink-0 items-center rounded-full border px-3.5 text-sm font-semibold whitespace-nowrap transition",
                    active
                      ? "border-transparent shadow-sm"
                      : "border-border/80 bg-card/80 text-foreground/80 hover:text-foreground",
                  )}
                  style={
                    active
                      ? {
                          borderColor: s.swatch,
                          backgroundColor: `${s.swatch}18`,
                          color: "var(--ink)",
                        }
                      : undefined
                  }
                >
                  <span className="mr-1.5" aria-hidden>
                    {s.emoji}
                  </span>
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="mb-8 max-w-3xl">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-4" />
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl leading-snug text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {subtitle}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border bg-mist/40 px-5 py-3 text-sm text-muted-foreground sm:px-6">
            <span className="size-2 shrink-0 rounded-full bg-primary" />
            <span className="leading-snug">
              실제 치는 말·원문을 넣고, 헷갈리는 점을 나눈 뒤 고르기 · 확정 전엔 실행 금지
            </span>
          </div>
          <div className="px-5 py-6 sm:px-6 sm:py-7">{children}</div>
        </div>
      </main>
    </div>
  );
}
