"use client";

import { ScopeShell } from "@/components/scope-shell";
import { ClarifyWorkspace } from "@/components/clarify-workspace";

export default function CollabClarifyPage() {
  return (
    <ScopeShell
      eyebrow="Case · Explain intent to LLM"
      title="LLM에게 의도 설명하기"
      subtitle="짧은 지시만 듣고 LLM이 자기 마음대로 실행하는 간극을, 목적·제약·기준으로 잠급니다. 잠금 카드가 지시서가 되기 전에는 실행하지 않습니다."
    >
      <ClarifyWorkspace fixedDomain="collab" />
    </ScopeShell>
  );
}
