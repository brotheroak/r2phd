import type { ClarifyBrief, ClarifyDomain } from "./clarify";

export function mockClarifyBrief(
  question: string,
  domainHint?: ClarifyDomain,
): ClarifyBrief {
  const q = question.trim();
  const financeAsk =
    /부가세|원천세|홈택스|sap|전표|급여|원천징수|회계|세무|payroll|fi\/co|인사/i.test(
      q,
    );
  const collabAsk =
    /티키타카|인텐트|의도|지맘대로|합의|소통\s*→|뭔\s*생각|CTA|줄맞춤|흰\s*바탕|세\s*현장|케이스\s*넣/i.test(
      q,
    );
  const domain =
    domainHint ??
    (collabAsk
      ? "collab"
      : financeAsk || /sql|실패율|로트|스키마|지표|집계|csv/i.test(q)
        ? "analysis"
        : /논문|연구|문헌|조사|가설/i.test(q)
          ? "research"
          : "everyday");

  if (domain === "analysis") {
    if (financeAsk || /급여|원천|부가|홈택스|sap/i.test(q)) {
      const payroll = /급여|원천|인사|payroll|연말정산/i.test(q);
      return {
        mode: "demo",
        domain: "analysis",
        summary: payroll
          ? "급여·원천은 한 줄이 틀려도 신고·지급이 틀립니다. 분석 콘솔에서 근거·마감을 먼저 고르세요."
          : "SAP·홈택스 숫자는 추측 확정이 금지입니다. 분석 게이트에서 날짜·세금코드·범위를 확정합니다.",
        refinedQuestion:
          q ||
          "이번 달 급여 원천세와 홈택스 신고액이 안 맞는데 어디를 대조해야 할까",
        direction:
          "선택 후 분석 콘솔에서 대조 범위·SQL 기준을 확정합니다. 실신고·실지급은 하지 않습니다.",
        ambiguities: [
          {
            id: "cl-goal",
            axis: "goal",
            title: "콘솔에서 남길 산출물",
            whyItMatters: "설명만으로는 신고·지급 전 숫자가 잠기지 않습니다.",
            options: payroll
              ? [
                  "급여대장↔원천세 차이표",
                  "지급 전 점검 체크리스트",
                  "인사·재무 전달 문장",
                  "임금 항목 매핑표",
                ]
              : [
                  "SAP↔홈택스 차이표",
                  "신고 전 점검 체크리스트",
                  "세무 담당 전달 문장",
                  "세금코드 매핑표",
                ],
            recommended: payroll
              ? "급여대장↔원천세 차이표"
              : "SAP↔홈택스 차이표",
          },
          {
            id: "cl-constraint",
            axis: "constraint",
            title: "절대 깨면 안 되는 제약",
            whyItMatters: "마감·권한이 바뀌면 같은 질문도 다른 숫자가 됩니다.",
            options: [
              "홈택스/원천 마감 전",
              "급여·전표 확정 후만",
              "세무·인사 확인 필수",
              "가상 법인 데모만",
            ],
            recommended: "세무·인사 확인 필수",
          },
          {
            id: "cl-criteria",
            axis: "criteria",
            title: "숫자가 갈릴 때 우선 근거",
            whyItMatters: "전표·급여대장·홈택스 중 무엇을 진실로 둘지 정해야 합니다.",
            options: [
              "법정·정의서 우선",
              "SAP/급여 전표 우선",
              "홈택스 화면 우선",
              "아직 미정 (확정 금지)",
            ],
            recommended: "법정·정의서 우선",
          },
          {
            id: "cl-next",
            axis: "next",
            title: "다음에 바로 할 일",
            whyItMatters: "다음이 없으면 AI가 숫자를 대략 채웁니다.",
            options: [
              "분석 콘솔에서 사례 열기",
              "대조 범위 확정",
              "차이만 담당자 전달",
              "질문만 더 다듬기",
            ],
            recommended: "분석 콘솔에서 사례 열기",
          },
        ],
        assumedDefaults: [
          "추천 자동선택 없음",
          "데모는 가상 법인·가상 전표",
        ],
      };
    }

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

  if (domain === "collab") {
    return {
      mode: "demo",
      domain: "collab",
      summary:
        "에이전트가 질문을 듣고 바로 고쳐 버린 상태입니다. 실행 전에 목적·제약·기준을 사람 말로 잠가야 합니다.",
      refinedQuestion:
        q ||
        "에이전트가 CTA·케이스·카피를 내 뜻과 다르게 고치고 있다. 합의 없이 코드 손대지 말고, 선택지로 먼저 맞춰라",
      direction:
        "선택지를 고르고 잠근 뒤에만 레이아웃·카피·케이스 목록을 수정합니다. 잠금 카드가 에이전트 지시서가 됩니다.",
      ambiguities: [
        {
          id: "cl-goal",
          axis: "goal",
          title: "이번 티키타카에서 먼저 얻을 것",
          whyItMatters:
            "코드를 더 고치는 것과 뜻을 맞추는 것은 다른 일입니다.",
          options: [
            "의도 합의 카드 (목적·제약·기준·다음)",
            "내가 원한 화면 상태를 한 줄로 재진술",
            "케이스 목록만 확정",
            "코드부터 바로 수정",
          ],
          recommended: "의도 합의 카드 (목적·제약·기준·다음)",
        },
        {
          id: "cl-constraint",
          axis: "constraint",
          title: "에이전트가 절대 깨면 안 되는 것",
          whyItMatters: "합의 전에 손대면 티키타카만 늘어납니다.",
          options: [
            "합의 전 코드/레이아웃 변경 금지",
            "묻지 않은 케이스·카피 임의 추가 금지",
            "메인 CTA로 SAP 등 단일 예제 격상 금지",
            "제약 없음 (알아서 해)",
          ],
          recommended: "합의 전 코드/레이아웃 변경 금지",
        },
        {
          id: "cl-criteria",
          axis: "criteria",
          title: "뜻이 맞았는지 판정 기준",
          whyItMatters: "에이전트 자기 판단으로 ‘고쳤다’고 끝내면 또 엇갈립니다.",
          options: [
            "내가 고른 선택지와 잠금 카드가 일치",
            "화면이 내가 말한 위치·크기를 따름",
            "케이스가 빠진 것 없이 보임 (SAP·티키타카 포함)",
            "에이전트가 ‘완료’라고 하면 OK",
          ],
          recommended: "내가 고른 선택지와 잠금 카드가 일치",
        },
        {
          id: "cl-next",
          axis: "next",
          title: "잠근 뒤 바로 할 일",
          whyItMatters: "다음이 없으면 다시 지맘대로 실행합니다.",
          options: [
            "잠금 카드를 에이전트 지시서로 붙여넣기",
            "합의된 항목만 코드 수정",
            "케이스 카드·CTA 위치만 먼저 반영",
            "아직 더 물어보기",
          ],
          recommended: "합의된 항목만 코드 수정",
        },
      ],
      assumedDefaults: [
        "추천 자동선택 없음",
        "잠금 전 실행 = 의도 실패로 간주",
      ],
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
    assumedDefaults: ["추천 자동선택 없음", "일상·연구·분석·티키타카 동일 패턴"],
  };
}
