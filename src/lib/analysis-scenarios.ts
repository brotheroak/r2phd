/**
 * Fictional demo scenarios only (Exe-thon §5).
 * Quality analytics and SAP integration stay separate — mixing them dilutes both.
 * SAP path stresses RFC/EAI + unmanaged metadata/schema drift across systems.
 */

import type { AnalysisDraft } from "./types";
import { SAMPLE_PROJECT } from "./sample-project";

export type AnalysisScenarioId = "quality" | "sap" | "vat" | "payroll";

export type AnalysisScenario = {
  id: AnalysisScenarioId;
  label: string;
  blurb: string;
  systems: string;
  workspaceHint: string;
  linkedTables: string[];
  researchQuestion: string;
  glossary: string;
  schema: string;
  naiveSql: string;
  resultRowsCsv: string;
  knownTraps: { id: string; title: string; detail: string }[];
  draft: AnalysisDraft;
};

const QUALITY_DRAFT: AnalysisDraft = {
  mode: "demo",
  summary:
    "질문의 뜻은 대략 이렇습니다. 시험일 기준으로 최근 6개월, 제품과 제조번호를 같이 본 최종 부적합 실패율. 정의서와 표를 맞춰 보니 기간·묶는 방식·실패 정의가 서로 부딪칠 여지가 있습니다.",
  concepts: [
    {
      concept: "실패율 분자",
      glossaryTerm: "실패 / 부적합",
      columns: ["dispositions.disposition"],
      condition: "disposition = 'FAIL'",
      exceptions: ["PASS_AFTER_RETEST 제외", "HOLD/PENDING 제외"],
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
      evidence: ["정의서: 최근은 시험일", "표 주의: ingest_date는 쌓인 날"],
    },
    {
      id: "amb-id",
      kind: "identifier_scope",
      title: "제조번호를 어디까지 같은 걸로 볼까",
      whyItMatters:
        "번호만으로 묶으면 제품이 다른데도 한 로트로 합쳐질 수 있습니다.",
      options: ["제품코드 + 제조번호", "제조번호만", "협력사 로트(supplier_lot)"],
      recommended: "제품코드 + 제조번호",
      evidence: [
        "정의서: 제품코드와 맞춰야 유일",
        "lots 기본키: product_code, lot_no",
      ],
    },
    {
      id: "amb-fail",
      kind: "term_conflict",
      title: "실패에 무엇을 넣을까",
      whyItMatters: "재시험 합격을 넣으면 실패율이 커지고 회의 숫자가 달라집니다.",
      options: [
        "최종 FAIL만",
        "FAIL + PASS_AFTER_RETEST",
        "HOLD도 잠정 실패",
      ],
      recommended: "최종 FAIL만",
      evidence: ["정의서: PASS_AFTER_RETEST는 실패 아님"],
    },
    {
      id: "amb-den",
      kind: "aggregation",
      title: "분모(시험에 올라간 로트) 범위",
      whyItMatters: "입고만 된 로트를 넣으면 실패율이 낮아집니다.",
      options: [
        "tests에 1건 이상",
        "lots 전체",
        "해당 기간 제조 로트만",
      ],
      recommended: "tests에 1건 이상",
      evidence: ["정의서: 시험 기록 있는 로트"],
    },
  ],
  assumedDefaults: [
    "기준일은 오늘(CURRENT_DATE)로 둠",
    "보류·대기(HOLD/PENDING)는 일단 빼고 초안을 잡음",
  ],
  sourcesUsed: ["연구 질문", "용어 정의서", "표 구조 주의 문구"],
};

