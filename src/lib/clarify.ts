/**
 * Clarify domains — natural Korean labels people actually say.
 */
export const CLARIFY_DOMAINS = [
  {
    id: "analysis",
    label: "데이터 분석",
    emoji: "📊",
    blurb: "숫자 보기 전에 ‘최근·불량’ 같은 말부터 맞추기",
    swatch: "#0f6b63",
  },
  {
    id: "research",
    label: "연구·조사",
    emoji: "🔬",
    blurb: "자료 찾기 전에 어디까지 볼지 정하기",
    swatch: "#0284c7",
  },
  {
    id: "everyday",
    label: "일상 질문",
    emoji: "💬",
    blurb: "주말·점심·선물처럼 막연한 추천",
    swatch: "#d97706",
  },
  {
    id: "collab",
    label: "AI한테 원하는 거 말하기",
    emoji: "🤝",
    blurb: "『고쳐 줘』만 말했더니 엉뚱하게 바뀌었을 때",
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
    question: "뭐가 나오면 성공이에요?",
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
    question: "시간·돈·규칙 중에 뭘 먼저 지킬까요?",
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
    question: "답이 여러 개면 뭘로 고를까요?",
    swatch: "#0284c7",
    soft: "bg-sky-100 text-sky-950 border-sky-300",
    softDark: "dark:bg-sky-500/15 dark:text-sky-100 dark:border-sky-500/40",
  },
  {
    id: "next",
    label: "다음",
    short: "다음",
    emoji: "🧭",
    question: "정한 다음에 바로 뭘 할까요?",
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

export const CLARIFY_SYSTEM = `당신은 IntentSpec 질문 도우미입니다.
애매한 질문을 고르기 쉬운 선택지로 나눠 주세요. 길게 심문하지 마세요.

말투 규칙 (중요):
- 한국인이 카톡·회의에서 쓰는 자연스러운 말만 쓰세요.
- 번역투 금지. 예: 「구체화 초안」「산출물」「간극」「선택지로 맞추다」「의도 잠금」 같은 표현 금지.
- 「~인가요?」 남발 금지. 「~예요?」「~할까요?」처럼 편하게.
- 전문 은어·축약 속어는 쓰지 마세요.

필드 역할 (절대 섞지 마세요):
- summary = 화면에 「상황」으로 보임. 프롬프트를 읽고 지금 뭐가 꼬였는지 한두 문장. 「골라 주세요」「여러 개 골라도」 같은 UX 지시 금지. 프롬프트를 그대로 반복하지 마세요.
- refinedQuestion = 내부용. 사용자 프롬프트를 짧게 다듬은 한 줄. 화면에 크게 안 나감. AI에게 시키는 명령문 금지.
- direction = 내부용 다음 단계 메모. 화면에 크게 안 나감. 짧게.

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
- options 2~4개, 짧고 바로 누를 수 있게. 여러 개 골라도 됨.
- recommended는 넣되 자동 선택하지 않음.
- AI가 『고쳐 줘』만 듣고 멋대로 실행한 상황이면 domain=collab.
- id는 cl-goal 같은 kebab-case.`;
