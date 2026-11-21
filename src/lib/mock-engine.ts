import { SAMPLE_PROJECT } from "./sample-project";
import type {
  AnalysisDraft,
  AnalysisSpec,
  AuditFinding,
  AuditReport,
  ConfirmRequest,
  ResearcherDecision,
  ScholarHit,
} from "./types";

export function mockScholarHits(query: string): ScholarHit[] {
  return [
    {
      title: "Defining analysis populations and date anchors in observational studies",
      url: "https://example.org/methods/date-anchors",
      description:
        "Emphasizes pre-specification of the calendar field used for ‘recent’ windows and warns against warehouse load timestamps.",
      date: "2023-04-12",
      authors: ["Chen, L.", "Park, H."],
      journal: "Journal of Data Quality",
      citationCount: 86,
    },
    {
      title: "Composite keys for lot genealogy in regulated manufacturing",
      url: "https://example.org/methods/lot-composite-keys",
      description:
        "Shows failure modes when lot_no is treated as globally unique across product codes.",
      date: "2022-11-03",
      authors: ["Nguyen, T."],
      journal: "Pharma Informatics Review",
      citationCount: 41,
    },
    {
      title: `Related methods note for: ${query.slice(0, 80)}`,
      url: "https://example.org/methods/intent-preservation",
      description:
        "Demo corpus hit — replace with live Liner Scholar results when LINER_API_KEY is set.",
      date: "2024-01-20",
      authors: ["IntentSpec Demo"],
      journal: "Methods Sketch",
      citationCount: 3,
    },
  ];
}

export function mockAnalyzeDraft(): AnalysisDraft {
  return {
    mode: "demo",
    summary:
      "질문의 뜻은 대략 이렇습니다. 시험일 기준으로 최근 6개월, 제품과 제조번호를 같이 본 최종 부적합 실패율. 정의서와 표를 맞춰 보니 기간·묶는 방식·실패 정의가 서로 부딪칠 여지가 있습니다.",
    concepts: [
      {
        concept: "실패율 분자",
        glossaryTerm: "실패 / 부적합",
        columns: ["dispositions.disposition"],
        condition: "disposition = 'FAIL'",
        exceptions: [
          "PASS_AFTER_RETEST 제외",
          "HOLD/PENDING 제외",
        ],
      },
      {
        concept: "실패율 분모",
        glossaryTerm: "시험에 올라간 로트",
        columns: ["tests.product_code", "tests.lot_no"],
        condition: "tests에 1건 이상 존재",
        exceptions: ["입고만 되고 시험 없는 로트 제외"],
      },
      {
        concept: "최근 구간",
        glossaryTerm: "최근",
        columns: ["tests.test_date"],
        condition: "test_date >= as_of_date - 180 days",
        exceptions: ["ingest_date/created_at 사용 금지"],
      },
      {
        concept: "로트 식별",
        glossaryTerm: "제조번호",
        columns: ["product_code", "lot_no"],
        condition: "복합키 (product_code, lot_no)",
        exceptions: ["supplier_lot 과 혼용 금지", "lot_no 단독 조인 금지"],
      },
    ],
    ambiguities: [
      {
        id: "amb-date",
        kind: "date_anchor",
        title: "‘최근 6개월’의 날짜 필드",
        whyItMatters:
          "적재일로 자르면 시험은 예전에 끝났는데 늦게 쌓인 로트가 ‘최근’에 들어갑니다.",
        options: [
          "시험일(test_date) — 정의서 쪽",
          "적재일(ingest_date) — 창고 편의",
          "제조일(manufacture_date)",
        ],
        recommended: "시험일(test_date) — 정의서 쪽",
        evidence: [
          "정의서: 최근은 시험일",
          "표 주의: ingest_date는 쌓인 날",
        ],
      },
      {
        id: "amb-id",
        kind: "identifier_scope",
        title: "제조번호를 어디까지 같은 걸로 볼까",
        whyItMatters:
          "번호만으로 묶으면 제품이 다른데도 한 로트로 합쳐질 수 있습니다.",
        options: [
          "제품코드 + 제조번호",
          "제조번호만",
          "협력사 로트(supplier_lot)",
        ],
        recommended: "제품코드 + 제조번호",
        evidence: [
          "정의서: 제품코드와 맞춰야 유일",
          "lots 기본키: product_code, lot_no",
        ],
      },
      {
        id: "amb-fail",
        kind: "term_conflict",
        title: "재시험 합격은 실패인가",
        whyItMatters:
          "여기에 넣으면 실패만 커져서, 현장에서 느끼는 부적합률과 멀어집니다.",
        options: [
          "최종 부적합(FAIL)만 실패",
          "FAIL + 재시험 합격도 실패",
          "첫 판정 기준 (아직 정의 없음)",
        ],
        recommended: "최종 부적합(FAIL)만 실패",
        evidence: [
          "정의서: 재시험 합격은 실패가 아님",
          "질문: 재시험으로 합격한 건은 빼 달라",
        ],
      },
      {
        id: "amb-denom",
        kind: "aggregation",
        title: "분모는 무엇으로 셀까",
        whyItMatters:
          "시험 건수로 나눌지, 로트 수로 나눌지에 따라 같은 숫자도 뜻이 달라집니다.",
        options: [
          "시험이 한 번이라도 있는 로트 수",
          "시험 건수",
          "입고만 된 로트 수",
        ],
        recommended: "시험이 한 번이라도 있는 로트 수",
        evidence: ["정의서: 분모는 시험에 올라간 로트 수"],
      },
    ],
    assumedDefaults: [
      "기준일은 오늘(CURRENT_DATE)로 둠",
      "보류·대기(HOLD/PENDING)는 일단 빼고 초안을 잡음",
    ],
    sourcesUsed: [
      "연구 질문",
      "용어 정의서",
      "표 구조 주의 문구",
      "Liner Scholar (예시)",
    ],
  };
}

