"use client";

import { ScopeShell } from "@/components/scope-shell";
import { ClarifyWorkspace } from "@/components/clarify-workspace";

export default function ResearchClarifyPage() {
  return (
    <ScopeShell
      eyebrow="Case · Research"
      title="연구 · 조사"
      subtitle="자료를 찾기 전에 범위·근거·다음 산출물을 고릅니다. 잠그기 전에는 조사 결과를 확정하지 않습니다."
    >
      <ClarifyWorkspace fixedDomain="research" />
    </ScopeShell>
  );
}
