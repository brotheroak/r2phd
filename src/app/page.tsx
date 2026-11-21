import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { CLARIFY_DOMAINS } from "@/lib/clarify";

const SCOPES = [
  {
    ...CLARIFY_DOMAINS[0],
    href: "/console/semantic?tab=analyze",
    example: "「최근 실패율이 왜 올랐지?」→ 기간·키·실패 정의를 고른 뒤 SQL 잠금",
    agent: "분석 게이트 에이전트 · 기준 잠금 전 반출 불가",
  },
  {
    ...CLARIFY_DOMAINS[1],
    href: "/clarify/research",
    example: "「재시험 합격을 실패로 볼까?」→ 범위·근거·주장 강도·다음 산출물",
    agent: "연구 인터뷰 에이전트 · 문헌 챗 전에 방향 고정",
  },
  {
    ...CLARIFY_DOMAINS[2],
    href: "/clarify/everyday",
    example: "「주말에 뭐 하지?」→ 목적·제약·기준·다음 행동을 색 카드로",
    agent: "일상 맥락 에이전트 · 애매한 추천 질문 구체화",
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
                핵심 무기 · 의도 구체화 에이전트
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
            One agent · three scopes
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-ink sm:text-5xl">
            애매한 질문을 선택지로 구체화하는
            <br />
            에이전트가 제품의 핵심입니다
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80 sm:text-base">
            데이터 분석 콘솔, 연구 챗, 일상 챗봇 모두 같은 무기입니다. 목적·제약·기준·다음을
            고르게 한 뒤 잠그고, 잠그기 전에는 답을 확정하지 않습니다.
          </p>

          {/* Core agent diagram */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-3 text-center text-[11px] font-semibold tracking-wide text-muted-foreground">
              코어 에이전트 루프
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-semibold sm:text-xs">
              {[
                { t: "애매한 질문", c: "bg-zinc-700 text-white" },
                { t: "🎯 목적", c: "bg-violet-400 text-violet-950" },
                { t: "🧱 제약", c: "bg-amber-400 text-amber-950" },
                { t: "⚖️ 기준", c: "bg-sky-400 text-sky-950" },
                { t: "🧭 다음", c: "bg-teal-500 text-white" },
                { t: "🔒 잠금 카드", c: "bg-rose-500 text-white" },
              ].map((n, i, arr) => (
                <span key={n.t} className="inline-flex items-center gap-1.5">
                  <span className={`rounded-full px-2.5 py-1.5 ${n.c}`}>{n.t}</span>
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
          적용 범위 3가지
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          각각 전용 페이지 · 안에서 돌아가는 구체화 에이전트가 동일합니다
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
              <p className="mt-4 flex-1 rounded-xl bg-mist/80 px-3 py-2.5 text-xs leading-relaxed text-foreground">
                <span className="font-semibold">예 · </span>
                {s.example}
              </p>
              <p className="mt-3 text-[11px] font-medium" style={{ color: s.swatch }}>
                {s.agent}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2">
                페이지 열기
                <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/70 bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-medium text-ink">IntentSpec</p>
          <p>의도 구체화 에이전트 · Liner Model · .EXE-THON</p>
        </div>
      </footer>
    </main>
  );
}