function decisionMap(decisions: ResearcherDecision[]) {
  const map = new Map(decisions.map((d) => [d.ambiguityId, d.chosenOption]));
  return {
    date: map.get("amb-date") ?? "시험일(test_date) — 정의서 쪽",
    id: map.get("amb-id") ?? "제품코드 + 제조번호",
    fail: map.get("amb-fail") ?? "최종 부적합(FAIL)만 실패",
    denom: map.get("amb-denom") ?? "시험이 한 번이라도 있는 로트 수",
  };
}

export function mockConfirmSpec(req: ConfirmRequest): AnalysisSpec {
  const d = decisionMap(req.decisions);
  const useTestDate = d.date.includes("test_date") || d.date.includes("시험일");
  const useComposite =
    d.id.includes("product_code") || d.id.includes("제품코드");
  const failOnly = d.fail.includes("FAIL만") || d.fail.includes("부적합(FAIL)만");
  const lotDenom = d.denom.includes("로트 수");

  const dateFilter = useTestDate
    ? "t.test_date >= CURRENT_DATE - INTERVAL '180 days'"
    : "t.ingest_date >= CURRENT_DATE - INTERVAL '180 days'";

  const failPred = failOnly
    ? "d.disposition = 'FAIL'"
    : "d.disposition IN ('FAIL', 'PASS_AFTER_RETEST')";

  const groupCols = useComposite
    ? "t.product_code, t.lot_no"
    : "t.lot_no";

  const joinLots = useComposite
    ? "JOIN lots l ON l.product_code = t.product_code AND l.lot_no = t.lot_no"
    : "JOIN lots l ON l.lot_no = t.lot_no";

  const sql = lotDenom
    ? `-- IntentSpec 확정 명세 반영
WITH eligible_tests AS (
  SELECT t.product_code, t.lot_no, t.test_id, d.disposition
  FROM tests t
  JOIN dispositions d ON d.test_id = t.test_id
  ${joinLots}
  WHERE ${dateFilter}
    AND d.disposition NOT IN ('HOLD', 'PENDING')
),
lot_flags AS (
  SELECT
    ${useComposite ? "product_code, lot_no" : "lot_no"},
    MAX(CASE WHEN ${failPred} THEN 1 ELSE 0 END) AS is_fail,
    COUNT(*) AS trial_events
  FROM eligible_tests
  GROUP BY ${groupCols}
)
SELECT
  ${useComposite ? "product_code, lot_no" : "lot_no"},
  is_fail AS fails,
  1 AS trials,
  ROUND(100.0 * is_fail, 2) AS fail_rate_pct
FROM lot_flags
ORDER BY ${useComposite ? "product_code, lot_no" : "lot_no"};`
    : `-- IntentSpec 확정 명세 반영 (시험 건수 분모)
SELECT
  ${groupCols},
  COUNT(*) FILTER (WHERE ${failPred}) AS fails,
  COUNT(*) AS trials,
  ROUND(100.0 * COUNT(*) FILTER (WHERE ${failPred}) / NULLIF(COUNT(*), 0), 2) AS fail_rate_pct
FROM tests t
JOIN dispositions d ON d.test_id = t.test_id
${joinLots}
WHERE ${dateFilter}
  AND d.disposition NOT IN ('HOLD', 'PENDING')
GROUP BY ${groupCols};`;

  return {
    mode: "demo",
    title: "제조번호별 실패율 — 확인 반영 명세",
    researchQuestion: req.researchQuestion,
    population: useComposite
      ? "시험 기록이 있는 제품+제조번호 로트"
      : "시험 기록이 있는 제조번호",
    measures: [
      failOnly ? "실패 = 최종 부적합(FAIL)" : "실패 = FAIL 또는 재시험 합격",
      lotDenom ? "분모 = 로트 수" : "분모 = 시험 건수",
      "실패율(%) = 100 × 실패 / 분모",
    ],
    filters: [
      d.date,
      "보류·대기 제외",
      useComposite ? "협력사 로트는 쓰지 않음" : "제조번호만으로 식별",
    ],
    dateAnchor: d.date,
    identifierScope: d.id,
    exclusions: [
      "시험 없이 입고만 된 로트",
      failOnly ? "재시험 합격" : "(재시험 합격 포함)",
    ],
    openQuestions: req.decisions
      .filter((x) => x.note?.trim())
      .map((x) => `${x.ambiguityId}: ${x.note}`),
    sql,
    checks: [
      {
        id: "chk-date",
        name: "기간 기준이 맞는지",
        description: `쿼리와 결과가 ${d.date}를 쓰는지 본다`,
        sqlHint: useTestDate
          ? "결과의 date_basis가 test_date인지"
          : "결과의 date_basis가 ingest_date인지",
        severity: "blocker",
      },
      {
        id: "chk-id",
        name: "묶는 방식이 맞는지",
        description: useComposite
          ? "제품코드가 비거나 번호만으로 묶인 행이 있으면 안 됨"
          : "제조번호만으로 묶기로 확정됨",
        severity: "blocker",
      },
      {
        id: "chk-fail-def",
        name: "실패 정의가 맞는지",
        description: failOnly
          ? "재시험 합격이 분자에 있으면 안 됨"
          : "재시험 합격도 분자에 넣기로 함",
        severity: "blocker",
      },
      {
        id: "chk-dup",
        name: "같은 로트가 두 번인지",
        description: "같은 로트 키가 결과에 한 번만 나오는지",
        severity: "warning",
      },
      {
        id: "chk-missing",
        name: "빠진 대상은 없는지",
        description: "분모에 들어가야 할 로트가 빠지지 않았는지",
        severity: "info",
      },
    ],
    rationale: [
      "헷갈리는 기준을 정한 뒤에 SQL을 만들었습니다.",
      "겉보기엔 정상인 SQL과 비교해 기간·묶기·실패 정의를 맞추려는 목적입니다.",
      `예제에서 자주 틀리는 점: ${SAMPLE_PROJECT.knownTraps.map((t) => t.title).join(", ")}`,
    ],
  };
}

