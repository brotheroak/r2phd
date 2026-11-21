import Link from "next/link";
import {
  ArrowRight,
  GitBranch,
  Layers3,
  SearchCheck,
} from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { Workspace } from "@/components/workspace";

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
                Intent → Spec → Audit
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill />
            <Link
              href="/console/semantic?tab=analyze"
              className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
            >
              콘솔 열기
            </Link>
          </div>
        </nav>
      </header>

      <section className="border-b border-border/60 bg-[color-mix(in_oklab,var(--mist)_70%,white)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-12">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-primary uppercase">
              Analysis console
            </p>
            <h1 className="mt-3 max-w-xl font-display text-3xl leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
              잘 돌아가는 분석이 틀린 답을 줄 때
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-foreground/80 sm:text-base">
              ‘최근’·식별키·실패 정의를 먼저 고정한 뒤 SQL을 만들고, 결과까지
              다시 맞춥니다. 소개와 분석은 여기, 카탈로그·온톨로지는 콘솔에서
              이어집니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/console/semantic?tab=analyze"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground"
              >
                콘솔에서 분석
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="#workspace"
                className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-3.5 text-sm font-medium shadow-sm hover:bg-mist"
              >
                이 페이지에서 예제
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/70 bg-mist/50 px-3 py-2 text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              pipeline · question → confirm → sql → audit
            </div>
            <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
              {[
                { t: "질문", d: "최근 6개월 실패율" },
                { t: "함정", d: "적재일 · 키 충돌" },
                { t: "결정", d: "시험일 · 복합키" },
                { t: "점검", d: "불일치 점수 84" },
              ].map((cell) => (
                <div key={cell.t} className="bg-card px-3 py-3.5">
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    {cell.t}
                  </p>
                  <p className="mt-1 text-sm font-medium leading-snug text-ink">
                    {cell.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-3 px-4 py-8 sm:px-6 md:grid-cols-3">
          <Feature
            icon={<SearchCheck className="size-4" />}
            title="기준 먼저"
            body="쿼리가 돌아가도 ‘최근’·키·실패 정의가 틀리면 답이 틀립니다."
          />
          <Feature
            icon={<GitBranch className="size-4" />}
            title="확인 → SQL"
            body="모호한 기준을 고른 뒤 IntentSpec이 SQL과 점검 포인트를 만듭니다."
          />
          <Feature
            icon={<Layers3 className="size-4" />}
            title="시맨틱 콘솔"
            body="Catalog·Ontology·Metrics에서 표와 용어 연결을 이어 봅니다."
          />
        </div>
      </section>

      <div id="workspace" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm">
          <div className="border-b border-border/70 bg-mist/40 px-4 py-2.5 text-xs text-muted-foreground">
            Workspace · 로컬 세션에 저장됩니다
          </div>
          <div className="p-4 md:p-5">
            <Workspace />
          </div>
        </div>
      </div>

      <footer className="border-t border-border/70 bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-medium text-ink">IntentSpec</p>
          <p>Liner Model · Scholar · 가상 데이터 · .EXE-THON</p>
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
    <div className="rounded-lg border border-border/70 bg-card p-4">
      <div className="mb-2 inline-flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
