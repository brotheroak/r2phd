"use client";

import { ScopeShell } from "@/components/scope-shell";
import { ClarifyWorkspace } from "@/components/clarify-workspace";

export default function EverydayClarifyPage() {
  return (
    <ScopeShell
      eyebrow="Case · Everyday"
      title="일상 질문"
      subtitle="주말·점심·선물처럼 막연한 말도, 목적·제약·기준·다음을 고른 뒤에 추천해요."
    >
      <ClarifyWorkspace fixedDomain="everyday" />
    </ScopeShell>
  );
}
