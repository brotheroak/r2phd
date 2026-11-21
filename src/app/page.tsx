import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { ConsoleEntryButton } from "@/components/console-entry-button";
import { HeroAtmosphere } from "@/components/hero-atmosphere";
import { SphereMark } from "@/components/sphere-mark";
import {
  WORK_CASE_CATEGORIES,
  WORK_CASES,
  casesByCategory,
} from "@/lib/work-cases";

const FLOW = [
  { t: "사람의 말", c: "bg-zinc-700 text-white" },
  { t: "🎯 목적", c: "bg-violet-400 text-violet-950" },
  { t: "🧱 제약", c: "bg-amber-400 text-amber-950" },
  { t: "⚖️ 기준", c: "bg-sky-400 text-sky-950" },
  { t: "🧭 다음", c: "bg-teal-500 text-white" },
  { t: "🔒 같은 뜻", c: "bg-rose-500 text-white" },
  { t: "AI 실행", c: "bg-primary text-primary-foreground" },
] as const;

export default function HomePage() {
  return (
    <main>
      {/* Slim sticky bar — Astryx-style chrome */}
      <nav className="sticky top-0 z-40 border-b border-border/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="/" className="flex items-center gap-2.5">
            <SphereMark size="nav" />
            <span className="font-display text-2xl tracking-tight text-ink">
              IntentSpec
            </span>
          </a>
          <div className="flex items-center gap-4">
            <StatusPill />
            <a
              href="#cases"
              className="hidden text-sm font-medium text-foreground/80 hover:text-foreground sm:inline"
            >
              케이스
            </a>
            <ConsoleEntryButton />
          </div>
        </div>
      </nav>

      {/* Centered hero — equal vertical air + mouse-follow monotone atmosphere */}
      <header className="relative overflow-hidden">
        <HeroAtmosphere />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-5 py-20 text-center sm:px-8 sm:py-24">
          <div className="rise-in">
            <SphereMark size="hero" />
          </div>

          <h1 className="rise-in-delay-1 mt-8 max-w-4xl font-display text-4xl leading-[1.2] text-ink sm:text-5xl sm:leading-[1.18] lg:text-6xl lg:leading-[1.15]">
            결국 문제는 소통입니다.
            <br />
            뜻이 맞으면 일이 풀립니다
          </h1>

          <p className="rise-in-delay-2 mt-5 max-w-xl text-pretty text-base leading-relaxed text-foreground/80 sm:max-w-2xl sm:text-lg">
            애매한 말을 고르기 쉬운 선택지로 나누고, 뜻이 맞은 뒤에야
            분석·조사·추천·실행으로 넘어갑니다.
          </p>

          <div className="rise-in-delay-2 mt-14 w-full max-w-5xl">
            <h2 className="font-display text-3xl leading-snug text-ink sm:text-4xl">
              소통 → 합의 → 실행
            </h2>
            <div className="mt-6 rounded-xl border border-border bg-white px-5 py-7 sm:px-8 sm:py-8">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
                {FLOW.map((n, i) => (
                  <span key={n.t} className="inline-flex items-center gap-3">
                    <span
                      className={`rounded-full px-4 py-2.5 text-sm font-semibold sm:px-5 sm:py-3 sm:text-base ${n.c}`}
                    >
                      {n.t}
                    </span>
                    {i < FLOW.length - 1 ? (
                      <span
                        className="text-base font-semibold text-muted-foreground sm:text-lg"
                        aria-hidden
                      >
                        →
                      </span>
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cases — same gutters as hero; category heads left-aligned with cards */}
      <section
        id="cases"
        className="scroll-mt-20 border-t border-border/60 bg-white/40"
      >
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl leading-snug text-ink sm:text-4xl">
              같은 소통, 여러 케이스
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              사람↔AI · 조사·분석 · 운영·연동. 카드를 열어 선택부터 확정까지
              바로 시험해 볼 수 있어요.
            </p>
          </div>

          <div className="mt-14 space-y-14">
            {WORK_CASE_CATEGORIES.map((cat) => {
              const cases = casesByCategory(cat.id);
              return (
                <div key={cat.id}>
                  <div className="mb-5">
                    <h3 className="font-display text-2xl leading-snug text-ink sm:text-[1.75rem]">
                      {cat.label}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                      {cat.blurb}
                    </p>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 sm:gap-5">
                    {cases.map((s) => {
                      const n = WORK_CASES.findIndex((c) => c.id === s.id) + 1;
                      return (
                        <Link
                          key={s.id}
                          href={s.href}
                          className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 sm:p-6 transition hover:border-primary/35"
                          style={{ borderColor: `${s.swatch}40` }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-2xl leading-none">
                              {s.emoji}
                            </span>
                            <span
                              className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
                              style={{ backgroundColor: s.swatch }}
                            >
                              {String(n).padStart(2, "0")}
                            </span>
                          </div>
                          <h4 className="mt-4 text-xl font-semibold leading-snug text-ink">
                            {s.label}
                          </h4>
                          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                            {s.blurb}
                          </p>
                          <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                            안 맞는 지점 · {s.gap}
                          </p>
                          <p className="mt-3 flex-1 rounded-lg bg-mist/70 px-4 py-3 text-sm leading-relaxed text-foreground">
                            <span className="font-semibold">예 · </span>
                            {s.example}
                          </p>
                          <span className="mt-5 inline-flex items-center gap-1.5 text-base font-semibold text-primary group-hover:gap-2">
                            이 케이스 열기
                            <ArrowRight className="size-4" />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-5 py-20 text-center sm:px-8 sm:py-24">
          <h2 className="max-w-3xl font-display text-3xl leading-snug text-ink sm:text-4xl">
            답이 틀린 게 아니라,
            <br />
            뜻이 안 맞은 겁니다
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            모델이 더 똑똑해져도, 사람이 안 맞춘 애매함은 조용히 채워져요.
            IntentSpec은 그걸 멈추고, 대화를 합의로 바꿉니다.
          </p>
        </div>
      </section>

      <footer className="border-t border-border/70 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <SphereMark size="footer" />
            <p className="font-display text-xl text-ink">IntentSpec</p>
          </div>
          <p>.EXE-THON</p>
        </div>
      </footer>
    </main>
  );
}
