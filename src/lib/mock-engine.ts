import { getScenario } from "./analysis-scenarios";
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

export function mockAnalyzeDraft(questionHint?: string): AnalysisDraft {
  return getScenario(questionHint).draft;
}

export function mockConfirmSpec(req: ConfirmRequest): AnalysisSpec {
  const scenario = getScenario(req.researchQuestion);
  const byId = Object.fromEntries(
    req.decisions.map((d) => [d.ambiguityId, d.chosenOption]),
  );
  const picks = scenario.draft.ambiguities.map(
    (a) => byId[a.id] ?? a.recommended ?? a.options[0],
  );
  const dateAnchor = picks[0] ?? "정의서 날짜";
  const identifierScope = picks[2] ?? picks[1] ?? "정의 범위";
  const measure = picks[1] ?? "정의서 측정";
  const population = picks[3] ?? picks[2] ?? "대상 범위";

  const sql =
    scenario.id === "payroll"
      ? `-- IntentSpec 확정 명세 (급여·원천 데모)
SELECT SUM(w.withheld_amount) AS wht
FROM payroll_runs r
JOIN withholding_lines w ON w.run_id = r.run_id
JOIN employees e ON e.employee_id = w.employee_id
WHERE r.pay_period = '2026-01'
  AND r.status = 'CONFIRMED'
  -- ${dateAnchor} / ${measure} / ${identifierScope} / ${population}
;`
      : scenario.id === "vat"
        ? `-- IntentSpec 확정 명세 (부가세 데모)
SELECT SUM(t.vat_amount) AS sap_vat
FROM fi_documents f
JOIN tax_items t ON t.doc_id = f.doc_id
WHERE f.company_code = 'KR01'
  AND t.tax_code = 'A1'
  AND f.posting_date >= DATE '2026-01-01'
  AND f.posting_date < DATE '2026-02-01'
  AND f.reversal_of IS NULL
  -- ${dateAnchor} / ${measure} / ${identifierScope} / ${population}
;`
        : scenario.id === "sap"
          ? `-- IntentSpec 확정 명세 (RFC/EAI 메타 확정 데모)
SELECT
  s.table_name, s.field_name, s.data_element,
  m.target_field, m.transform
FROM sap_field_catalog s
JOIN eai_maps m
  ON m.source_field = s.field_name
 AND m.source_system = 'SAP'
WHERE s.managed = true
  AND m.stale = false
  -- ${dateAnchor} / ${measure} / ${identifierScope} / ${population}
;`
          : `-- IntentSpec 확정 명세 (품질 데모)
SELECT product_code, lot_no, fail_rate_pct
FROM /* locked grain */ lots
-- ${dateAnchor} / ${measure} / ${identifierScope} / ${population}
;`;

  return {
    mode: "demo",
    title: `${scenario.label} — 확정 명세`,
    researchQuestion: req.researchQuestion,
    population,
    measures: [measure, ...scenario.knownTraps.slice(0, 1).map((t) => t.title)],
    filters: [dateAnchor, identifierScope],
    dateAnchor,
    identifierScope,
    exclusions: scenario.knownTraps.map((t) => t.title),
    openQuestions: req.decisions
      .filter((x) => x.note?.trim())
      .map((x) => `${x.ambiguityId}: ${x.note}`),
    sql,
    checks: [
      {
        id: "chk-date",
        name: "기간·귀속 기준",
        description: `결과가 ${dateAnchor}와 맞는지`,
        severity: "blocker",
      },
      {
        id: "chk-id",
        name: "범위·키",
        description: `결과가 ${identifierScope}와 맞는지`,
        severity: "blocker",
      },
      {
        id: "chk-fail-def",
        name: "측정·포함 규칙",
        description: `결과가 ${measure}와 맞는지`,
        severity: "blocker",
      },
      {
        id: "chk-dup",
        name: "중복·역분개",
        description: "같은 키가 두 번 잡히지 않는지",
        severity: "warning",
      },
      {
        id: "chk-missing",
        name: "누락",
        description: "분모·대상이 빠지지 않았는지",
        severity: "info",
      },
    ],
    rationale: [
      "헷갈리는 기준을 정한 뒤에 SQL을 만들었습니다.",
      `${scenario.systems} 대조용 데모입니다. 실신고·실지급을 대행하지 않습니다.`,
      `자주 틀리는 점: ${scenario.knownTraps.map((t) => t.title).join(", ")}`,
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
