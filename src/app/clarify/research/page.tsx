"use client";

import { ScopeShell } from "@/components/scope-shell";
import { ClarifyWorkspace } from "@/components/clarify-workspace";

export default function ResearchClarifyPage() {
  return (
    <ScopeShell
      eyebrow="Scope 02 · Research"
      title="연구·조사 질문 구체화"
      subtitle="문헌 탐색·가설 대화 전에 범위·근거·주장 강도·다음 산출물을 색 선택지로 고릅니다. 돌아가는 건 같은 의도 구체화 에이전트입니다."
    >
      <ClarifyWorkspace fixedDomain="research" />
    </ScopeShell>
  );
}
