import Link from "next/link";
import { ArrowDownRight, GitBranch, SearchCheck, Shield } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { Workspace } from "@/components/workspace";

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
            <span className="hidden text-xs text-muted-foreground md:inline">
              .EXE-THON
            </span>
          </div>
        </nav>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col justify-center px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:min-h-[calc(100svh-5rem)] lg:pb-24">
          <p className="rise-in text-sm font-medium text-primary">
            IntentSpec
          </p>
          <h1 className="rise-in-delay-1 mt-4 max-w-4xl font-display text-[2.55rem] leading-[1.2] text-ink sm:text-6xl sm:leading-[1.15] lg:text-7xl">
            잘 돌아가는 분석이
            <br />
            틀린 답을 줄 때
          </h1>
          <p className="rise-in-delay-2 mt-6 max-w-lg text-base leading-[1.75] text-foreground/80 sm:text-lg">
            ‘최근’이 시험일인지 적재일인지, 같은 제조번호가 같은 로트인지부터
            정리합니다. 기준을 정한 다음 SQL을 만들고, 결과도 다시 맞춰 봅니다.
          </p>
          <div className="rise-in-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              href="#workspace"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              예제 돌려보기
              <ArrowDownRight className="size-4" />
            </Link>
            <Link
              href="#why"
              className="inline-flex h-10 items-center rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm hover:bg-accent/40"
            >
              만든 이유
            </Link>
          </div>

          <div
            aria-hidden
            className="mt-16 hidden overflow-hidden rounded-2xl border border-border/60 bg-ink shadow-lg lg:block"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 text-[11px] text-white/55">
              <span className="size-2 rounded-full bg-amber" />
              <span>질문 → 기준 확인 → SQL → 결과 점검</span>
              <span className="ml-auto text-amber">기준과 불일치</span>
            </div>
            <div className="grid grid-cols-4 gap-px bg-white/10">
              {[
                { t: "질문", d: "최근 6개월 제조번호별 실패율", tint: "bg-[#0f3d3a]" },
                { t: "문제", d: "적재일 · 번호만 조인 · 재시험합격", tint: "bg-[#3b2a12]" },
                { t: "결정", d: "시험일 · 제품+번호 · 부적합만", tint: "bg-[#0f2f45]" },
                { t: "결과", d: "불일치 점수 84", tint: "bg-[#1a3a24]" },
              ].map((cell) => (
                <div key={cell.t} className={`${cell.tint} px-4 py-5`}>
                  <p className="text-[10px] tracking-wide text-white/45">{cell.t}</p>
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
            title="무엇을 해주나요"
            body="정의서와 표 구조를 보고 헷갈리는 기준을 먼저 짚어 줍니다. 정한 뒤에는 SQL을 만들고, Liner로 참고 자료도 찾습니다."
          />
          <Feature
            tint="tint-amber"
            icon={<Shield className="size-5" />}
            title="시맨틱 레이어"
            body="질문·용어·표를 한 모델로 붙여 봅니다. Databricks처럼 물리 테이블 위에 기준을 올려 두고 SQL로 내려갑니다."
          />
        </div>
      </section>

      <Workspace />

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
