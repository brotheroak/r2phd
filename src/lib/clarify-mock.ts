import type { ClarifyBrief, ClarifyDomain } from "./clarify";

/**
 * Demo briefs.
 * summary = 지금 상황 only (no UX instructions)
 * refinedQuestion = 당신이 한 말 (no AI prompts)
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
    /의도|자기\s*마음대로|LLM|합의|고쳐\s*줘|에이전트|화면\s*좀|코딩/i.test(q);
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
          ? "급여·원천세 숫자가 장부랑 신고 화면에서 서로 다르게 나와요."
          : "장부랑 신고 화면 숫자가 서로 다르게 나와요.",
        refinedQuestion:
          q ||
          "이번 달 급여 원천세랑 홈택스 신고액이 안 맞아요. 어디부터 맞춰 볼까요?",
        direction: "고른 뒤 분석 화면에서 대조 범위만 확정. 실제 신고·지급 없음.",
        ambiguities: [
          {
            id: "cl-goal",
            axis: "goal",
            title: "이번엔 뭐가 나오면 좋아요?",
            whyItMatters:
              "설명만 필요한지, 차이표가 필요한지에 따라 할 일이 달라져요.",
            options: payroll
              ? [
                  "급여대장·원천세 차이표",
                  "지급 전에 볼 체크리스트",
                  "인사·재무에 보낼 한 줄",
                  "임금 항목 어디에 붙는지 표",
                ]
              : [
                  "SAP·홈택스 차이표",
                  "신고 전에 볼 체크리스트",
                  "세무 담당에게 보낼 한 줄",
                  "세금코드 매핑표",
                ],
            recommended: payroll
              ? "급여대장·원천세 차이표"
              : "SAP·홈택스 차이표",
          },
          {
            id: "cl-constraint",
            axis: "constraint",
            title: "절대 넘으면 안 되는 선",
            whyItMatters: "마감·권한이 바뀌면 같은 질문도 숫자가 달라져요.",
            options: [
              "홈택스·원천 마감 전까지만",
              "급여·전표 확정된 뒤만",
              "세무·인사 확인 꼭 받기",
              "데모(가상 숫자)만 보기",
            ],
            recommended: "세무·인사 확인 꼭 받기",
          },
          {
            id: "cl-criteria",
            axis: "criteria",
            title: "숫자 다를 때 뭘 믿을까요?",
            whyItMatters:
              "전표·대장·신고 화면 중 뭘 ‘맞다’고 볼지 정해야 해요.",
            options: [
              "법령·내부 정의서",
              "SAP·급여 전표",
              "홈택스 화면",
              "아직 모름 (지금은 확정 금지)",
            ],
            recommended: "법령·내부 정의서",
          },
          {
            id: "cl-next",
            axis: "next",
            title: "고른 뒤 바로 할 일",
            whyItMatters: "다음이 없으면 AI가 숫자를 대충 채워요.",
            options: [
              "분석 화면에서 사례 열기",
              "대조할 기간·대상 확정",
              "차이만 담당자에게 보내기",
              "질문만 더 다듬기",
            ],
            recommended: "분석 화면에서 사례 열기",
          },
        ],
        assumedDefaults: [
          "추천은 눌러야 선택돼요",
          "데모는 가상 법인·가상 전표",
        ],
      };
    }

    return {
      mode: "demo",
      domain,
      summary:
        "『최근 불량률』처럼 말이 넓어서, 기간·제품·불량 뜻이 아직 안 맞아요.",
      refinedQuestion:
        q ||
        "이번 주 회의 전에, 최근 불량률이 왜 올랐는지 원인만 좁히고 싶어요",
      direction: "고른 내용을 분석 화면 입력으로 넘김.",
      ambiguities: [
        {
          id: "cl-goal",
          axis: "goal",
          title: "회의 전에 꼭 갖고 싶은 것",
          whyItMatters: "표가 필요한지, 원인 목록이 필요한지 먼저 정해야 해요.",
          options: [
            "원인 후보 순위",
            "제품별 불량률 숫자",
            "『불량·최근』 정의 한 장",
            "회의용 한 장 요약",
          ],
          recommended: "『불량·최근』 정의 한 장",
        },
        {
          id: "cl-constraint",
          axis: "constraint",
          title: "현실적으로 지킬 조건",
          whyItMatters: "시간이 없는데 전체를 보면 기준이 흐려져요.",
          options: [
            "오늘 안에 초안",
            "회사 정의서랑 맞추기",
            "특정 제품군만",
            "제약 없이 넓게 보기",
          ],
          recommended: "회사 정의서랑 맞추기",
        },
        {
          id: "cl-criteria",
          axis: "criteria",
          title: "답이 갈릴 때 뭘 우선할까요?",
          whyItMatters: "편한 컬럼을 고르면 숫자는 나와도 뜻이 틀어져요.",
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
          whyItMatters: "다음이 없으면 말만 늘고 숫자는 안 나와요.",
          options: [
            "분석 화면에서 기준 확정하기",
            "의심되는 SQL·CSV로 검증",
            "쓸 테이블 연결하기",
            "질문만 더 다듬기",
          ],
          recommended: "분석 화면에서 기준 확정하기",
        },
      ],
      assumedDefaults: ["추천은 눌러야 선택돼요"],
    };
  }

  if (domain === "research") {
    return {
      mode: "demo",
      domain,
      summary:
        "고객 불만의 『품질』이 제품·배송·응대 중 뭘 말하는지 아직 안 정해졌어요.",
      refinedQuestion:
        q ||
        "고객 불만에 적힌 『품질』이 제품인지, 배송인지, 응대인지 헷갈려요",
      direction: "고른 범위로 조사 질문이랑 다음에 남길 걸 확정.",
      ambiguities: [
        {
          id: "cl-goal",
          axis: "goal",
          title: "조사해서 얻고 싶은 것",
          whyItMatters: "정의 정리인지, 자료 목록인지에 따라 찾는 곳이 달라요.",
          options: [
            "우리 회사 『품질』 정의 한 장",
            "관련 사례·자료 목록",
            "내부 정의랑 바깥 자료 대조",
            "다음에 볼 질문 목록",
          ],
          recommended: "내부 정의랑 바깥 자료 대조",
        },
        {
          id: "cl-constraint",
          axis: "constraint",
          title: "조사할 때 지킬 조건",
          whyItMatters: "시간·열람 권한에 따라 볼 수 있는 자료가 달라요.",
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
          title: "어떤 근거를 더 믿을까요?",
          whyItMatters:
            "카톡 일화랑 공식 가이드를 같은 무게로 두면 결론이 흔들려요.",
          options: [
            "내부 정의서·가이드",
            "동료가 본 분석",
            "공개 가이드라인",
            "현장 경험담",
          ],
          recommended: "내부 정의서·가이드",
        },
        {
          id: "cl-next",
          axis: "next",
          title: "조사 끝나면 남길 것",
          whyItMatters: "남길 게 없으면 긴 설명만 남아요.",
          options: [
            "좁힌 조사 질문 한 줄",
            "검색어·자료 목록",
            "분석 화면으로 넘기기",
            "읽을 자료 3개",
          ],
          recommended: "좁힌 조사 질문 한 줄",
        },
      ],
      assumedDefaults: ["추천은 눌러야 선택돼요"],
    };
  }

  if (domain === "collab") {
    return {
      mode: "demo",
      domain: "collab",
      summary:
        "『고쳐 줘』만 말했더니 AI가 원한 것과 다른 쪽으로 바뀐 상황이에요.",
      refinedQuestion:
        q ||
        "코딩 에이전트한테 『화면 좀 고쳐 줘』라고만 했더니 내가 원한 거랑 다르게 바뀌었어요",
      direction: "확정 카드가 나온 뒤에만 수정 시작. 카드가 AI에 넘길 지시.",
      ambiguities: [
        {
          id: "cl-goal",
          axis: "goal",
          title: "지금 당장 정하고 싶은 것",
          whyItMatters:
            "코드를 더 고치는 거랑, 뜻을 맞추는 건 달라요. 둘 다 골라도 됩니다.",
          options: [
            "원하는 결과를 한 줄로 다시 쓰기",
            "건드리면 안 되는 부분 적기",
            "목적·제약·기준부터 맞추기",
            "지금 당장 코드부터 다시 고치기",
          ],
          recommended: "목적·제약·기준부터 맞추기",
        },
        {
          id: "cl-constraint",
          axis: "constraint",
          title: "AI가 하면 안 되는 것",
          whyItMatters: "뜻 맞추기 전에 또 고치면 말만 길어지고 더 어긋나요.",
          options: [
            "뜻 맞추기 전에 코드·화면 바꾸지 않기",
            "내가 말 안 한 기능 넣지 않기",
            "이미 맞춘 부분 되돌리지 않기",
            "제약 없이 알아서 진행",
          ],
          recommended: "뜻 맞추기 전에 코드·화면 바꾸지 않기",
        },
        {
          id: "cl-criteria",
          axis: "criteria",
          title: "『맞았다』고 볼 기준",
          whyItMatters: "AI가 『완료』라고 해도, 내가 본 기준이랑 다를 수 있어요.",
          options: [
            "내가 고른 선택지랑 확정 카드가 같음",
            "결과물이 내가 말한 위치·범위·느낌을 따름",
            "내가 적은 성공 조건 체크리스트를 통과",
            "AI가 완료라고 하면 충분",
          ],
          recommended: "내가 고른 선택지랑 확정 카드가 같음",
        },
        {
          id: "cl-next",
          axis: "next",
          title: "확정한 뒤 바로 할 일",
          whyItMatters: "다음이 없으면 또 『알아서』 실행해요.",
          options: [
            "확정 카드를 AI 채팅에 붙여넣기",
            "맞춘 항목만 수정 요청하기",
            "아직 더 물어보기",
            "처음부터 다시 설명하기",
          ],
          recommended: "맞춘 항목만 수정 요청하기",
        },
      ],
      assumedDefaults: [
        "추천은 눌러야 선택돼요",
        "여러 개 골라도 됩니다",
        "확정 전에 실행하면 실패로 봐요",
      ],
    };
  }

  return {
    mode: "demo",
    domain: "everyday",
    summary: "『주말에 뭐 하지?』처럼 막연해서, 시간·돈·누구랑 가는지가 비어 있어요.",
    refinedQuestion: q || "이번 주말, 두 시간 안에 할 만한 거 추천해 줘",
    direction: "고른 조건으로 바로 쓸 다음 행동 확정.",
    ambiguities: [
      {
        id: "cl-goal",
        axis: "goal",
        title: "추천으로 얻고 싶은 것",
        whyItMatters: "후보만 필요한지, 지금 바로 정할지가 달라요.",
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
        whyItMatters: "예산·시간·동행을 모르면 엉뚱한 추천이 나와요.",
        options: [
          "두 시간 안에 끝낼 수 있게",
          "예산 부담 적게",
          "아이·동료랑 함께",
          "조건 거의 없음",
        ],
        recommended: "두 시간 안에 끝낼 수 있게",
      },
      {
        id: "cl-criteria",
        axis: "criteria",
        title: "고를 때 더 중요한 것",
        whyItMatters: "쉬움·새로움·가성비 중 뭐가 우선인지 정해야 해요.",
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
        whyItMatters: "다음이 없으면 말만 길어져요.",
        options: [
          "예약·장바구니 링크",
          "오늘 할 일 체크리스트",
          "친구·가족에게 보낼 문장",
          "아직 생각만",
        ],
        recommended: "오늘 할 일 체크리스트",
      },
    ],
    assumedDefaults: ["추천은 눌러야 선택돼요", "여러 개 골라도 됩니다"],
  };
}
