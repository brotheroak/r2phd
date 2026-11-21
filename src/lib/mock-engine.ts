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
      "연구 질문은 ‘시험일 기준 최근 6개월, 제품코드+제조번호 단위의 최종 부적합 실패율’입니다. 정의서와 스키마를 대조하니 날짜 기준·식별자 스코프·실패 정의에서 충돌 위험이 있습니다.",
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
          "ingest_date로 자르면 시험일은 오래됐지만 늦게 적재된 로트가 최근 구간에 들어와 실패율이 왜곡됩니다.",
        options: [
          "test_date 기준 (정의서 권장)",
          "ingest_date 기준 (웨어하우스 편의)",
          "manufacture_date 기준",
        ],
        recommended: "test_date 기준 (정의서 권장)",
        evidence: [
          "용어 정의서: 최근 = test_date",
          "스키마 주의: ingest_date는 ETL 적재일",
        ],
      },
      {
        id: "amb-id",
        kind: "identifier_scope",
        title: "제조번호 유일성 범위",
        whyItMatters:
          "lot_no만으로 조인·GROUP BY 하면 서로 다른 제품의 동일 번호가 한 로트로 합쳐집니다.",
        options: [
          "(product_code, lot_no) 복합키",
          "lot_no 단독",
          "supplier_lot 기준",
        ],
        recommended: "(product_code, lot_no) 복합키",
        evidence: [
          "정의서: 제품코드와 조합해야 유일",
          "lots PK(product_code, lot_no)",
        ],
      },
      {
        id: "amb-fail",
        kind: "term_conflict",
        title: "재시험 합격(PASS_AFTER_RETEST) 처리",
        whyItMatters:
          "실패에 포함하면 분자만 커져 ‘현장에서 체감하는 부적합률’과 어긋납니다.",
        options: [
          "FAIL만 실패",
          "FAIL + PASS_AFTER_RETEST 모두 실패",
          "첫 판정 기준 (미정의 — 추가 명세 필요)",
        ],
        recommended: "FAIL만 실패",
        evidence: [
          "정의서: PASS_AFTER_RETEST 는 실패가 아니다",
          "연구 질문: 재시험으로 합격한 건 제외",
        ],
      },
      {
        id: "amb-denom",
        kind: "aggregation",
        title: "분모 단위",
        whyItMatters:
          "시험 건수 기준과 로트 수 기준이 섞이면 실패율 해석이 달라집니다.",
        options: [
          "로트 수 (시험 1건 이상인 복합키)",
          "시험 건수",
          "입고 로트 수 (tests 무관)",
        ],
        recommended: "로트 수 (시험 1건 이상인 복합키)",
        evidence: ["정의서: 분모는 시험에 올라간 로트 수"],
      },
    ],
    assumedDefaults: [
      "분석기준일(as_of_date) = CURRENT_DATE",
      "HOLD/PENDING 은 분자·분모 모두에서 제외하는 방향으로 초안 작성",
    ],
    sourcesUsed: [
      "연구 질문",
      "용어 정의서",
      "스키마 주의 문구",
      "Liner Scholar (데모 코퍼스)",
    ],
  };
}

function decisionMap(decisions: ResearcherDecision[]) {
  const map = new Map(decisions.map((d) => [d.ambiguityId, d.chosenOption]));
  return {
    date:
      map.get("amb-date") ??
      "test_date 기준 (정의서 권장)",
    id:
      map.get("amb-id") ??
      "(product_code, lot_no) 복합키",
    fail:
      map.get("amb-fail") ??
      "FAIL만 실패",
    denom:
      map.get("amb-denom") ??
      "로트 수 (시험 1건 이상인 복합키)",
  };
}