export function mockAudit(spec: AnalysisSpec, csv: string): AuditReport {
  const lines = csv.trim().split(/\r?\n/).slice(1);
  const findings: AuditFinding[] = [];

  const dateBasisWrong = lines.some((l) => l.includes("ingest_date"));
  const expectsTestDate = spec.dateAnchor.includes("test_date");
  findings.push({
    id: "f-date",
    checkId: "chk-date",
    status: expectsTestDate && dateBasisWrong ? "fail" : "pass",
    title: "기간 기준이 다름",
    detail: expectsTestDate && dateBasisWrong
      ? "정한 기준은 시험일인데, 결과에는 적재일 값이 섞여 있습니다."
      : "기간 기준이 맞습니다.",
    evidenceRows: lines.filter((l) => l.includes("ingest_date")).slice(0, 3),
  });

  const missingProduct = lines.some((l) => {
    const parts = l.split(",");
    return parts[1] === "" || parts[1] === undefined;
  });
  const wantsComposite =
    spec.identifierScope.includes("product_code") ||
    spec.identifierScope.includes("제품코드");
  findings.push({
    id: "f-id",
    checkId: "chk-id",
    status: wantsComposite && missingProduct ? "fail" : "pass",
    title: "묶는 기준이 다름",
    detail: wantsComposite && missingProduct
      ? "제품코드가 비어 있는 행이 있습니다. 제조번호만으로 묶인 것으로 보입니다."
      : "묶는 기준이 맞습니다.",
    evidenceRows: lines.filter((l) => l.split(",")[1] === "").slice(0, 3),
  });

  const retestMention = lines.some((l) => l.includes("재시험합격"));
  const failOnly = spec.measures.some(
    (m) =>
      m.includes("FAIL") ||
      m.includes("부적합"),
  );
  findings.push({
    id: "f-fail",
    checkId: "chk-fail-def",
    status: failOnly && retestMention ? "fail" : "needs_review",
    title: "실패 정의가 섞임",
    detail: failOnly && retestMention
      ? "결과 메모에 재시험 합격이 분자에 들어갔다는 흔적이 있습니다."
      : "실패 정의는 원천 표와 한 번 더 맞춰 보는 편이 좋습니다.",
    evidenceRows: lines.filter((l) => l.includes("재시험")).slice(0, 2),
  });

  const keys = lines.map((l) => {
    const [lot, product] = l.split(",");
    return `${product}::${lot}`;
  });
  const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
  findings.push({
    id: "f-dup",
    checkId: "chk-dup",
    status: dup.length ? "fail" : "pass",
    title: "같은 로트가 두 번",
    detail: dup.length
      ? `같은 키가 반복됩니다: ${Array.from(new Set(dup)).join(", ")}`
      : "같은 로트 키가 한 번씩만 나옵니다.",
    evidenceRows: lines.filter((l) => {
      const [lot, product] = l.split(",");
      return dup.includes(`${product}::${lot}`);
    }),
  });

  findings.push({
    id: "f-missing",
    checkId: "chk-missing",
    status: "needs_review",
    title: "빠진 대상이 있을 수 있음",
    detail:
      "결과표만으로는 분모가 완전한지 단정하기 어렵습니다. 원천 시험 표와 맞춰 보길 권합니다.",
  });

  const fails = findings.filter((f) => f.status === "fail").length;
  const reviews = findings.filter((f) => f.status === "needs_review").length;
  const intentDriftScore = Math.min(100, fails * 28 + reviews * 10);

  return {
    mode: "demo",
    summary:
      fails > 0
        ? `불일치 ${fails}건, 재확인 ${reviews}건입니다. 숫자는 나왔지만 정한 기준과 맞지 않습니다.`
        : "큰 문제는 없어 보이지만, 분모는 원천 표와 한 번 더 맞춰 보세요.",
    findings,
    intentDriftScore,
    nextActions: [
      fails
        ? "정한 기준으로 SQL을 다시 돌려 결과를 뽑아 보세요."
        : "원천 시험 표와 맞춰 분모가 빠지지 않았는지 확인하세요.",
      "이 점검 결과와 확인 기록을 회의 자료에 함께 첨부하세요.",
      "정의서의 기간·묶기 규칙을 팀에서 공통으로 정해 두세요.",
    ],
  };
}
