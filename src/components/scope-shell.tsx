"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { CLARIFY_DOMAINS } from "@/lib/clarify";
import { cn } from "@/lib/utils";

const SCOPES = [
  {
    ...CLARIFY_DOMAINS[0],
    href: "/console/semantic?tab=analyze&case=quality",
    match: (p: string) => p.startsWith("/console"),
  },
  {
    ...CLARIFY_DOMAINS[1],
    href: "/clarify/research",
    match: (p: string) => p.startsWith("/clarify/research"),
  },
  {
    ...CLARIFY_DOMAINS[2],
    href: "/clarify/everyday",
    match: (p: string) => p.startsWith("/clarify/everyday"),
  },
] as const;

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

  return (
    <div className="min-h-svh bg-[color-mix(in_oklab,var(--mist)_55%,white)]">
      <header className="border-b border-border/70 bg-card/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-baseline gap-2.5">
            <span className="font-display text-xl text-ink">IntentSpec</span>
            <span className="hidden text-[11px] text-muted-foreground sm:inline">
              의도 구체화 에이전트
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <StatusPill />
            <Link
              href="/"
              className="hidden text-xs text-muted-foreground hover:text-foreground sm:inline"
            >
              적용 범위
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
          <div className="grid gap-2 sm:grid-cols-3">
            {SCOPES.map((s) => {
              const active = s.match(pathname);
              return (
                <Link
                  key={s.id}
                  href={s.href}
                  className={cn(
                    "rounded-xl border-2 px-3 py-2.5 transition",
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
                  <p className="text-sm font-semibold text-foreground">
                    {s.emoji} {s.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {s.blurb}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-primary uppercase">
              <Sparkles className="size-3.5" />
              {eyebrow}
            </p>
            <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border bg-mist/40 px-4 py-2.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Agent core · 애매한 질문을 선택지로 구체화 · 잠금 전 확정 금지
          </div>
          <div className="p-4 md:p-5">{children}</div>
        </div>
      </main>
    </div>
  );
}
