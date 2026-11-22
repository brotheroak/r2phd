/**
 * Landing cases — situations Koreans recognize immediately.
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
    blurb: "짧게 말했더니 엉뚱한 답이 나올 때, 실행 전에 뜻을 골라요.",
  },
  {
    id: "inquiry",
    label: "조사 · 분석",
    blurb: "답을 찾기 전에 범위·정의·근거를 맞춰요.",
  },
  {
    id: "ops",
    label: "운영 · 연동",
    blurb: "여러 시스템·숫자가 갈릴 때 기준을 확정해요.",
  },
];

export const WORK_CASES: WorkCase[] = [
  {
    id: "collab",
    categoryId: "human-ai",
    label: "AI한테 원하는 거 말하기",
    emoji: "🤝",
    blurb: "『화면 좀 고쳐 줘』처럼 짧은 지시를 그대로 넣을 때",
    example:
      "화면 좀 고쳐 줘 → 어디·어떻게·건드리면 안 되는지 고른 뒤 실행",
    gap: "짧은 지시랑 AI가 멋대로 해석한 결과가 안 맞는 지점",
    href: "/clarify/collab",
    swatch: "#7c3aed",
    kind: "clarify",
  },
  {
    id: "everyday",
    categoryId: "human-ai",
    label: "일상 질문",
    emoji: "💬",
    blurb: "주말·점심·선물처럼 막연한 추천",
    example:
      "이번 주말, 두 시간 안에 할 만한 거 추천해 줘 → 시간·돈·기준 고른 뒤 추천",
    gap: "막연한 말이랑 AI 추천이 서로 다른 기준으로 가는 지점",
    href: "/clarify/everyday",
    swatch: "#d97706",
    kind: "clarify",
  },
  {
    id: "research",
    categoryId: "inquiry",
    label: "연구 · 조사",
    emoji: "🔬",
    blurb: "불만·후기 원문을 넣고 『품질』 같은 말부터 나누기",
    example:
      "배송은 빨리 왔는데 품질이 별로예요 → 『품질』이 제품·배송·응대인지 고른 뒤 조사",
    gap: "원문의 애매한 말이랑 넓게 쏟아지는 조사 결과의 어긋남",
    href: "/clarify/research",
    swatch: "#0284c7",
    kind: "clarify",
  },
  {
    id: "quality",
    categoryId: "inquiry",
    label: "데이터 정의 맞추기",
    emoji: "📊",
    blurb: "숫자 보기 전에 『최근·불량』 뜻부터 확정하기",
    example:
      "최근 불량률이 왜 올랐어? → 『최근』·제품·불량 정의 맞춘 뒤 SQL",
    gap: "사람이 한 말이랑 모델이 고른 컬럼·필터가 안 맞는 지점",
    href: "/console/semantic?tab=analyze&case=quality",
    swatch: "#0f6b63",
    kind: "analysis",
  },
  {
    id: "sap",
    categoryId: "ops",
    label: "시스템 연동",
    emoji: "🔗",
    blurb: "이름은 같은데 뜻이 다른 필드 맞추기",
    example:
      "연동했는데 숫자가 안 맞아 → 어느 시스템을 기준으로 할지·매핑이 맞는지 확정",
    gap: "이름만 같고 뜻이 다른 필드 사이의 어긋남",
    href: "/console/semantic?tab=analyze&case=sap",
    swatch: "#1d4ed8",
    kind: "analysis",
  },
  {
    id: "finance",
    categoryId: "ops",
    label: "재무 · 세무 대조",
    emoji: "🧾",
    blurb: "신고·지급 전에 갈라진 숫자 기준 확정하기",
    example:
      "장부랑 신고액이 안 같아 → 귀속 기간·코드·대조 범위 확정",
    gap: "장부·신고 화면·지급 장표가 서로 다른 『맞음』을 쓰는 지점",
    href: "/console/semantic?tab=analyze&case=vat",
    swatch: "#b45309",
    kind: "analysis",
  },
];

export function casesByCategory(categoryId: string): WorkCase[] {
  return WORK_CASES.filter((c) => c.categoryId === categoryId);
}
