"use client";

import { ScopeShell } from "@/components/scope-shell";
import { ClarifyWorkspace } from "@/components/clarify-workspace";

export default function CollabClarifyPage() {
  return (
    <ScopeShell
      eyebrow="Case · Explain intent to LLM"
      title="AI한테 원하는 거 말하기"
      subtitle="『고쳐 줘』만 말했더니 엉뚱하게 바뀌었을 때. 목적·제약·기준을 고른 뒤에야 실행해요. 확정 카드가 나오기 전에는 손대지 않아요."
    >
      <ClarifyWorkspace fixedDomain="collab" />
    </ScopeShell>
  );
}