const VAT_SCENARIO: AnalysisScenario = {
  id: "vat",
  label: "부가세 · SAP↔홈택스",
  blurb: "전표 합과 신고액이 어긋날 때 — 날짜·세금코드·사업장을 잠그기 전엔 숫자를 확정하면 안 됩니다.",
  systems: "SAP FI 전표 · 홈택스 부가세",
  workspaceHint: "finance · vat",
  linkedTables: [
    "company_codes",
    "fi_documents",
    "tax_items",
    "hometax_returns",
  ],
  researchQuestion: `이번 달 부가세 신고 전에 SAP FI 매출 세금과 홈택스 예정 신고액이 안 맞는다.
회사코드 KR01만 보고, 신고 기간은 과세기간(posting_date) 기준이다.
적재일(load_date)로 자르면 안 되고, 면세·영세 세금코드는 과세 합에서 빼야 한다.
같은 전표가 수정 전표로 두 번 있으면 최종 효력 전표만 본다.`,
  glossary: `# 용어 정의서 (가상 · 세무)

과세기간
- 부가세 신고 구간의 기준일은 fi_documents.posting_date (전기일).
- load_date(SAP→창고 적재일)로 ‘이번 달’을 자르면 안 된다.

세금코드
- tax_items.tax_code ∈ {A1 과세, A0 면세, A2 영세}.
- 과세 신고 합 = A1만. A0·A2는 별도 란.

회사코드
- company_code = 'KR01' 만 이번 신고 범위. 다른 코드와 합치면 안 된다.

최종 효력 전표
- fi_documents.reversal_of 가 있으면 원전표는 제외, 역분개·수정 후 전표만 포함.`,
  schema: `# 데이터 구조 (가상 · finance)

company_codes(company_code PK, name)
fi_documents(doc_id PK, company_code, posting_date, load_date, amount, reversal_of)
tax_items(doc_id, tax_code, vat_amount, base_amount)
hometax_returns(period, return_type, filed_vat, filed_at)

주의
- posting_date ≠ load_date
- tax_code A0/A2를 A1과 합산하면 신고액이 커짐
- reversal_of 있는 원전표를 남기면 이중 합산`,
  naiveSql: `-- ⚠ 돌아가지만 신고 기준과 다른 버전
SELECT
  SUM(t.vat_amount) AS sap_vat
FROM fi_documents f
JOIN tax_items t ON t.doc_id = f.doc_id
WHERE f.load_date >= DATE '2026-01-01'   -- ❌ 적재일
  AND f.company_code IN ('KR01','KR02') -- ❌ 회사코드 과다
;  -- ❌ 세금코드·역분개 미필터 → 홈택스와 불일치`,
  resultRowsCsv: `period,sap_vat,hometax_filed,delta,date_basis,notes
2026-01,128400000,121100000,7300000,load_date,A0 면세 포함 + KR02 혼입
2026-01,121100000,121100000,0,posting_date,정의서 기준으로 맞춘 값
2026-01,125800000,121100000,4700000,posting_date,역분개 원전표 미제외`,
  knownTraps: [
    {
      id: "trap-vat-date",
      title: "과세기간을 적재일로",
      detail: "늦게 적재된 전기분 전표가 ‘이번 달’로 들어갑니다.",
    },
    {
      id: "trap-vat-code",
      title: "면세·영세를 과세 합에",
      detail: "세금코드를 안 가르면 홈택스 과세 란과 어긋납니다.",
    },
    {
      id: "trap-vat-bukrs",
      title: "회사코드 범위",
      detail: "다른 회사코드 전표를 섞으면 신고 법인과 다릅니다.",
    },
    {
      id: "trap-vat-rev",
      title: "역분개 원전표 잔류",
      detail: "수정·취소 전 전표를 남기면 합이 두 번 잡힙니다.",
    },
  ],
  draft: {
    mode: "demo",
    summary:
      "SAP 부가세와 홈택스 신고액을 맞추려면 전기일·세금코드·회사코드·역분개 규칙을 먼저 잠가야 합니다. 추측 합계는 신고 전에 쓰면 안 됩니다.",
    concepts: [
      {
        concept: "과세 부가세 합",
        glossaryTerm: "세금코드",
        columns: ["tax_items.tax_code", "tax_items.vat_amount"],
        condition: "tax_code = 'A1'",
        exceptions: ["A0 면세·A2 영세 제외"],
      },
      {
        concept: "과세기간",
        glossaryTerm: "과세기간",
        columns: ["fi_documents.posting_date"],
        condition: "posting_date ∈ 신고 기간",
        exceptions: ["load_date 사용 금지"],
      },
      {
        concept: "신고 법인 범위",
        glossaryTerm: "회사코드",
        columns: ["fi_documents.company_code"],
        condition: "company_code = 'KR01'",
        exceptions: ["타 코드 합산 금지"],
      },
    ],
    ambiguities: [
      {
        id: "amb-vat-date",
        kind: "date_anchor",
        title: "‘이번 달’ 전표를 자를 날짜",
        whyItMatters: "적재일로 자르면 홈택스 과세기간과 어긋납니다.",
        options: [
          "전기일(posting_date) — 세무 정의",
          "적재일(load_date) — 창고 편의",
          "홈택스 접수일(filed_at)",
        ],
        recommended: "전기일(posting_date) — 세무 정의",
        evidence: ["정의서: 과세기간 = posting_date"],
      },
      {
        id: "amb-vat-code",
        kind: "term_conflict",
        title: "과세 합에 넣을 세금코드",
        whyItMatters: "면세·영세를 넣으면 신고 과세액이 커집니다.",
        options: ["A1 과세만", "A1+A2", "세금코드 전체"],
        recommended: "A1 과세만",
        evidence: ["정의서: 과세 란 = A1"],
      },
      {
        id: "amb-vat-scope",
        kind: "identifier_scope",
        title: "회사코드 범위",
        whyItMatters: "법인이 다른 전표를 섞으면 신고 주체가 달라집니다.",
        options: ["KR01만", "KR01+KR02", "전사 합산"],
        recommended: "KR01만",
        evidence: ["이번 신고 범위: KR01"],
      },
      {
        id: "amb-vat-rev",
        kind: "aggregation",
        title: "역분개·수정 전표 처리",
        whyItMatters: "원전표를 남기면 같은 거래가 두 번 합산됩니다.",
        options: [
          "최종 효력 전표만",
          "원전표+역분개 모두",
          "아직 미정 (잠금 금지)",
        ],
        recommended: "최종 효력 전표만",
        evidence: ["정의서: reversal_of 있으면 원전표 제외"],
      },
    ],
    assumedDefaults: [
      "데모는 가상 법인 KR01",
      "실신고 대행 없음 — 점검 카드만",
    ],
    sourcesUsed: ["세무 정의서", "SAP FI 스키마 주의", "홈택스 신고 화면(가상)"],
  },
};

