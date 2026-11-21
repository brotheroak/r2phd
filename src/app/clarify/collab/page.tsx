"use client";

import { ScopeShell } from "@/components/scope-shell";
import { ClarifyWorkspace } from "@/components/clarify-workspace";

export default function CollabClarifyPage() {
  return (
    <ScopeShell
      eyebrow="Case · Agent collab"
      title="에이전트 티키타카 · 의도 못 읽음"
      subtitle="사람이 「고쳐」라고 하면 에이전트가 지맘대로 실행하는 간극을 목적·제약·기준으로 잠급니다. 잠금 카드가 지시서가 되기 전에는 코드를 건드리지 않습니다."
    >
      <ClarifyWorkspace fixedDomain="collab" />
    </ScopeShell>
  );
}
