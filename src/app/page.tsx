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
        <div className="pointer-events-none absolute inset-x-[8%] top-[38%] h-24 rounded-full bg-[radial-gradient(circle,rgba(196,92,38,0.18),transparent_70%)] blur-2xl" />

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
              .EXE-THON 출품용
            </span>
          </div>
        </nav>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col justify-center px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:min-h-[calc(100svh-5rem)] lg:pb-24">
          <p className="rise-in text-sm font-medium tracking-[0.2em] text-primary uppercase">
            IntentSpec
          </p>
          <h1 className="rise-in-delay-1 mt-4 max-w-4xl font-display text-[2.6rem] leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
            분석은 돌아갔는데,
            <br />
            연구 의도는 깨졌습니다.
          </h1>
          <p className="rise-in-delay-2 mt-6 max-w-xl text-base leading-relaxed text-foreground/80 sm:text-lg">
            용어·날짜·식별자가 자료마다 다를 때, IntentSpec이 모호함을 연구자에게
            묻고 명세·SQL·검증으로 잠근 뒤 결과의 의도 드리프트를 드러냅니다.
          </p>
          <div className="rise-in-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              href="#workspace"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              가상 시나리오로 시연
              <ArrowDownRight className="size-4" />
            </Link>
            <Link
              href="#why"
              className="inline-flex h-9 items-center rounded-lg bg-secondary px-3 text-sm font-medium text-secondary-foreground hover:opacity-90"
            >
              왜 필요한가
            </Link>
          </div>

          <div
            aria-hidden
            className="mt-16 hidden overflow-hidden rounded-2xl border border-white/10 bg-ink lg:block"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 text-[11px] text-white/50">
              <span className="size-2 rounded-full bg-signal/80" />
              <span>intent → schema → sql → audit</span>
              <span className="ml-auto font-mono">drift detected</span>
            </div>
            <div className="grid grid-cols-4 gap-px bg-white/10">
              {[
                { t: "질문", d: "최근 6개월 제조번호별 실패율" },
                { t: "함정", d: "적재일·단독 lot·재시험합격" },
                { t: "고정", d: "test_date + 복합키 + FAIL만" },
                { t: "감사", d: "의도 드리프트 점수 84" },
              ].map((cell) => (
                <div key={cell.t} className="bg-ink px-4 py-5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                    {cell.t}
                  </p>
                  <p className="mt-2 font-display text-lg text-white/90">{cell.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section id="why" className="border-y border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3">
          <Feature
            icon={<SearchCheck className="size-5" />}
            title="경험에서 온 병목"
            body="LLM SQL은 성공 응답을 잘 줍니다. 리뷰어는 제조번호 범위, ‘최근’의 날짜 필드, 실패 정의를 사람이 다시 대조해야 합니다."
          />
          <Feature
            icon={<GitBranch className="size-5" />}
            title="노하우를 실행"
            body="정의서·스키마에서 개념을 연결하고, 충돌은 연구자 확인으로 고정한 뒤 명세와 검증 가능한 SQL을 만듭니다. Liner Model + Scholar가 핵심입니다."
          />
          <Feature
            icon={<Shield className="size-5" />}
            title="문제 해결 입증"
            body="겉보기 정상 결과 CSV를 감사해 날짜·식별자·중복 집계 드리프트를 점수로 보여 줍니다. 회의 전에 ‘틀린 숫자’를 걸러냅니다."
          />
        </div>
      </section>

      <Workspace />

      <footer className="border-t border-border/60 bg-ink text-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-display text-xl text-white">IntentSpec</p>
          <p>
            Liner Model API · Liner Scholar Search · 가상 데이터만 사용 · .EXE-THON
          </p>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