const PAYROLL_SCENARIO: AnalysisScenario = {
  id: "payroll",
  label: "급여 · 원천세",
  blurb: "급여대장과 원천세·홈택스가 어긋날 때 — 귀속월·인원 범위·임금항목을 잠그기 전엔 지급·신고하면 안 됩니다.",
  systems: "인사 급여 전산 · 원천세 · 홈택스",
  workspaceHint: "finance · payroll",
  linkedTables: [
    "employees",
    "payroll_runs",
    "wage_lines",
    "withholding_lines",
    "hometax_returns",
  ],
  researchQuestion: `이번 달 급여 원천징수세액이 홈택스 원천세 신고 예정액과 안 맞는다.
귀속월은 payroll_runs.pay_period 기준이고, 확정 전 가계산 런은 빼야 한다.
중도퇴사자·외국인 근로 소득 구분을 급여 총액과 섞으면 안 된다.
비과세 식대(wage_type=MEAL)는 원천 과세 표준에서 제외한다.`,
  glossary: `# 용어 정의서 (가상 · 급여/원천)

귀속월
- 원천세·급여 귀속은 payroll_runs.pay_period (YYYY-MM).
- load_date나 confirmed_at 날짜로 ‘이번 달’을 대체하면 안 된다.

확정 런
- payroll_runs.status = 'CONFIRMED' 만 지급·신고 대상.
- DRAFT / SIMULATION 런의 금액은 합산 금지.

원천 과세 표준
- wage_lines 중 wage_type ≠ 'MEAL' (비과세 식대 제외).
- 퇴직소득·기타소득은 별도 라인 — 근로소득 합과 섞지 않음.

대상 인원
- employees.org_unit 이 이번 신고 사업장 코드에 속한 인원만.`,
  schema: `# 데이터 구조 (가상 · finance / HR)

employees(employee_id PK, org_unit, hire_date, leave_date)
payroll_runs(run_id PK, pay_period, status, confirmed_at, load_date)
wage_lines(run_id, employee_id, wage_type, gross_amount)
withholding_lines(run_id, employee_id, tax_code, withheld_amount)
hometax_returns(period, return_type, filed_vat, filed_at)
  -- return_type = 'WHT' 인 행이 원천세 신고

주의
- pay_period ≠ load_date 월
- DRAFT 런 포함 시 원천세가 커짐
- MEAL(비과세)을 과세 표준에 넣으면 세액이 달라짐`,
  naiveSql: `-- ⚠ 지급 전에 돌리기 쉬운 잘못된 합계
SELECT
  SUM(w.withheld_amount) AS wht
FROM payroll_runs r
JOIN withholding_lines w ON w.run_id = r.run_id
WHERE r.load_date >= DATE '2026-01-01'  -- ❌ 적재월
;  -- ❌ status·사업장·비과세 미구분 → 홈택스와 불일치`,
  resultRowsCsv: `pay_period,payroll_wht,hometax_wht,delta,basis,notes
2026-01,84200000,81500000,2700000,load_date,DRAFT 런 + 타 사업장 포함
2026-01,81500000,81500000,0,pay_period+CONFIRMED,정의서 기준
2026-01,82800000,81500000,1300000,pay_period,MEAL 비과세 미제외`,
  knownTraps: [
    {
      id: "trap-pay-period",
      title: "귀속월을 적재월로",
      detail: "늦게 올린 가계산이 이번 달 원천세로 들어갑니다.",
    },
    {
      id: "trap-pay-draft",
      title: "미확정 런 포함",
      detail: "시뮬레이션 금액까지 합치면 신고·지급액이 커집니다.",
    },
    {
      id: "trap-pay-meal",
      title: "비과세 식대 혼입",
      detail: "과세 표준에 식대를 넣으면 원천세가 달라집니다.",
    },
    {
      id: "trap-pay-org",
      title: "사업장 인원 범위",
      detail: "다른 사업장 급여를 섞으면 홈택스 신고 단위와 어긋납니다.",
    },
  ],
  draft: {
    mode: "demo",
    summary:
      "급여 원천세는 귀속월·확정 런·사업장·비과세 항목이 하나라도 어긋나면 홈택스와 갈라집니다. 잠그기 전에는 지급·신고 숫자를 확정할 수 없습니다.",
    concepts: [
      {
        concept: "원천징수세액",
        glossaryTerm: "확정 런",
        columns: ["withholding_lines.withheld_amount", "payroll_runs.status"],
        condition: "status = 'CONFIRMED'",
        exceptions: ["DRAFT/SIMULATION 제외"],
      },
      {
        concept: "귀속월",
        glossaryTerm: "귀속월",
        columns: ["payroll_runs.pay_period"],
        condition: "pay_period = 신고 월",
        exceptions: ["load_date 월 사용 금지"],
      },
      {
        concept: "과세 표준",
        glossaryTerm: "원천 과세 표준",
        columns: ["wage_lines.wage_type", "wage_lines.gross_amount"],
        condition: "wage_type <> 'MEAL'",
        exceptions: ["비과세 식대 제외"],
      },
    ],
    ambiguities: [
      {
        id: "amb-pay-period",
        kind: "date_anchor",
        title: "원천세 ‘이번 달’ 기준",
        whyItMatters: "적재월로 보면 귀속월 신고와 어긋납니다.",
        options: [
          "귀속월(pay_period)",
          "적재월(load_date)",
          "확정일(confirmed_at)의 달",
        ],
        recommended: "귀속월(pay_period)",
        evidence: ["정의서: 귀속 = pay_period"],
      },
      {
        id: "amb-pay-status",
        kind: "term_conflict",
        title: "어떤 급여 런을 넣을까",
        whyItMatters: "가계산을 넣으면 세액·지급액이 부풀어집니다.",
        options: ["CONFIRMED만", "DRAFT 포함", "모든 런"],
        recommended: "CONFIRMED만",
        evidence: ["정의서: 확정 런만"],
      },
      {
        id: "amb-pay-meal",
        kind: "aggregation",
        title: "비과세 식대 처리",
        whyItMatters: "과세 표준에 넣으면 원천세 계산이 달라집니다.",
        options: [
          "MEAL 제외",
          "MEAL 포함",
          "아직 미정 (잠금 금지)",
        ],
        recommended: "MEAL 제외",
        evidence: ["정의서: 식대 비과세"],
      },
      {
        id: "amb-pay-org",
        kind: "identifier_scope",
        title: "인원·사업장 범위",
        whyItMatters: "다른 사업장 급여를 섞으면 신고 단위가 틀립니다.",
        options: [
          "이번 신고 사업장만",
          "전사 합산",
          "퇴사자 제외 전 사업장",
        ],
        recommended: "이번 신고 사업장만",
        evidence: ["정의서: org_unit = 신고 사업장"],
      },
    ],
    assumedDefaults: [
      "데모는 가상 급여 런",
      "실지급·실신고 대행 없음",
    ],
    sourcesUsed: ["급여 정의서", "원천세 스키마 주의", "홈택스 원천(가상)"],
  },
};

