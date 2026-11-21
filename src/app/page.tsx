import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { CLARIFY_DOMAINS } from "@/lib/clarify";

const SCOPES = [
  {
    ...CLARIFY_DOMAINS[0],
    href: "/console/semantic?tab=analyze",
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

export default function HomePage() {
  return (
    <main className="min-h-svh">
      <header className="border-b border-border/70 bg-card/80">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
              IS
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-ink">
                IntentSpec
              </p>
              <p className="text-[11px] text-muted-foreground">
                인간 ↔ AI 소통을 구체화합니다
              </p>
            </div>
          </div>
          <StatusPill />
        </nav>
      </header>

      <section className="border-b border-border/60 bg-[color-mix(in_oklab,var(--mist)_70%,white)]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] text-primary uppercase">
            <Sparkles className="size-3.5" />
            Communication first
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-ink sm:text-5xl">
            결국 문제는 소통입니다.
            <br />
            사람과 AI의 간극을 줄이면
            <br />
            일이 풀리기 시작합니다
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/80 sm:text-base">
            IntentSpec의 핵심은 더 똑똑한 답변이 아닙니다. 애매한 말을 선택지로
            구체화하고, 서로 같은 뜻을 잠근 뒤에야 다음 행동(분석·조사·추천)으로
            넘어가게 하는 <strong className="font-semibold text-ink">소통 에이전트</strong>
            입니다.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                t: "말하다",
                d: "분석·연구·일상의 애매한 질문",
                c: "bg-zinc-800 text-white",
              },
              {
                t: "맞추다",
                d: "목적·제약·기준·다음을 함께 고름",
                c: "bg-violet-500 text-white",
              },
              {
                t: "잠그다",
                d: "같은 뜻으로 합의한 뒤 실행",
                c: "bg-teal-600 text-white",
              },
            ].map((n) => (
              <div key={n.t} className={`rounded-2xl px-4 py-4 ${n.c}`}>
                <p className="text-lg font-semibold">{n.t}</p>
                <p className="mt-1 text-xs opacity-90">{n.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-3 text-center text-[11px] font-semibold tracking-wide text-muted-foreground">
              소통 → 합의 → 실행
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-semibold sm:text-xs">
              {[
                { t: "사람의 말", c: "bg-zinc-700 text-white" },
                { t: "🎯 목적", c: "bg-violet-400 text-violet-950" },
                { t: "🧱 제약", c: "bg-amber-400 text-amber-950" },
                { t: "⚖️ 기준", c: "bg-sky-400 text-sky-950" },
                { t: "🧭 다음", c: "bg-teal-500 text-white" },
                { t: "🔒 같은 뜻", c: "bg-rose-500 text-white" },
                { t: "AI 실행", c: "bg-primary text-primary-foreground" },
              ].map((n, i, arr) => (
                <span key={n.t} className="inline-flex items-center gap-1.5">
                  <span className={`rounded-full px-2.5 py-1.5 ${n.c}`}>
                    {n.t}
                  </span>
                  {i < arr.length - 1 ? (
                    <span className="text-muted-foreground">→</span>
                  ) : null}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          같은 소통, 세 가지 현장
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          마케팅의 한 줄은 “인간–AI 커뮤니케이션”입니다. 아래는 그 간극이 실제로
          터지는 세 장면입니다.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {SCOPES.map((s, i) => (
            <Link
              key={s.id}
              href={s.href}
              className="group flex flex-col rounded-2xl border-2 bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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

      <section className="border-t border-border/60 bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="font-display text-2xl text-ink sm:text-3xl">
            답이 틀린 게 아니라,
            <br />
            뜻이 안 맞은 겁니다
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            모델이 더 똑똑해져도, 사람이 잠그지 않은 애매함은 조용히 채워집니다.
            IntentSpec은 그 채움을 멈추고, 대화를 합의로 바꿉니다. 합의가 쌓이면
            분석도, 연구도, 일상의 결정도 같은 방식으로 풀립니다.
          </p>
        </div>
      </section>

      <footer className="border-t border-border/70 bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-medium text-ink">IntentSpec</p>
          <p>인간 ↔ AI 소통 · 의도 잠금 · .EXE-THON</p>
        </div>
      </footer>
    </main>
  );
}
