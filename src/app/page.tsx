import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
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
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-atmosphere" />
        <div className="pointer-events-none absolute inset-x-0 top-[40%] h-px pipe-flow opacity-70" />

        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-2xl tracking-tight text-ink sm:text-3xl">
              IntentSpec
            </span>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              인간 ↔ AI 소통
            </span>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill />
            <a
              href="#cases"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              케이스
            </a>
            <Link
              href="/console/semantic?tab=analyze&case=quality"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
            >
              콘솔 접속
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
          <p className="rise-in inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.18em] text-primary uppercase">
            <Sparkles className="size-3.5" />
            Communication first
          </p>

          <h1 className="rise-in-delay-1 mt-4 font-display text-[2.5rem] leading-[1.15] text-ink sm:text-6xl sm:leading-[1.12] lg:text-7xl lg:leading-[1.1]">
            결국 문제는 소통입니다.
            <br />
            뜻이 맞으면 일이 풀립니다
          </h1>
          <p className="rise-in-delay-2 mt-5 max-w-2xl text-base leading-relaxed text-foreground/80 sm:text-lg">
            애매한 말을 선택지로 구체화하고, 서로 같은 뜻을 맞춘 뒤에야
            분석·조사·추천·실행으로 넘어갑니다.
          </p>

          <div className="rise-in-delay-2 mt-14">
            <h2 className="text-center font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
              소통 → 합의 → 실행
            </h2>
            <div className="mt-7 w-full rounded-2xl border border-border bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-8">
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 sm:gap-x-2.5">
                {FLOW.map((n, i) => (
                  <span key={n.t} className="inline-flex items-center gap-2 sm:gap-2.5">
                    <span
                      className={`rounded-full px-4 py-2.5 text-[15px] font-semibold sm:px-5 sm:py-3 sm:text-lg ${n.c}`}
                    >
                      {n.t}
                    </span>
                    {i < FLOW.length - 1 ? (
                      <span
                        className="text-lg font-semibold text-muted-foreground sm:text-xl"
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

      <section id="cases" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              같은 소통, 여러 케이스
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              사람↔AI · 조사·분석 · 운영·연동 — 검증 가능한 일반 상황으로
              뜻을 맞춥니다. IntentSpec 콘솔은 케이스와 별도로 들어갑니다.
            </p>
          </div>
          <Link
            href="/console/semantic?tab=analyze&case=quality"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            IntentSpec 콘솔 접속
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {WORK_CASES.map((c) => (
            <Link
              key={`cta-${c.id}`}
              href={c.href}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-mist/60"
            >
              <span aria-hidden>{c.emoji}</span>
              {c.label}
              <ArrowRight className="size-3.5 opacity-50" />
            </Link>
          ))}
        </div>

        <div className="mt-10 space-y-10">
          {WORK_CASE_CATEGORIES.map((cat) => {
            const cases = casesByCategory(cat.id);
            return (
              <div key={cat.id}>
                <div className="mb-4">
                  <h3 className="font-display text-xl text-ink sm:text-2xl">
                    {cat.label}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{cat.blurb}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cases.map((s) => {
                    const n = WORK_CASES.findIndex((c) => c.id === s.id) + 1;
                    return (
                      <Link
                        key={s.id}
                        href={s.href}
                        className="group flex flex-col rounded-2xl border-2 bg-card/90 p-5 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        style={{ borderColor: `${s.swatch}55` }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-2xl">{s.emoji}</span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                            style={{ backgroundColor: s.swatch }}
                          >
                            {String(n).padStart(2, "0")}
                          </span>
                        </div>
                        <h4 className="mt-3 text-lg font-semibold text-ink">
                          {s.label}
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {s.blurb}
                        </p>
                        <p className="mt-3 rounded-lg border border-dashed border-border px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                          간극 · {s.gap}
                        </p>
                        <p className="mt-3 flex-1 rounded-xl bg-mist/80 px-3 py-2.5 text-xs leading-relaxed text-foreground">
                          <span className="font-semibold">예 · </span>
                          {s.example}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2">
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
      </section>

      <section className="border-t border-border/60 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="font-display text-2xl text-ink sm:text-3xl">
            답이 틀린 게 아니라,
            <br />
            뜻이 안 맞은 겁니다
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            모델이 더 똑똑해져도, 사람이 맞추지 않은 애매함은 조용히 채워집니다.
            IntentSpec은 그 채움을 멈추고, 대화를 합의로 바꿉니다.
          </p>
        </div>
      </section>

      <footer className="border-t border-border/70 bg-card/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-display text-lg text-ink">IntentSpec</p>
          <p>인간 ↔ AI 소통 · 의도 잠금 · .EXE-THON</p>
        </div>
      </footer>
    </main>
  );
}
