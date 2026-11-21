import Link from "next/link";
import {
  ArrowDownRight,
  GitBranch,
  Layers3,
  SearchCheck,
} from "lucide-react";
import { StatusPill } from "@/components/status-pill";

export default function HomePage() {
  return (
    <main>
      <header className="relative min-h-[100svh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-atmosphere" />
        <div className="pointer-events-none absolute inset-x-0 top-[42%] h-px pipe-flow opacity-80" />
        <div className="pointer-events-none absolute inset-x-[8%] top-[38%] h-24 rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.2),transparent_70%)] blur-2xl" />

        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl tracking-tight text-ink sm:text-3xl">
              IntentSpec
            </span>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              의도명세
            </span>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill />
            <Link
              href="/console"
              className="rounded-xl bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              콘솔 열기
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col justify-center px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:min-h-[calc(100svh-5rem)] lg:pb-24">
          <p className="rise-in text-sm font-medium text-primary">IntentSpec</p>
          <h1 className="rise-in-delay-1 mt-4 max-w-4xl font-display text-[2.55rem] leading-[1.2] text-ink sm:text-6xl sm:leading-[1.15] lg:text-7xl">
            잘 돌아가는 분석이
            <br />
            틀린 답을 줄 때
          </h1>
          <p className="rise-in-delay-2 mt-6 max-w-lg text-base leading-[1.75] text-foreground/80 sm:text-lg">
            소개 페이지입니다. 실제 작업은 콘솔에서 합니다. 분석 콘솔에서 기준을
            정하고, 시맨틱 레이어 콘솔에서 용어·표·지표를 붙여 봅니다.
          </p>
          <div className="rise-in-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              href="/console"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              분석 콘솔
              <ArrowDownRight className="size-4" />
            </Link>
            <Link
              href="/console/semantic"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm hover:bg-accent/40"
            >
              <Layers3 className="size-4" />
              시맨틱 레이어
            </Link>
          </div>

          <div
            aria-hidden
            className="mt-16 hidden overflow-hidden rounded-2xl border border-border/60 bg-ink shadow-lg lg:block"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 text-[11px] text-white/55">
              <span className="size-2 rounded-full bg-amber" />
              <span>소개 → 분석 콘솔 → 시맨틱 레이어</span>
              <span className="ml-auto text-amber">.EXE-THON</span>
            </div>
            <div className="grid grid-cols-3 gap-px bg-white/10">
              {[
                {
                  t: "소개",
                  d: "문제와 흐름을 짧게 보여 줍니다",
                  tint: "bg-[#0f3d3a]",
                },
                {
                  t: "분석 콘솔",
                  d: "질문 · 기준 · SQL · 결과 점검",
                  tint: "bg-[#0f2f45]",
                },
                {
                  t: "시맨틱 레이어",
                  d: "카탈로그 · 온톨로지 · 지표",
                  tint: "bg-[#3b2a12]",
                },
              ].map((cell) => (
                <div key={cell.t} className={`${cell.tint} px-4 py-5`}>
                  <p className="text-[10px] tracking-wide text-white/45">
                    {cell.t}
                  </p>
                  <p className="mt-2 font-display text-lg leading-snug text-white/95">
                    {cell.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section id="why" className="border-y border-border/60 bg-card/50">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-16 sm:px-6 md:grid-cols-3">
          <Feature
            tint="tint-teal"
            icon={<SearchCheck className="size-5" />}
            title="어디서 막히나요"
            body="쿼리는 잘 돌아가고 숫자도 나옵니다. 그래도 회의 전에 ‘이거 맞나?’ 싶어 다시 들여다보게 되죠."
          />
          <Feature
            tint="tint-sky"
            icon={<GitBranch className="size-5" />}
            title="분석 콘솔"
            body="정의서와 표 구조를 보고 헷갈리는 기준을 먼저 짚습니다. 정한 뒤에는 SQL을 만들고 결과도 맞춰 봅니다."
          />
          <Feature
            tint="tint-amber"
            icon={<Layers3 className="size-5" />}
            title="시맨틱 레이어"
            body="별도 콘솔에서 카탈로그·온톨로지 매핑·지표를 봅니다. 물리 테이블 위에 기준을 올려 두는 화면입니다."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="panel tint-teal p-8 sm:p-10">
          <p className="text-sm text-primary">시작하기</p>
          <h2 className="mt-2 font-display text-3xl text-ink">
            콘솔에서 예제를 돌려 보세요
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/75">
            로트 실패율 가상 데이터가 준비되어 있습니다. 분석 콘솔에서 기준을 정한
            뒤, 시맨틱 레이어에서 매핑이 어떻게 붙는지 확인하면 됩니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/console"
              className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              분석 콘솔 열기
            </Link>
            <Link
              href="/console/semantic"
              className="inline-flex h-10 items-center rounded-xl border border-border bg-white/80 px-4 text-sm font-medium"
            >
              시맨틱 레이어만 보기
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-ink text-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-display text-xl text-white">IntentSpec</p>
          <p>Liner Model · Scholar 검색 · 가상 데이터 · .EXE-THON</p>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
  tint,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tint: string;
}) {
  return (
    <div className={`panel ${tint} p-6`}>
      <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-white/70 text-primary shadow-sm">
        {icon}
      </div>
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-[1.7] text-foreground/75">{body}</p>
    </div>
  );
}