const QUALITY_SCENARIO: AnalysisScenario = {
  id: "quality",
  label: "품질 · 로트 실패율",
  blurb: SAMPLE_PROJECT.tagline,
  systems: "품질 시험 · 판정 웨어하우스",
  workspaceHint: "ops_lab · core",
  linkedTables: ["products", "lots", "tests", "dispositions"],
  researchQuestion: SAMPLE_PROJECT.researchQuestion,
  glossary: SAMPLE_PROJECT.glossary,
  schema: SAMPLE_PROJECT.schema,
  naiveSql: SAMPLE_PROJECT.naiveSql,
  resultRowsCsv: SAMPLE_PROJECT.resultRowsCsv,
  knownTraps: [...SAMPLE_PROJECT.knownTraps],
  draft: QUALITY_DRAFT,
};

/** Cross-system SAP RFC/EAI — metadata & schema often unmanaged. */
const SAP_SCENARIO: AnalysisScenario = {
  id: "sap",
  label: "추가 예 · 연동 메타",
  blurb:
    "인터페이스 메타가 안 맞을 때(문서화된 RFC 메타 미갱신 등) 의도만 잠그는 보조 예제.",
  systems: "데모 카탈로그 · RFC/PI 메타 이슈를 모형화",
  workspaceHint: "ops_lab · integration",
  linkedTables: [
    "rfc_interfaces",
    "eai_maps",
    "sap_field_catalog",
    "warehouse_field_catalog",
    "sync_runs",
  ],
  researchQuestion: `SAP FI 전표를 RFC로 뽑아 EAI로 웨어하우스에 넣고, 홈택스·급여 숫자와 맞추려 한다.
문제는 각 시스템에 메타데이터·스키마가 따로 있고, 필드 설명이 오래됐거나 비어 있는 경우가 많다.
RFC 함수 모듈이 주는 BUDAT와 EAI가 넣는 posting_date, 창고 load_date가 같은 뜻인지 확정이 없다.
eai_maps.stale = true 인 매핑을 그대로 쓰면 세금코드·임금유형이 엉뚱한 컬럼으로 간다.
실연결·실신고는 하지 않고, 연동 의도(진실 원천·필드 뜻·동기 기준)만 잠근다.`,
  glossary: `# 용어 정의서 (가상 · SAP 연동)

RFC (Remote Function Call)
- SAP 함수 모듈로 전표·마스터를 읽는 통로. iface마다 function_module·direction·owner가 있다.
- last_reviewed_at 이 비어 있으면 메타가 방치된 인터페이스로 본다.

EAI 맵
- source_system → target_system 필드 대응. transform·stale 플래그가 있다.
- stale=true 는 “예전에 맞춰 둔 맵, 지금 스키마와 맞는지 모름”.

메타데이터 / 스키마
- sap_field_catalog: SAP 쪽 data_element·설명.
- warehouse_field_catalog: 창고 쪽 column·설명.
- managed=false 인 필드는 공식 설명이 없거나 팀 합의가 없다.

동기 기준 시각
- RFC 추출 시각(sync_runs.started_at) ≠ SAP 전기일(BUDAT/posting_date) ≠ 창고 load_date.
- “최신 데이터”가 어느 시각인지 잠그지 않으면 홈택스·급여 대조가 틀린다.

진실 원천
- 신고·지급 전 숫자의 기준 시스템(SAP / 웨어하우스 / 홈택스 화면)을 하나로 고른다.`,
  schema: `# 데이터 구조 (가상 · integration)

rfc_interfaces(iface_id, function_module, direction, owner_team, last_reviewed_at)
eai_maps(map_id, source_system, target_system, source_field, target_field, transform, stale)
sap_field_catalog(field_id, table_name, field_name, data_element, description_ko, managed)
warehouse_field_catalog(field_id, schema_name, table_name, column_name, description, managed)
sync_runs(run_id, iface_id, started_at, finished_at, row_count, status)

주의
- 시스템마다 스키마·메타가 분리되어 있고, managed=false / stale=true 가 흔하다
- 필드 이름만 같다고 뜻이 같지 않음 (BUDAT ≠ load_date)
- RFC·EAI 실호출 데모 없음 — 의도·매핑 잠금만`,
  naiveSql: `-- ⚠ 메타를 무시하고 이름만으로 조인한 연동 점검
SELECT
  s.field_name AS sap_field,
  w.column_name AS wh_col,
  m.transform
FROM sap_field_catalog s
JOIN eai_maps m
  ON m.source_field = s.field_name   -- ❌ 테이블·data_element 무시
JOIN warehouse_field_catalog w
  ON w.column_name = m.target_field  -- ❌ schema 무시, stale 미필터
WHERE s.managed = false              -- ❌ 방치 메타를 그대로 신뢰
;`,
  resultRowsCsv: `sap_field,wh_col,stale,managed,notes
BUDAT,load_date,true,false,전기일↔적재일 혼동 — 메타 미관리
MWSKZ,tax_code,false,true,정상 매핑 예시
MWSKZ,wage_type,true,false,EAI stale 맵이 세금코드를 임금유형으로
PERNR,employee_id,true,false,인사 키 설명 공란`,
  knownTraps: [
    {
      id: "trap-meta-unmanaged",
      title: "메타·스키마 방치",
      detail: "managed=false·설명 공란인 필드를 그대로 조인하면 뜻이 틀린다.",
    },
    {
      id: "trap-eai-stale",
      title: "EAI stale 맵",
      detail: "예전에 맞춘 맵이 스키마 변경 후에도 남아 엉뚱한 컬럼으로 간다.",
    },
    {
      id: "trap-rfc-clock",
      title: "RFC 시각 ≠ 업무 날짜",
      detail: "추출 시각과 전기일·귀속월을 같은 ‘최신’으로 보면 신고 구간이 어긋난다.",
    },
    {
      id: "trap-name-join",
      title: "필드 이름만 같은 조인",
      detail: "테이블·data_element·스키마를 무시하고 이름만 맞추면 교차 오염이 난다.",
    },
  ],
  draft: {
    mode: "demo",
    summary:
      "SAP↔EAI↔창고는 스키마가 갈라져 있고 메타가 헐거운 경우가 많습니다. RFC 통로·필드 뜻·진실 원천을 잠그기 전에는 부가세·급여 숫자를 확정하면 안 됩니다.",
    concepts: [
      {
        concept: "연동 통로",
        glossaryTerm: "RFC",
        columns: ["rfc_interfaces.function_module", "rfc_interfaces.iface_id"],
        condition: "검토된 RFC iface만",
        exceptions: ["last_reviewed_at 비어 있으면 보류"],
      },
      {
        concept: "필드 뜻",
        glossaryTerm: "메타데이터 / 스키마",
        columns: [
          "sap_field_catalog.data_element",
          "warehouse_field_catalog.column_name",
        ],
        condition: "managed=true 이고 설명이 합의된 필드",
        exceptions: ["이름만 같은 조인 금지"],
      },
      {
        concept: "매핑 유효성",
        glossaryTerm: "EAI 맵",
        columns: ["eai_maps.stale", "eai_maps.transform"],
        condition: "stale = false",
        exceptions: ["stale 맵으로 신고·지급 숫자 확정 금지"],
      },
      {
        concept: "동기 ‘최신’",
        glossaryTerm: "동기 기준 시각",
        columns: ["sync_runs.started_at"],
        condition: "업무 날짜(전기일/귀속월)와 분리해 기록",
        exceptions: ["load_date를 전기일로 쓰지 않음"],
      },
    ],
    ambiguities: [
      {
        id: "amb-sap-truth",
        kind: "identifier_scope",
        title: "숫자 맞출 때 진실 원천",
        whyItMatters:
          "SAP·창고·홈택스 화면이 제각각이면 ‘맞다’의 기준이 세 갈래가 됩니다.",
        options: [
          "SAP 원천 (RFC 직후)",
          "웨어하우스 적재본",
          "홈택스/급여 화면",
          "아직 미정 (잠금 금지)",
        ],
        recommended: "SAP 원천 (RFC 직후)",
        evidence: ["연동 정의: 신고 전 대조는 SAP 기준"],
      },
      {
        id: "amb-sap-pipe",
        kind: "term_conflict",
        title: "어떤 연동 통로를 쓸까",
        whyItMatters: "RFC 직접과 EAI 경유는 필드 변환·지연이 다릅니다.",
        options: [
          "RFC 직접 추출",
          "EAI 경유 (검증된 맵만)",
          "둘 다 대조 후 합의",
          "아직 모름",
        ],
        recommended: "EAI 경유 (검증된 맵만)",
        evidence: ["EAI stale 맵은 제외"],
      },
      {
        id: "amb-sap-meta",
        kind: "missing_definition",
        title: "메타·스키마가 비어 있을 때",
        whyItMatters: "관리되지 않은 필드를 추측으로 채우면 연동이 ‘된 것처럼’ 보입니다.",
        options: [
          "managed=false 필드는 분석 제외",
          "담당자가 설명을 채운 뒤만 사용",
          "이름 유사도로 임시 매핑",
          "아직 미정 (잠금 금지)",
        ],
        recommended: "담당자가 설명을 채운 뒤만 사용",
        evidence: ["방치 메타는 잠금 전 금지"],
      },
      {
        id: "amb-sap-clock",
        kind: "date_anchor",
        title: "‘최신 동기’의 시각",
        whyItMatters: "RFC 추출 시각과 전기일·귀속월을 섞으면 신고 구간이 틀립니다.",
        options: [
          "업무 날짜(전기일/귀속월)",
          "RFC sync_runs.started_at",
          "창고 load_date",
        ],
        recommended: "업무 날짜(전기일/귀속월)",
        evidence: ["정의서: 동기 시각 ≠ 업무 날짜"],
      },
    ],
    assumedDefaults: [
      "데모는 가상 RFC/EAI — 실시스템 호출 없음",
      "실신고·실지급 대행 없음",
    ],
    sourcesUsed: [
      "연동 정의서(가상)",
      "RFC/EAI 메타 카탈로그",
      "방치 스키마 주의 문구",
    ],
  },
};

