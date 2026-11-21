import type { ClarifyBrief, ClarifyDomain } from "./clarify";

/**
 * Demo briefs — plain Korean situations people actually run into.
 * Options are short and can be multi-selected.
 */
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
    /티키타카|인텐트|의도|자기\s*마음대로|지맘대로|LLM에게|의도\s*설명|합의|소통\s*→|CTA|줄맞춤|흰\s*바탕|세\s*현장|케이스\s*넣|고쳐\s*줘|에이전트/i.test(
      q,
    );
  const domain =
    domainHint ??
    (collabAsk
      ? "collab"
      : financeAsk || /sql|실패율|로트|스키마|지표|집계|csv|불량/i.test(q)
        ? "analysis"
        : /논문|연구|문헌|조사|가설|불만/i.test(q)
          ? "research"
          : "everyday");

  if (domain === "analysis") {
    if (financeAsk || /급여|원천|부가|홈택스|sap/i.test(q)) {
      const payroll = /급여|원천|인사|payroll|연말정산/i.test(q);
      return {
        mode: "demo",
        domain: "analysis",
        summary: payroll
          ? "급여·원천세는 숫자 하나만 틀려도 신고가 틀립니다. 대조할 범위부터 고르세요."
          : "장부와 신고 화면 숫자가 다를 때, 무엇을 기준으로 맞출지부터 정합니다.",
        refinedQuestion:
          q ||
          "이번 달 급여 원천세랑 홈택스 신고액이 안 맞아요. 어디부터 대조할까요?",
        direction:
          "고른 뒤에 분석 화면에서 대조 범위만 잠급니다. 실제 신고·지급은 하지 않습니다.",
        ambiguities: [
          {
            id: "cl-goal",
            axis: "goal",
            title: "이번에 손에 쥐고 싶은 결과",
            whyItMatters:
              "설명이 필요한지, 차이표가 필요한지에 따라 다음 일이 달라집니다.",
            options: payroll
              ? [
                  "급여대장과 원천세 차이표",
                  "지급 전에 볼 체크리스트",
                  "인사·재무에 보낼 한 줄 설명",
                  "임금 항목이 어디에 붙는지 표",
                ]
              : [
                  "SAP와 홈택스 차이표",
                  "신고 전에 볼 체크리스트",
                  "세무 담당에게 보낼 한 줄",
                  "세금코드 매핑표",
                ],
            recommended: payroll
              ? "급여대장과 원천세 차이표"
              : "SAP와 홈택스 차이표",
          },
          {
            id: "cl-constraint",
            axis: "constraint",
            title: "절대 넘으면 안 되는 선",
            whyItMatters: "마감·권한이 바뀌면 같은 질문도 다른 숫자가 됩니다.",
            options: [
              "홈택스·원천 마감 전까지만",
              "급여·전표가 확정된 뒤만",
              "세무·인사 확인을 꼭 받기",
              "데모(가상 숫자)만 보기",
            ],
            recommended: "세무·인사 확인을 꼭 받기",
          },
          {
            id: "cl-criteria",
            axis: "criteria",
            title: "숫자가 다를 때 무엇을 믿을까",
            whyItMatters: "전표·대장·신고 화면 중 ‘정답’을 정해야 합니다.",
            options: [
              "법령·내부 정의서",
              "SAP·급여 전표",
              "홈택스 화면",
              "아직 모름 (확정 금지)",
            ],
            recommended: "법령·내부 정의서",
          },
          {
            id: "cl-next",
            axis: "next",
            title: "고른 뒤 바로 할 일",
            whyItMatters: "다음이 없으면 AI가 대충 숫자를 채워 버립니다.",
            options: [
              "분석 화면에서 사례 열기",
              "대조할 기간·대상 확정",
              "차이만 담당자에게 보내기",
              "질문만 더 다듬기",
            ],
            recommended: "분석 화면에서 사례 열기",
          },
        ],
        assumedDefaults: ["추천은 눌러야 선택됨", "데모는 가상 법인·가상 전표"],
      };
    }

    return {
      mode: "demo",
      domain,
      summary:
        "‘최근 불량률’처럼 말이 넓을 때, 기간·제품·불량 정의를 먼저 맞추면 헛일이 줄어듭니다.",
      refinedQuestion:
        q || "이번 주 회의 전에, 최근 불량률이 왜 올랐는지 원인을 좁히고 싶어요",
      direction: "고른 내용을 분석 화면 입력으로 넘깁니다.",
      ambiguities: [
        {
          id: "cl-goal",
          axis: "goal",
          title: "회의 전에 꼭 갖고 싶은 것",
          whyItMatters: "표·원인·정의 정리 중 무엇이 필요한지 정해야 합니다.",
          options: [
            "원인 후보 순위",
            "제품별 불량률 숫자",
            "‘불량·최근’ 정의 한 장",
            "회의용 한 장 요약",
          ],
          recommended: "‘불량·최근’ 정의 한 장",
        },
        {
          id: "cl-constraint",
          axis: "constraint",
          title: "현실적으로 지킬 조건",
          whyItMatters: "시간이 없는데 전체를 보면 기준이 흐려집니다.",
          options: [
            "오늘 안에 초안",
            "회사 정의서와 맞추기",
            "특정 제품군만",
            "제약 없이 넓게 보기",
          ],
          recommended: "회사 정의서와 맞추기",
        },
        {
          id: "cl-criteria",
          axis: "criteria",
          title: "답이 갈릴 때 우선할 기준",
          whyItMatters: "편한 컬럼을 고르면 숫자는 나와도 뜻이 틀어집니다.",
          options: [
            "용어 정의서",
            "창고에 있는 컬럼",
            "현장 관행",
            "아직 모름",
          ],
          recommended: "용어 정의서",
        },
        {
          id: "cl-next",
          axis: "next",
          title: "다음에 바로 할 일",
          whyItMatters: "다음이 없으면 대화만 늘고 숫자는 안 나옵니다.",
          options: [
            "분석 화면에서 기준 잠그기",
            "의심되는 SQL·CSV로 검증",
            "쓸 테이블 연결하기",
            "질문만 더 다듬기",
          ],
          recommended: "분석 화면에서 기준 잠그기",
        },
      ],
      assumedDefaults: ["추천은 눌러야 선택됨"],
    };
  }

  if (domain === "research") {
    return {
      mode: "demo",
      domain,
      summary:
        "고객 불만의 ‘품질’처럼 말이 여러 뜻일 때, 조사 범위부터 정해야 결과가 안 흩니다.",
      refinedQuestion:
        q ||
        "고객 불만 문구의 ‘품질’이 제품·배송·응대 중 무엇을 말하는지, 조사 전에 범위를 정하고 싶어요",
      direction: "고른 범위로 조사 질문과 다음 산출물을 잠급니다.",
      ambiguities: [
        {
          id: "cl-goal",
          axis: "goal",
          title: "조사로 얻고 싶은 것",
          whyItMatters: "정의 정리인지, 자료 목록인지에 따라 찾는 곳이 달라집니다.",
          options: [
            "우리 회사 ‘품질’ 정의 한 장",
            "관련 사례·자료 목록",
            "내부 정의와 외부 자료 대조",
            "다음에 볼 질문 목록",
          ],
          recommended: "내부 정의와 외부 자료 대조",
        },
        {
          id: "cl-constraint",
          axis: "constraint",
          title: "조사할 때 지킬 조건",
          whyItMatters: "시간·열람 권한에 따라 볼 수 있는 자료가 달라집니다.",
          options: [
            "공개 자료만",
            "내부 문서도 포함",
            "하루 분량만",
            "제약 느슨하게",
          ],
          recommended: "내부 문서도 포함",
        },
        {
          id: "cl-criteria",
          axis: "criteria",
          title: "어떤 근거를 더 믿을까",
          whyItMatters: "카톡 일화와 공식 가이드를 같은 무게로 두면 결론이 흔들립니다.",
          options: [
            "내부 정의서·가이드",
            "동료가 검토한 분석",
            "공개 가이드라인",
            "현장 경험담",
          ],
          recommended: "내부 정의서·가이드",
        },
        {
          id: "cl-next",
          axis: "next",
          title: "조사 끝나면 남길 것",
          whyItMatters: "산출물이 없으면 긴 설명만 남습니다.",
          options: [
            "좁힌 조사 질문 한 줄",
            "검색어·자료 목록",
            "분석 화면으로 넘기기",
            "읽을 자료 3개",
          ],
          recommended: "좁힌 조사 질문 한 줄",
        },
      ],
      assumedDefaults: ["추천은 눌러야 선택됨"],
    };
  }

  if (domain === "collab") {
    return {
      mode: "demo",
      domain: "collab",
      summary:
        "「이거 좀 고쳐 줘」만 말했더니 AI가 다른 방향으로 고친 상황입니다. 다시 손대기 전에 원하는 걸 고르세요. 여러 개 골라도 됩니다.",
      refinedQuestion:
        q ||
        "코딩 에이전트에게 「화면 좀 고쳐 줘」라고만 했더니 내가 원한 것과 다르게 바뀌었어요. 합의하기 전에는 손대지 말고, 선택지로 먼저 맞춰 주세요",
      direction:
        "선택지를 고르고 잠근 뒤에만 수정을 시작합니다. 잠금 카드가 AI에게 넘길 지시서가 됩니다.",
      ambiguities: [
        {
          id: "cl-goal",
          axis: "goal",
          title: "지금 당장 맞추고 싶은 것",
          whyItMatters:
            "코드를 더 고치는 일과, 뜻을 맞추는 일은 다릅니다. 둘 다 골라도 됩니다.",
          options: [
            "원하는 결과를 한 줄로 다시 쓰기",
            "건드리면 안 되는 부분 적기",
            "목적·제약·기준을 골라 합의하기",
            "지금 당장 코드부터 다시 고치기",
          ],
          recommended: "목적·제약·기준을 골라 합의하기",
        },
        {
          id: "cl-constraint",
          axis: "constraint",
          title: "AI가 하면 안 되는 것",
          whyItMatters: "합의 전에 또 고치면 설명이 길어지고 뜻이 더 어긋납니다.",
          options: [
            "합의 전에 코드·화면 바꾸지 않기",
            "내가 말 안 한 기능 넣지 않기",
            "이미 맞춘 부분 되돌리지 않기",
            "제약 없이 알아서 진행",
          ],
          recommended: "합의 전에 코드·화면 바꾸지 않기",
        },
        {
          id: "cl-criteria",
          axis: "criteria",
          title: "‘맞았다’고 볼 기준",
          whyItMatters: "AI가 「완료」라고 해도, 내가 본 기준과 다를 수 있습니다.",
          options: [
            "내가 고른 선택지와 잠금 카드가 같음",
            "결과물이 내가 말한 위치·범위·느낌을 따름",
            "내가 적은 성공 조건 체크리스트를 통과",
            "AI가 완료라고 하면 충분",
          ],
          recommended: "내가 고른 선택지와 잠금 카드가 같음",
        },
        {
          id: "cl-next",
          axis: "next",
          title: "잠근 뒤 바로 할 일",
          whyItMatters: "다음이 없으면 다시 「알아서」 실행합니다.",
          options: [
            "잠금 카드를 AI 채팅에 붙여넣기",
            "합의한 항목만 수정 요청하기",
            "아직 더 물어보기",
            "처음부터 다시 설명하기",
          ],
          recommended: "합의한 항목만 수정 요청하기",
        },
      ],
      assumedDefaults: [
        "추천은 눌러야 선택됨",
        "여러 개 고를 수 있음",
        "잠금 전 실행 = 의도 실패",
      ],
    };
  }

  // everyday — lunch / weekend / gift style
  return {
    mode: "demo",
    domain: "everyday",
    summary:
      "「주말에 뭐 하지?」처럼 막연할 때, 시간·돈·누구와 가는지를 고르면 추천이 덜 헛돕니다. 여러 개 골라도 됩니다.",
    refinedQuestion: q || "이번 주말, 두 시간 안에 할 만한 거 추천해 줘",
    direction: "고른 조건으로 바로 쓸 다음 행동을 잠급니다.",
    ambiguities: [
      {
        id: "cl-goal",
        axis: "goal",
        title: "추천으로 얻고 싶은 것",
        whyItMatters: "후보만 필요한지, 지금 바로 정할지가 다릅니다.",
        options: [
          "후보 3개만",
          "장단점 비교",
          "지금 바로 고를 한 가지",
          "아이디어만 나열",
        ],
        recommended: "후보 3개만",
      },
      {
        id: "cl-constraint",
        axis: "constraint",
        title: "현실 조건",
        whyItMatters: "예산·시간·동행을 모르면 엉뚱한 추천이 나옵니다.",
        options: [
          "두 시간 안에 끝낼 수 있게",
          "예산 부담 적게",
          "아이·동료와 함께",
          "조건 거의 없음",
        ],
        recommended: "두 시간 안에 끝낼 수 있게",
      },
      {
        id: "cl-criteria",
        axis: "criteria",
        title: "고를 때 더 중요한 것",
        whyItMatters: "쉬움·새로움·가성비 중 무엇이 우선인지 정해야 합니다.",
        options: [
          "피곤하지 않게",
          "새로운 경험",
          "비용 대비 만족",
          "집·회사에서 가깝게",
        ],
        recommended: "피곤하지 않게",
      },
      {
        id: "cl-next",
        axis: "next",
        title: "추천 받은 뒤 바로 할 일",
        whyItMatters: "다음 행동이 없으면 대화만 길어집니다.",
        options: [
          "예약·장바구니 링크",
          "오늘 할 일 체크리스트",
          "친구·가족에게 보낼 문장",
          "아직 생각만",
        ],
        recommended: "오늘 할 일 체크리스트",
      },
    ],
    assumedDefaults: ["추천은 눌러야 선택됨", "여러 개 고를 수 있음"],
  };
}
