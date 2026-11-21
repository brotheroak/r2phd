import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { CLARIFY_DOMAINS } from "@/lib/clarify";

const SCOPES = [
  {
    ...CLARIFY_DOMAINS[0],
    href: "/console/semantic?tab=analyze&case=quality",
    example: "「최근 실패율이 왜 올랐지?」→ 기간·키·실패 정의를 고른 뒤 SQL 잠금",
    gap: "사람이 말한 ‘최근’과 모델이 고른 날짜 컬럼의 간극",
  },
  {
    ...CLARIFY_DOMAINS[1],
    href: "/clarify/research",
    example: "「재시험 합격을 실패로 볼까?」→ 범위·근거·주장 강도·다음 산출물",
    gap: "연구자가 묻고 싶은 것과 챗봇이 넓게 답하는 간극",
  },
  {
    ...CLARIFY_DOMAINS[2],
    href: "/clarify/everyday",
    example: "「주말에 뭐 하지?」→ 목적·제약·기준·다음 행동을 색 카드로",
    gap: "막연한 일상 말과 AI 추천이 엇갈리는 간극",
  },
] as const;

const FLOW = [
  { emoji: "💬", label: "사람의 말", tint: "bg-zinc-800 text-white" },
  { emoji: "🎯", label: "목적", tint: "bg-violet-500 text-white" },
  { emoji: "🧱", label: "제약", tint: "bg-amber-400 text-amber-950" },
  { emoji: "⚖️", label: "기준", tint: "bg-sky-400 text-sky-950" },
  { emoji: "🧭", label: "다음", tint: "bg-teal-500 text-white" },
  { emoji: "🔒", label: "같은 뜻", tint: "bg-rose-500 text-white" },
  { emoji: "⚡", label: "AI 실행", tint: "bg-primary text-primary-foreground" },
] as const;

export default function HomePage() {
  return (
    <main>
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-atmosphere" />
        <div className="pointer-events-none absolute inset-x-0 top-[36%] h-px pipe-flow opacity-70" />

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
            <Link
              href="/console/semantic?tab=analyze&case=quality"
              className="hidden rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground sm:inline"
            >
              분석 콘솔
            </Link>
          </div>
        </nav>

        {/* Copy band */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
          <p className="rise-in inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.18em] text-primary uppercase">
            <Sparkles className="size-3.5" />
            Communication first
          </p>
          <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="rise-in-delay-1 max-w-3xl font-display text-[2.5rem] leading-[1.1] text-ink sm:text-6xl sm:leading-[1.05] lg:text-7xl">
              결국 문제는 소통입니다.
              <br />
              뜻이 맞으면 일이 풀립니다
            </h1>
            <div className="rise-in-delay-2 max-w-md shrink-0 space-y-5 lg:pb-2">
              <p className="text-base leading-relaxed text-foreground/80 sm:text-lg">
                애매한 말을 선택지로 구체화하고, 서로 같은 뜻을 맞춘 뒤에야
                분석·조사·추천으로 넘어갑니다.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/console/semantic?tab=analyze&case=quality"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  분석 콘솔 열기
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/clarify/research"
                  className="inline-flex h-11 items-center rounded-lg border border-border bg-card/80 px-5 text-sm font-medium text-foreground backdrop-blur-sm hover:bg-card"
                >
                  연구 구체화
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Full-bleed flow — nearly edge-to-edge */}
        <div className="relative z-10 mt-14 w-full px-2 pb-16 sm:px-3 sm:pb-20">
          <p className="mb-5 text-center text-sm font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            소통 → 합의 → 실행
          </p>
          <div className="rise-in-delay-2 grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5 lg:grid-cols-7 lg:gap-2">
            {FLOW.map((step, i) => (
              <div key={step.label} className="relative min-w-0">
                <div
                  className={`flex h-full min-h-[9.5rem] flex-col items-center justify-center rounded-2xl px-1.5 py-6 text-center shadow-sm sm:min-h-[11rem] lg:min-h-[12rem] ${step.tint}`}
                >
                  <span className="text-3xl sm:text-4xl" aria-hidden>
                    {step.emoji}
                  </span>
                  <span className="mt-4 font-display text-[1.65rem] leading-none tracking-tight sm:text-3xl lg:text-[2.15rem]">
                    {step.label}
                  </span>
                </div>
                {i < FLOW.length - 1 ? (
                  <span
                    className="pointer-events-none absolute top-1/2 -right-1.5 z-10 hidden -translate-y-1/2 text-xl font-bold text-ink/35 lg:block"
                    aria-hidden
                  >
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="font-display text-2xl text-ink sm:text-3xl">
          같은 소통, 세 현장
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          분석·연구·일상 — 현장이 달라도 같은 패턴으로 뜻을 맞춥니다.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {SCOPES.map((s, i) => (
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
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-ink">{s.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{s.blurb}</p>
              <p className="mt-3 rounded-lg border border-dashed border-border px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                간극 · {s.gap}
              </p>
              <p className="mt-3 flex-1 rounded-xl bg-mist/80 px-3 py-2.5 text-xs leading-relaxed text-foreground">
                <span className="font-semibold">예 · </span>
                {s.example}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2">
                이 현장에서 소통하기
                <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
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