export const ANALYSIS_SCENARIOS: AnalysisScenario[] = [
  QUALITY_SCENARIO,
  SAP_SCENARIO,
  VAT_SCENARIO,
  PAYROLL_SCENARIO,
];

export const ANALYSIS_SCENARIO_BY_ID = Object.fromEntries(
  ANALYSIS_SCENARIOS.map((s) => [s.id, s]),
) as Record<AnalysisScenarioId, AnalysisScenario>;

/** Default analyze demo is quality — other cases are optional extras. */
export const DEFAULT_ANALYSIS_SCENARIO_ID: AnalysisScenarioId = "quality";

export function resolveScenarioId(
  hint?: string | null,
): AnalysisScenarioId {
  const h = (hint ?? "").toLowerCase();
  if (h === "payroll" || h === "vat" || h === "quality" || h === "sap") {
    return h;
  }
  if (/payroll|급여|원천|인사|withhold|wage/.test(h)) return "payroll";
  if (/vat|부가|홈택스|전표|세금코드/.test(h)) return "vat";
  if (/rfc|eai|idoc|연동|인터페이스|메타데이터 캐시|sap/.test(h)) return "sap";
  if (/lot|실패|품질|quality|로트|제조/.test(h)) return "quality";
  return DEFAULT_ANALYSIS_SCENARIO_ID;
}

export function getScenario(id?: string | null): AnalysisScenario {
  const resolved = resolveScenarioId(id);
  return ANALYSIS_SCENARIO_BY_ID[resolved];
}
