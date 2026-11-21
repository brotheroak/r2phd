import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { CLARIFY_DOMAINS } from "@/lib/clarify";

const SCOPES = [
  {
    ...CLARIFY_DOMAINS[0],
    href: "/console/semantic?tab=analyze&case=payroll",
    example:
      "「급여 원천세가 홈택스랑 안 맞아」·「SAP 부가세 합이 달라」→ 기간·세금코드·키를 고른 뒤 SQL 잠금",
    gap: "틀리면 신고·지급이 틀어지는 숫자와, AI가 편의로 고른 날짜·조인의 간극",
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
      <header className="relative min-h-[88svh] overflow-hidden sm:min-h-[92svh]">
        <div className="pointer-events-none absolute inset-0 grid-atmosphere" />
        <div className="pointer-events-none absolute inset-x-0 top-[42%] h-px pipe-flow opacity-80" />
        <div className="pointer-events-none absolute inset-x-[8%] top-[38%] h-24 rounded-full bg-[radial-gradient(circle,rgba(12,74,69,0.14),transparent_70%)] blur-2xl" />

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
              href="/console/semantic?tab=analyze&case=payroll"
              className="hidden rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground sm:inline"
            >
              분석 콘솔
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col justify-center px-4 pb-14 pt-8 sm:px-6 sm:pt-12 lg:min-h-[calc(88svh-5rem)] lg:pb-20">
          <p className="rise-in inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.18em] text-primary uppercase">
            <Sparkles className="size-3.5" />
            Communication first
          </p>
          <h1 className="rise-in-delay-1 mt-4 max-w-4xl font-display text-[2.45rem] leading-[1.12] text-ink sm:text-6xl sm:leading-[1.08] lg:text-7xl">
            결국 문제는 소통입니다.
            <br />
            뜻이 맞으면 일이 풀립니다
          </h1>
          <p className="rise-in-delay-2 mt-6 max-w-xl text-base leading-relaxed text-foreground/80 sm:text-lg">
            애매한 말을 선택지로 구체화하고, 서로 같은 뜻을 맞춘 뒤에야
            분석·조사·추천으로 넘어갑니다. 세무·회계·급여처럼 틀리면 안 되는
            숫자도 같은 흐름입니다.
          </p>

          <div className="rise-in-delay-2 mt-8 max-w-3xl overflow-hidden rounded-2xl border border-border bg-card/90 p-4 shadow-sm backdrop-blur-sm">
            <p className="mb-3 text-center text-[11px] font-semibold tracking-wide text-muted-foreground">
              소통 → 합의 → 실행
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-semibold sm:text-xs">
              {FLOW.map((n, i) => (
                <span key={n.t} className="inline-flex items-center gap-1.5">
                  <span className={`rounded-full px-2.5 py-1.5 ${n.c}`}>
                    {n.t}
                  </span>
                  {i < FLOW.length - 1 ? (
                    <span className="text-muted-foreground" aria-hidden>
                      →
                    </span>
                  ) : null}
                </span>
              ))}
            </div>
          </div>

          <div className="rise-in-delay-2 mt-6 flex flex-wrap gap-3">
            <Link
              href="/console/semantic?tab=analyze&case=payroll"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              급여·원천 사례로 콘솔 열기
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/console/semantic?tab=analyze&case=vat"
              className="inline-flex h-10 items-center rounded-lg border border-border bg-card/80 px-4 text-sm font-medium text-foreground backdrop-blur-sm hover:bg-card"
            >
              SAP↔홈택스 부가세
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="font-display text-2xl text-ink sm:text-3xl">
          같은 소통, 세 현장
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          데이터 분석 콘솔은 품질 지표뿐 아니라, SAP·홈택스·급여처럼 한 줄이 틀려도
          비용이 되는 숫자에도 같은 게이트를 붙입니다.
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
