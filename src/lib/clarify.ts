/**
 * Soft clarify domains (분석 콘솔 시나리오와 별개).
 * collab = LLM에게 의도를 설명·잠그는 케이스.
 */
export const CLARIFY_DOMAINS = [
  {
    id: "analysis",
    label: "데이터 분석",
    emoji: "📊",
    blurb: "지표·기간·집계 정의를 SQL 전에 잠그기",
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
    blurb: "여행·구매·일정처럼 애매한 일상 요청",
    swatch: "#d97706",
  },
  {
    id: "collab",
    label: "LLM에게 의도 설명하기",
    emoji: "🤝",
    blurb: "LLM이 자기 마음대로 해석하기 전에 뜻을 고르기",
    swatch: "#7c3aed",
  },
] as const;

export type ClarifyDomain = (typeof CLARIFY_DOMAINS)[number]["id"];

export const CLARIFY_AXES = [
  {
    id: "goal",
    label: "목적",
    short: "목적",
    emoji: "🎯",
    question: "이 질문이 끝나면 무엇이 있으면 성공인가요?",
    swatch: "#7c3aed",
    soft: "bg-violet-100 text-violet-950 border-violet-300",
    softDark:
      "dark:bg-violet-500/15 dark:text-violet-100 dark:border-violet-500/40",
  },
  {
    id: "constraint",
    label: "제약",
    short: "제약",
    emoji: "🧱",
    question: "시간·비용·규칙 중 먼저 지킬 것은 무엇인가요?",
    swatch: "#d97706",
    soft: "bg-amber-100 text-amber-950 border-amber-300",
    softDark:
      "dark:bg-amber-500/15 dark:text-amber-100 dark:border-amber-500/40",
  },
  {
    id: "criteria",
    label: "기준",
    short: "기준",
    emoji: "⚖️",
    question: "답이 여러 개일 때 무엇을 우선할까요?",
    swatch: "#0284c7",
    soft: "bg-sky-100 text-sky-950 border-sky-300",
    softDark: "dark:bg-sky-500/15 dark:text-sky-100 dark:border-sky-500/40",
  },
  {
    id: "next",
    label: "다음",
    short: "다음",
    emoji: "🧭",
    question: "뜻을 맞춘 뒤 바로 할 다음 한 가지는 무엇인가요?",
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
사용자의 질문이 데이터 분석·연구·일상이든, LLM에게 의도를 설명하는 상황이든
애매한 지점을 선택지로 구체화합니다. 장문 심문 금지. 고르기 쉬운 옵션만.
한국어는 표준어로 씁니다. 은어·축약 속어는 쓰지 마세요.

STRICT JSON:
{
  "domain": "analysis"|"research"|"everyday"|"collab",
  "summary": string,
  "refinedQuestion": string,
  "direction": string,
  "ambiguities": [{"id":string,"axis":"goal"|"constraint"|"criteria"|"next","title":string,"whyItMatters":string,"options":string[],"recommended":string}],
  "assumedDefaults": string[]
}

규칙:
- ambiguities 2~4개. axis는 가능하면 서로 다르게.
- options 2~4개, 짧고 바로 클릭 가능하게. 사용자는 여러 개를 동시에 고를 수 있다.
- recommended는 넣되 자동 선택되지 않음.
- domain은 질문 내용에 맞게 추정. LLM이 자기 마음대로 해석·실행하려는 상황이면 collab.
- collab에서는 “바로 고치지 말고 먼저 합의”가 핵심이다.
- 한국인이 바로 알아듣는 일상·직장 말투. 전문 은어·번역투 금지. id는 cl-goal 같은 kebab-case.`;
