/**
 * 분석·연구·일상 질문을 같은 “선택으로 구체화” 패턴으로 다룬다.
 * 세무·회계·급여(SAP·홈택스·원천)는 데이터 분석 콘솔 사례로 둔다.
 */
export const CLARIFY_DOMAINS = [
  {
    id: "analysis",
    label: "데이터 분석",
    emoji: "📊",
    blurb: "품질·세무·급여 숫자 — SQL 전에 기준 확정",
    swatch: "#0f6b63",
  },
  {
    id: "research",
    label: "연구·조사",
    emoji: "🔬",
    blurb: "논문·자료 탐색 전에 범위·근거 고르기",
    swatch: "#0284c7",
  },
  {
    id: "everyday",
    label: "일상 질문",
    emoji: "💬",
    blurb: "여행·구매·일정처럼 애매한 일상 결정",
    swatch: "#d97706",
  },
] as const;

export type ClarifyDomain = (typeof CLARIFY_DOMAINS)[number]["id"];

export const CLARIFY_AXES = [
  {
    id: "goal",
    label: "무엇을 얻고 싶어",
    short: "목적",
    emoji: "🎯",
    question: "이 질문이 끝나면 무엇이 있으면 성공일까?",
    swatch: "#7c3aed",
    soft: "bg-violet-100 text-violet-950 border-violet-300",
    softDark:
      "dark:bg-violet-500/15 dark:text-violet-100 dark:border-violet-500/40",
  },
  {
    id: "constraint",
    label: "무엇을 지킬까",
    short: "제약",
    emoji: "🧱",
    question: "시간·비용·규칙 중 먼저 지킬 것은?",
    swatch: "#d97706",
    soft: "bg-amber-100 text-amber-950 border-amber-300",
    softDark:
      "dark:bg-amber-500/15 dark:text-amber-100 dark:border-amber-500/40",
  },
  {
    id: "criteria",
    label: "무엇으로 고를까",
    short: "기준",
    emoji: "⚖️",
    question: "여러 답이 있을 때 무엇을 우위로 볼까?",
    swatch: "#0284c7",
    soft: "bg-sky-100 text-sky-950 border-sky-300",
    softDark: "dark:bg-sky-500/15 dark:text-sky-100 dark:border-sky-500/40",
  },
  {
    id: "next",
    label: "다음에 무엇을",
    short: "다음",
    emoji: "🧭",
    question: "구체화된 뒤 바로 할 다음 한 가지는?",
    swatch: "#0f6b63",
    soft: "bg-teal-100 text-teal-950 border-teal-300",
    softDark: "dark:bg-teal-500/15 dark:text-teal-100 dark:border-teal-500/40",
  },
] as const;

export type ClarifyAxisId = (typeof CLARIFY_AXES)[number]["id"];

export const CLARIFY_AXIS_BY_ID = Object.fromEntries(
  CLARIFY_AXES.map((a) => [a.id, a]),
) as Record<ClarifyAxisId, (typeof CLARIFY_AXES)[number]>;

export type ClarifyAmbiguity = {
  id: string;
  axis: ClarifyAxisId;
  title: string;
  whyItMatters: string;
  options: string[];
  recommended?: string;
};

export type ClarifyBrief = {
  mode: "live" | "demo";
  domain: ClarifyDomain;
  summary: string;
  refinedQuestion: string;
  direction: string;
  ambiguities: ClarifyAmbiguity[];
  assumedDefaults: string[];
};

export const CLARIFY_SYSTEM = `당신은 IntentSpec 질문 인터뷰어입니다.
사용자의 질문이 데이터 분석이든, 연구·조사든, 일상 결정이든
애매한 지점을 선택지로 구체화합니다. 장문 심문 금지. 고르기 쉬운 옵션만.
세무·회계·급여·SAP·홈택스 질문은 domain=analysis 로 두고, 추측 확정을 막습니다.

STRICT JSON:
{
  "domain": "analysis"|"research"|"everyday",
  "summary": string,
  "refinedQuestion": string,
  "direction": string,
  "ambiguities": [{"id":string,"axis":"goal"|"constraint"|"criteria"|"next","title":string,"whyItMatters":string,"options":string[],"recommended":string}],
  "assumedDefaults": string[]
}

규칙:
- ambiguities 2~4개. axis는 가능하면 서로 다르게.
- options 2~4개, 짧고 바로 클릭 가능하게.
- recommended는 넣되 자동 선택되지 않음.
- domain은 질문 내용에 맞게 추정. 세무·회계·급여·SAP·홈택스·원천세·부가세·전표·SQL·지표는 analysis.
- 자연스러운 한국어. id는 cl-goal 같은 kebab-case.`;
