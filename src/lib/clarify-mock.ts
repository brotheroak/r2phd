import type { ClarifyBrief, ClarifyDomain } from "./clarify";

export function mockClarifyBrief(
  question: string,
  domainHint?: ClarifyDomain,
): ClarifyBrief {
  const q = question.trim();
  const domain =
    domainHint ??
    (/sql|실패율|로트|스키마|지표|집계|csv/i.test(q)
      ? "analysis"
      : /논문|연구|문헌|조사|가설/i.test(q)
        ? "research"
        : "everyday");

  if (domain === "analysis") {
    return {
      mode: "demo",
      domain,
      summary:
        "분석 질문이 넓습니다. 목적·제약·선택 기준을 고르면 SQL 전에 덜 헛돕니다.",
      refinedQuestion: q || "최근 실패율이 왜 올랐는지 알고 싶다",
      direction: "선택 후 IntentSpec 분석 게이트로 넘길 입력을 만듭니다.",
      ambiguities: [
        {
          id: "cl-goal",
          axis: "goal",
          title: "이번 분석에서 얻고 싶은 것",
          whyItMatters: "목적에 따라 보는 표와 성공 조건이 달라집니다.",
          options: [
            "원인 후보 순위",
            "제품별 실패율 숫자",
            "정의(실패·최근) 정리",
            "회의용 한 장 요약",
          ],
          recommended: "정의(실패·최근) 정리",
        },
        {
          id: "cl-constraint",
          axis: "constraint",
          title: "먼저 지킬 제약",
          whyItMatters: "시간이 없는데 전수 탐색하면 기준이 흐려집니다.",
          options: [
            "오늘 안에 초안",
            "정의서와 반드시 일치",
            "특정 제품군만",
            "제약 없음 (탐색)",
          ],
          recommended: "정의서와 반드시 일치",
        },
        {
          id: "cl-criteria",
          axis: "criteria",
          title: "답이 갈릴 때 우선할 기준",
          whyItMatters: "편의 컬럼을 고르면 실행은 되지만 뜻이 틀어집니다.",
          options: [
            "용어 정의서 우선",
            "창고에 있는 컬럼 우선",
            "현장 관행 우선",
            "아직 모름",
          ],
          recommended: "용어 정의서 우선",
        },
        {
          id: "cl-next",
          axis: "next",
          title: "다음에 바로 할 일",
          whyItMatters: "다음이 없으면 대화만 늘고 반출 게이트로 안 갑니다.",
          options: [
            "분석 게이트에서 기준 잠그기",
            "의심 SQL·CSV 붙여 검증",
            "카탈로그 테이블 연결",
            "질문만 더 다듬기",
          ],
          recommended: "분석 게이트에서 기준 잠그기",
        },
      ],
      assumedDefaults: ["추천 자동선택 없음"],
    };
  }

  if (domain === "research") {
    return {
      mode: "demo",
      domain,
      summary:
        "연구 질문이 열려 있습니다. 범위·근거·주장 강도를 고르면 챗봇이 덜 산만해집니다.",
      refinedQuestion: q || "실패율 상승 요인을 조사하고 싶다",
      direction: "선택 후 좁혀진 연구 질문과 다음 산출물을 잠급니다.",
      ambiguities: [
        {
          id: "cl-goal",
          axis: "goal",
          title: "조사 목적",
          whyItMatters: "탐색과 검증을 섞으면 근거 기준이 흔들립니다.",
          options: [
            "가설 목록 만들기",
            "기존 연구 요약",
            "내부 정의와 문헌 대조",
            "실험·분석 설계 초안",
          ],
          recommended: "내부 정의와 문헌 대조",
        },
        {
          id: "cl-constraint",
          axis: "constraint",
          title: "조사 제약",
          whyItMatters: "시간·접근 권한에 따라 볼 자료가 달라집니다.",
          options: [
            "공개 자료만",
            "내부 문서 포함",
            "하루 분량만",
            "제약 느슨하게",
          ],
          recommended: "내부 문서 포함",
        },
        {
          id: "cl-criteria",
          axis: "criteria",
          title: "근거 우선순위",
          whyItMatters: "일화와 논문을 같은 무게로 두면 결론이 흔들립니다.",
          options: [
            "정의서·스펙",
            "동료 검토 분석",
            "학술 가이드라인",
            "현장 경험담",
          ],
          recommended: "정의서·스펙",
        },
        {
          id: "cl-next",
          axis: "next",
          title: "다음 산출물",
          whyItMatters: "산출물이 없으면 긴 설명만 남습니다.",
          options: [
            "좁힌 연구 질문 한 줄",
            "검색 쿼리 세트",
            "분석 게이트로 넘기기",
            "읽을 자료 3개",
          ],
          recommended: "분석 게이트로 넘기기",
        },
      ],
      assumedDefaults: ["추천 자동선택 없음"],
    };
  }

  // everyday
  return {
    mode: "demo",
    domain: "everyday",
    summary:
      "일상 질문도 목적·제약·기준이 애매하면 답이 흔들립니다. 선택지로 먼저 고정합니다.",
    refinedQuestion: q || "주말에 뭐 하면 좋을까",
    direction: "선택 후 바로 쓸 수 있는 짧은 다음 행동으로 잠급니다.",
    ambiguities: [
      {
        id: "cl-goal",
        axis: "goal",
        title: "이번 질문으로 얻고 싶은 것",
        whyItMatters: "추천·비교·결정 중 무엇인지에 따라 답이 달라집니다.",
        options: [
          "선택지 3개만",
          "장단 비교",
          "지금 바로 결정할 한 가지",
          "아이디어만 나열",
        ],
        recommended: "선택지 3개만",
      },
      {
        id: "cl-constraint",
        axis: "constraint",
        title: "현실 제약",
        whyItMatters: "예산·시간·동행을 모르면 엉뚱한 추천이 나옵니다.",
        options: [
          "시간 부족 (2시간 이내)",
          "예산 빠듯",
          "아이/동료와 함께",
          "제약 거의 없음",
        ],
        recommended: "시간 부족 (2시간 이내)",
      },
      {
        id: "cl-criteria",
        axis: "criteria",
        title: "고를 때 우선할 것",
        whyItMatters: "즐거움·효율·안전 중 무엇이 우선인지 정해야 합니다.",
        options: ["피곤하지 않게", "새로운 경험", "비용 대비 만족", "가까운 곳"],
        recommended: "피곤하지 않게",
      },
      {
        id: "cl-next",
        axis: "next",
        title: "답 나온 뒤 바로 할 일",
        whyItMatters: "다음 행동이 없으면 대화만 길어집니다.",
        options: [
          "예약/장바구니 링크",
          "오늘 할 일 체크리스트",
          "누군가에게 보낼 문장",
          "아직 생각만",
        ],
        recommended: "오늘 할 일 체크리스트",
      },
    ],
    assumedDefaults: ["추천 자동선택 없음", "일상·연구·분석 동일 패턴"],
  };
}
