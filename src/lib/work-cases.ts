/**
 * Landing work cases — general, verifiable situations.
 * Console is a separate entry; cases are situations you can open and test.
 */

export type WorkCaseCategory = {
  id: string;
  label: string;
  blurb: string;
};

export type WorkCase = {
  id: string;
  categoryId: WorkCaseCategory["id"];
  label: string;
  emoji: string;
  blurb: string;
  example: string;
  gap: string;
  href: string;
  swatch: string;
  kind: "analysis" | "clarify";
};

export const WORK_CASE_CATEGORIES: WorkCaseCategory[] = [
  {
    id: "human-ai",
    label: "사람 ↔ AI",
    blurb: "지시가 짧거나 애매할 때, 실행 전에 뜻을 고릅니다.",
  },
  {
    id: "inquiry",
    label: "조사 · 분석",
    blurb: "답을 찾기 전에 범위·정의·근거를 맞춥니다.",
  },
  {
    id: "ops",
    label: "운영 · 연동",
    blurb: "여러 시스템·숫자가 갈릴 때 기준을 잠급니다.",
  },
];

export const WORK_CASES: WorkCase[] = [
  {
    id: "collab",
    categoryId: "human-ai",
    label: "LLM에게 의도 설명하기",
    emoji: "🤝",
    blurb: "짧은 지시로 바로 실행되기 전에 뜻을 고르기",
    example:
      "「이거 좀 고쳐 줘」만 말했더니 다른 방향으로 바뀌었다 → 목적·제약·기준을 고른 뒤 실행",
    gap: "짧은 지시만 듣고 바로 실행해, 원한 뜻과 결과물이 어긋나는 간극",
    href: "/clarify/collab",
    swatch: "#7c3aed",
    kind: "clarify",
  },
  {
    id: "everyday",
    categoryId: "human-ai",
    label: "일상 질문",
    emoji: "💬",
    blurb: "여행·구매·일정처럼 애매한 일상 요청",
    example:
      "「주말에 뭐 하지?」→ 목적·시간·예산·다음 행동을 고른 뒤 추천",
    gap: "막연한 말과 AI 추천이 서로 다른 기준을 쓰는 간극",
    href: "/clarify/everyday",
    swatch: "#d97706",
    kind: "clarify",
  },
  {
    id: "research",
    categoryId: "inquiry",
    label: "연구 · 조사",
    emoji: "🔬",
    blurb: "자료를 찾기 전에 범위와 근거를 고르기",
    example:
      "「고객 불만에서 ‘품질’이 무엇을 뜻하는지 조사」→ 범위·근거·다음 산출물 확정",
    gap: "좁히고 싶은 질문과 넓게 답하는 조사 결과의 간극",
    href: "/clarify/research",
    swatch: "#0284c7",
    kind: "clarify",
  },
  {
    id: "quality",
    categoryId: "inquiry",
    label: "데이터 정의 맞추기",
    emoji: "📊",
    blurb: "지표·기간·집계 키를 숫자 보기 전에 잠그기",
    example:
      "「최근 불량률이 왜 올랐지?」→ ‘최근’·제품 키·불량 정의를 확정한 뒤 SQL",
    gap: "사람이 말한 말과 모델이 고른 컬럼·필터의 간극",
    href: "/console/semantic?tab=analyze&case=quality",
    swatch: "#0f6b63",
    kind: "analysis",
  },
  {
    id: "sap",
    categoryId: "ops",
    label: "시스템 연동",
    emoji: "🔗",
    blurb: "서로 다른 시스템의 필드 뜻을 맞추기",
    example:
      "「연동했는데 숫자가 안 맞아」→ 어느 시스템을 기준할지·매핑이 유효한지 잠금",
    gap: "이름만 같고 뜻이 다른 필드·스키마 사이의 간극",
    href: "/console/semantic?tab=analyze&case=sap",
    swatch: "#1d4ed8",
    kind: "analysis",
  },
  {
    id: "finance",
    categoryId: "ops",
    label: "재무 · 세무 대조",
    emoji: "🧾",
    blurb: "신고·지급 전, 갈라진 숫자 기준을 잠그기",
    example:
      "「장부와 신고 액이 안 같아」→ 귀속 기간·코드·대조 범위를 확정",
    gap: "장부·신고 화면·지급 장표가 서로 다른 ‘맞음’을 쓰는 간극",
    href: "/console/semantic?tab=analyze&case=vat",
    swatch: "#b45309",
    kind: "analysis",
  },
];

export function casesByCategory(categoryId: string): WorkCase[] {
  return WORK_CASES.filter((c) => c.categoryId === categoryId);
}
