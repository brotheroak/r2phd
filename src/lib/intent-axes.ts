/**
 * 도메인이 바뀌어도 같은 네 가지를 먼저 고정한다.
 * color* 는 인터뷰 다이어그램·선택 카드용 (라이트/다크 공통 가독).
 */
export const INTENT_AXES = [
  {
    id: "time",
    label: "기간",
    short: "기간",
    emoji: "📅",
    question: "‘최근’을 어떤 날짜로 자를까?",
    failureMode: "적재일·등록일로 자르면 예전에 끝난 일이 최근처럼 잡힌다.",
    tint: "tint-amber",
    accent: "text-signal",
    swatch: "#d97706",
    soft: "bg-amber-100 text-amber-950 border-amber-300",
    softDark: "dark:bg-amber-500/15 dark:text-amber-100 dark:border-amber-500/40",
    chip: "bg-amber-500",
  },
  {
    id: "identity",
    label: "식별",
    short: "식별",
    emoji: "🔑",
    question: "무엇을 같은 대상으로 볼까?",
    failureMode: "키를 너무 넓게 잡으면 다른 것이 합쳐지고, 너무 좁으면 조각난다.",
    tint: "tint-sky",
    accent: "text-sky",
    swatch: "#0284c7",
    soft: "bg-sky-100 text-sky-950 border-sky-300",
    softDark: "dark:bg-sky-500/15 dark:text-sky-100 dark:border-sky-500/40",
    chip: "bg-sky-500",
  },
  {
    id: "measure",
    label: "측정",
    short: "측정",
    emoji: "🧮",
    question: "분자에 무엇을 넣고, 무엇을 뺄까?",
    failureMode: "재시험·보류·예외가 섞이면 지표가 부풀거나 줄어든다.",
    tint: "tint-teal",
    accent: "text-primary",
    swatch: "#0f6b63",
    soft: "bg-teal-100 text-teal-950 border-teal-300",
    softDark: "dark:bg-teal-500/15 dark:text-teal-100 dark:border-teal-500/40",
    chip: "bg-teal-600",
  },
  {
    id: "population",
    label: "분모",
    short: "분모",
    emoji: "👥",
    question: "비율의 분모에는 누가 들어가나?",
    failureMode: "건수·로트 수·등록 수가 섞이면 같은 숫자라도 뜻이 달라진다.",
    tint: "tint-ok",
    accent: "text-ok",
    swatch: "#15803d",
    soft: "bg-emerald-100 text-emerald-950 border-emerald-300",
    softDark: "dark:bg-emerald-500/15 dark:text-emerald-100 dark:border-emerald-500/40",
    chip: "bg-emerald-600",
  },
] as const;

export type IntentAxisId = (typeof INTENT_AXES)[number]["id"];

export const AXIS_BY_ID = Object.fromEntries(
  INTENT_AXES.map((a) => [a.id, a]),
) as Record<IntentAxisId, (typeof INTENT_AXES)[number]>;

export const KIND_LABEL: Record<string, string> = {
  date_anchor: "기간 기준",
  identifier_scope: "같은 걸로 묶기",
  term_conflict: "용어 충돌",
  aggregation: "집계 방식",
  missing_definition: "정의 부족",
};

export function kindToAxis(kind: string): IntentAxisId {
  switch (kind) {
    case "date_anchor":
      return "time";
    case "identifier_scope":
      return "identity";
    case "term_conflict":
    case "missing_definition":
      return "measure";
    case "aggregation":
      return "population";
    default:
      return "measure";
  }
}
