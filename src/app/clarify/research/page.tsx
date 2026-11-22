"use client";

import { ScopeShell } from "@/components/scope-shell";
import { ClarifyWorkspace } from "@/components/clarify-workspace";

export default function ResearchClarifyPage() {
  return (
    <ScopeShell
      eyebrow="Case · Research"
      title="연구 · 조사"
      subtitle="고객 불만·후기 글을 그대로 넣으면, 『품질』처럼 애매한 말부터 나눠서 조사 범위를 정해요."
    >
      <ClarifyWorkspace fixedDomain="research" />
    </ScopeShell>
  );
}
