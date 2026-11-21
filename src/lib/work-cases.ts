/**
 * Landing / nav work cases — not limited to three “scopes”.
 * Analysis console scenarios stay separate from soft clarify domains.
 */

export type WorkCase = {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
  example: string;
  gap: string;
  href: string;
  swatch: string;
  kind: "analysis" | "clarify";
};

/** Concrete cases shown on the home page (order = display order). */
export const WORK_CASES: WorkCase[] = [
  {
    id: "quality",
    label: "품질·로트 분석",
    emoji: "📊",
    blurb: "실패율·기간·키를 SQL 전에 잠금",
    example: "「최근 실패율이 왜 올랐지?」→ 시험일·복합키·FAIL 정의 확정",
    gap: "사람이 말한 ‘최근’과 모델이 고른 날짜 컬럼의 간극",
    href: "/console/semantic?tab=analyze&case=quality",
    swatch: "#0f6b63",
    kind: "analysis",
  },
  {
    id: "sap",
    label: "SAP RFC·EAI 연동",
    emoji: "🔗",
    blurb: "메타·스키마가 갈라진 연동 의도만 잠금",
    example: "「RFC로 뽑아 EAI로 넣었는데 숫자가 안 맞아」→ 진실 원천·stale 맵·동기 시각",
    gap: "필드 이름만 같고 뜻이 다른 시스템 간 간극",
    href: "/console/semantic?tab=analyze&case=sap",
    swatch: "#1d4ed8",
    kind: "analysis",
  },
  {
    id: "vat",
    label: "부가세·홈택스 대조",
    emoji: "🧾",
    blurb: "신고 전 SAP↔홈택스 차이 기준 잠금",
    example: "「이번 달 부가세가 안 맞는다」→ 귀속월·세금코드·대조 범위",
    gap: "전표 전기일과 신고 귀속월이 어긋나는 간극",
    href: "/console/semantic?tab=analyze&case=vat",
    swatch: "#b45309",
    kind: "analysis",
  },
  {
    id: "payroll",
    label: "급여·원천세",
    emoji: "💸",
    blurb: "지급·신고 전 원천 대조 기준 잠금",
    example: "「원천세와 홈택스가 안 맞아」→ 귀속월·임금유형·확정 범위",
    gap: "급여대장·원천징수·신고액 세 갈래 숫자",
    href: "/console/semantic?tab=analyze&case=payroll",
    swatch: "#be185d",
    kind: "analysis",
  },
  {
    id: "research",
    label: "연구·조사",
    emoji: "🔬",
    blurb: "논문·자료 탐색 전에 범위·근거 고르기",
    example: "「재시험 합격을 실패로 볼까?」→ 범위·근거·주장 강도·다음 산출물",
    gap: "연구자가 묻고 싶은 것과 챗봇이 넓게 답하는 간극",
    href: "/clarify/research",
    swatch: "#0284c7",
    kind: "clarify",
  },
  {
    id: "everyday",
    label: "일상 질문",
    emoji: "💬",
    blurb: "여행·구매·일정처럼 애매한 일상 요청",
    example: "「주말에 뭐 하지?」→ 목적·제약·기준·다음 행동",
    gap: "막연한 일상 말과 AI 추천이 엇갈리는 간극",
    href: "/clarify/everyday",
    swatch: "#d97706",
    kind: "clarify",
  },
  {
    id: "collab",
    label: "LLM에게 의도 설명하기",
    emoji: "🤝",
    blurb: "LLM이 자기 마음대로 고치기 전에 뜻을 고르기",
    example:
      "「CTA는 케이스 쪽으로」「세 현장이 아니다」「이 케이스도 넣어」→ 합의 잠금 전에는 코드를 손대지 않기",
    gap: "질문만 듣고 바로 실행해서, 사람이 원한 뜻과 결과물이 계속 어긋나는 간극",
    href: "/clarify/collab",
    swatch: "#7c3aed",
    kind: "clarify",
  },
];
