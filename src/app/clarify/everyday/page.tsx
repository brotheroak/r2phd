"use client";

import { ScopeShell } from "@/components/scope-shell";
import { ClarifyWorkspace } from "@/components/clarify-workspace";

export default function EverydayClarifyPage() {
  return (
    <ScopeShell
      eyebrow="Case · Everyday"
      title="일상 질문"
      subtitle="평소 AI한테 치는 추천 요청을 그대로 넣으면, 시간·돈·기준이 비어 있는 부분을 나눠요."
    >
      <ClarifyWorkspace fixedDomain="everyday" />
    </ScopeShell>
  );
}
