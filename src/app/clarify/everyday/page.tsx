"use client";

import { ScopeShell } from "@/components/scope-shell";
import { ClarifyWorkspace } from "@/components/clarify-workspace";

export default function EverydayClarifyPage() {
  return (
    <ScopeShell
      eyebrow="Case · Everyday"
      title="일상 질문"
      subtitle="여행·구매·일정처럼 애매한 요청도 목적·제약·기준·다음 행동을 고른 뒤에 추천합니다."
    >
      <ClarifyWorkspace fixedDomain="everyday" />
    </ScopeShell>
  );
}
