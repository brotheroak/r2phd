"use client";

import { ScopeShell } from "@/components/scope-shell";
import { ClarifyWorkspace } from "@/components/clarify-workspace";

export default function EverydayClarifyPage() {
  return (
    <ScopeShell
      eyebrow="Scope 03 · Everyday"
      title="일상 챗봇 질문 구체화"
      subtitle="여행·구매·일정처럼 애매한 일상 질문도 목적·제약·기준·다음 행동을 고르게 합니다. 코어는 동일한 의도 맥락 파악 에이전트입니다."
    >
      <ClarifyWorkspace fixedDomain="everyday" />
    </ScopeShell>
  );
}
