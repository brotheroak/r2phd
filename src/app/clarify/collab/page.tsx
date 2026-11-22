"use client";

import { ScopeShell } from "@/components/scope-shell";
import { ClarifyWorkspace } from "@/components/clarify-workspace";

export default function CollabClarifyPage() {
  return (
    <ScopeShell
      eyebrow="Case · Explain intent to LLM"
      title="AI한테 원하는 거 말하기"
      subtitle="『화면 좀 고쳐 줘』처럼 짧은 지시를 그대로 넣으면, 어디서 헷갈리는지 나눠서 고른 뒤에야 실행해요."
    >
      <ClarifyWorkspace fixedDomain="collab" />
    </ScopeShell>
  );
}