export function mockConfirmSpec(req: ConfirmRequest): AnalysisSpec {
  const d = decisionMap(req.decisions);
  const useTestDate = d.date.includes("test_date");
  const useComposite = d.id.includes("product_code");
  const failOnly = d.fail.startsWith("FAIL만");
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
    title: "제조번호별 실패율 — 의도 고정 분석 명세",
    researchQuestion: req.researchQuestion,
    population: useComposite
      ? "시험 기록이 있는 (product_code, lot_no) 로트"
      : "시험 기록이 있는 lot_no",
    measures: [
      failOnly ? "실패 = disposition 'FAIL'" : "실패 = FAIL 또는 PASS_AFTER_RETEST",
      lotDenom ? "분모 = 로트 수" : "분모 = 시험 건수",
      "실패율(%) = 100 * fails / trials",
    ],
    filters: [
      d.date,
      "HOLD/PENDING 제외",
      useComposite ? "supplier_lot 미사용" : "lot_no 단독 식별",
    ],
    dateAnchor: d.date,
    identifierScope: d.id,
    exclusions: [
      "시험 없는 입고 로트",
      failOnly ? "PASS_AFTER_RETEST" : "(재시험합격 포함)",
    ],
    openQuestions: req.decisions
      .filter((x) => x.note?.trim())
      .map((x) => `${x.ambiguityId}: ${x.note}`),
    sql,
    checks: [
      {
        id: "chk-date",
        name: "날짜 기준 일치",
        description: `결과/쿼리가 ${d.date} 를 쓰는지 확인`,
        sqlHint: useTestDate
          ? "결과 메타 date_basis = 'test_date'"
          : "결과 메타 date_basis = 'ingest_date'",
        severity: "blocker",
      },
      {
        id: "chk-id",
        name: "식별자 스코프",
        description: useComposite
          ? "product_code 결측·lot_no 단독 집계 금지"
          : "lot_no 단독 집계 허용(의도 확정)",
        severity: "blocker",
      },
      {
        id: "chk-fail-def",
        name: "실패 정의",
        description: failOnly
          ? "PASS_AFTER_RETEST 가 분자에 있으면 실패"
          : "FAIL+재시험합격을 분자로 허용",
        severity: "blocker",
      },
      {
        id: "chk-dup",
        name: "중복 집계",
        description: "동일 로트 키가 결과에서 1회만 나타나는지",
        severity: "warning",
      },
      {
        id: "chk-missing",
        name: "대상 누락",
        description: "정의상 분모에 들어야 할 로트가 빠지지 않았는지",
        severity: "info",
      },
    ],
    rationale: [
      "연구자 확인으로 모호 항목을 고정한 뒤에만 SQL을 생성했습니다.",
      "naive SQL 대비 날짜·식별자·실패 정의 드리프트를 차단하는 것이 목표입니다.",
      `대조용 naive SQL 함정: ${SAMPLE_PROJECT.knownTraps.map((t) => t.title).join(", ")}`,
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
    title: "날짜 기준 드리프트",
    detail: expectsTestDate && dateBasisWrong
      ? "명세는 test_date 인데 결과 행에 ingest_date 기준 값이 있습니다. ‘최근’ 구간이 연구 의도와 다릅니다."
      : "날짜 기준이 명세와 일치합니다.",
    evidenceRows: lines.filter((l) => l.includes("ingest_date")).slice(0, 3),
  });

  const missingProduct = lines.some((l) => {
    const parts = l.split(",");
    return parts[1] === "" || parts[1] === undefined;
  });
  const wantsComposite = spec.identifierScope.includes("product_code");
  findings.push({
    id: "f-id",
    checkId: "chk-id",
    status: wantsComposite && missingProduct ? "fail" : "pass",
    title: "식별자 스코프 붕괴",
    detail: wantsComposite && missingProduct
      ? "product_code 가 비어 있는 행이 있습니다. 제조번호 단독으로 집계됐을 가능성이 큽니다."
      : "식별자 스코프가 명세와 맞습니다.",
    evidenceRows: lines.filter((l) => l.split(",")[1] === "").slice(0, 3),
  });

  const retestMention = lines.some((l) => l.includes("재시험합격"));
  const failOnly = spec.measures.some(
    (m) =>
      m.includes("FAIL'") ||
      m.includes("='FAIL'") ||
      m.includes("disposition 'FAIL'"),
  );
  findings.push({
    id: "f-fail",
    checkId: "chk-fail-def",
    status: failOnly && retestMention ? "fail" : "needs_review",
    title: "실패 정의 오염",
    detail: failOnly && retestMention
      ? "결과 노트에 재시험합격이 분자에 포함됐다는 흔적이 있습니다."
      : "실패 정의는 추가 원천 대조가 필요합니다.",
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
    title: "중복 집계",
    detail: dup.length
      ? `동일 키가 반복됩니다: ${Array.from(new Set(dup)).join(", ")}`
      : "동일 로트 키 중복 없음.",
    evidenceRows: lines.filter((l) => {
      const [lot, product] = l.split(",");
      return dup.includes(`${product}::${lot}`);
    }),
  });

  findings.push({
    id: "f-missing",
    checkId: "chk-missing",
    status: "needs_review",
    title: "대상 누락 가능성",
    detail:
      "CSV만으로는 분모 완전성을 확정할 수 없습니다. 원천 tests 대비 anti-join 검증을 권장합니다.",
  });

  const fails = findings.filter((f) => f.status === "fail").length;
  const reviews = findings.filter((f) => f.status === "needs_review").length;
  const intentDriftScore = Math.min(100, fails * 28 + reviews * 10);

  return {
    mode: "demo",
    summary:
      fails > 0
        ? `의도 드리프트 신호 ${fails}건, 추가 확인 ${reviews}건. 숫자가 ‘나와도’ 연구 질문과 어긋난 상태입니다.`
        : "치명적 드리프트는 없으나 분모 완전성은 원천 대조가 필요합니다.",
    findings,
    intentDriftScore,
    nextActions: [
      fails
        ? "IntentSpec 확정 SQL로 결과를 재생성하세요."
        : "원천 테이블 anti-join으로 분모를 재확인하세요.",
      "리뷰 회의에 이 감사 리포트와 연구자 확인 로그를 첨부하세요.",
      "용어 정의서의 날짜·식별자 조항을 팀 표준으로 고정하세요.",
    ],
  };
}
