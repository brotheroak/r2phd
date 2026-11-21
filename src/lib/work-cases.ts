/**
 * Landing work cases — situations Korean users recognize and can try.
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
    blurb: "짧게 말했더니 엉뚱한 답이 나올 때, 실행 전에 뜻을 고릅니다.",
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
    blurb: "「고쳐 줘」만 말했더니 다른 방향으로 바뀌었을 때",
    example:
      "화면 좀 고쳐 달라고만 했더니 원하던 것과 다르게 바뀜 → 목적·제약·기준을 고른 뒤 실행",
    gap: "짧은 지시와 AI가 멋대로 해석한 결과 사이의 간극",
    href: "/clarify/collab",
    swatch: "#7c3aed",
    kind: "clarify",
  },
  {
    id: "everyday",
    categoryId: "human-ai",
    label: "일상 질문",
    emoji: "💬",
    blurb: "주말·점심·선물처럼 막연한 일상 추천",
    example:
      "주말에 뭐 하지? → 시간·예산·누구와 가는지·다음 행동을 고른 뒤 추천",
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
    blurb: "자료를 찾기 전에 말의 뜻과 범위를 고르기",
    example:
      "고객 불만의 ‘품질’이 제품·배송·응대 중 무엇인지 → 범위·근거·다음 산출물 확정",
    gap: "좁히고 싶은 질문과 넓게 쏟아지는 조사 결과의 간극",
    href: "/clarify/research",
    swatch: "#0284c7",
    kind: "clarify",
  },
  {
    id: "quality",
    categoryId: "inquiry",
    label: "데이터 정의 맞추기",
    emoji: "📊",
    blurb: "숫자 보기 전에 ‘최근·불량’ 뜻을 잠그기",
    example:
      "최근 불량률이 왜 올랐지? → ‘최근’·제품·불량 정의를 맞춘 뒤 SQL",
    gap: "사람이 한 말과 모델이 고른 컬럼·필터의 간극",
    href: "/console/semantic?tab=analyze&case=quality",
    swatch: "#0f6b63",
    kind: "analysis",
  },
  {
    id: "sap",
    categoryId: "ops",
    label: "시스템 연동",
    emoji: "🔗",
    blurb: "서로 다른 시스템의 같은 이름, 다른 뜻 맞추기",
    example:
      "연동했는데 숫자가 안 맞아 → 어느 시스템을 기준으로 할지·매핑이 맞는지 잠금",
    gap: "이름만 같고 뜻이 다른 필드 사이의 간극",
    href: "/console/semantic?tab=analyze&case=sap",
    swatch: "#1d4ed8",
    kind: "analysis",
  },
  {
    id: "finance",
    categoryId: "ops",
    label: "재무 · 세무 대조",
    emoji: "🧾",
    blurb: "신고·지급 전에 갈라진 숫자 기준 잠그기",
    example:
      "장부와 신고액이 안 같아 → 귀속 기간·코드·대조 범위를 확정",
    gap: "장부·신고 화면·지급 장표가 서로 다른 ‘맞음’을 쓰는 간극",
    href: "/console/semantic?tab=analyze&case=vat",
    swatch: "#b45309",
    kind: "analysis",
  },
];

export function casesByCategory(categoryId: string): WorkCase[] {
  return WORK_CASES.filter((c) => c.categoryId === categoryId);
}
