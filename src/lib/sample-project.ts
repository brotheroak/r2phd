/**
 * Fictional demo only — no real company/patient data (Exe-thon rule §5).
 * Scenario: quality researcher asks for "recent lot failure rate by manufacturing number"
 * but three silent traps exist in the warehouse tables.
 */

export const SAMPLE_PROJECT = {
  id: "lot-intent-demo",
  name: "로트 실패율 예제",
  tagline: "실행은 되는데 기준이 다른 SQL을 잡습니다.",
  researchQuestion: `최근 6개월 제조번호별 실패율을 보고 싶다.
실패는 '부적합'으로 판정된 건만 포함하고, 재시험으로 합격한 건은 제외한다.
같은 제조번호라도 제품코드가 다르면 다른 로트로 본다.
분모는 시험에 올라간 로트 수이며, 등록일 기준으로 최근을 자르면 안 된다.`,
  glossary: `# 용어 정의서 (가상)

제조번호 (lot_no)
- 생산 단위 식별자. 제품코드(product_code)와 조합해야 유일하다.
- 주의: 협력사 납품 테이블의 supplier_lot은 다른 체계다.

실패 / 부적합
- disposition = 'FAIL' 인 최종 판정만 실패로 본다.
- disposition = 'PASS_AFTER_RETEST' 는 실패가 아니다.
- 중간 단계 HOLD, PENDING 은 집계에서 제외한다.

최근
- 기준은 test_date (시험일). ingest_date(적재일)나 created_at이 아니다.
- "최근 6개월" = test_date >= 분석기준일 - 180일.

시험에 올라간 로트
- tests 테이블에 1건 이상 존재하는 (product_code, lot_no).
- 샘플만 입고되고 시험 기록이 없는 로트는 분모에서 제외.`,
  schema: `# 데이터 구조 (가상 웨어하우스)

products(product_code PK, product_name, family)
lots(product_code, lot_no, manufacture_date, supplier_lot)
  PK(product_code, lot_no)
tests(test_id PK, product_code, lot_no, test_date, ingest_date, assay_name)
dispositions(test_id PK, disposition, decided_at, note)
  disposition ∈ {PASS, FAIL, PASS_AFTER_RETEST, HOLD, PENDING}

주의
- lots.lot_no 단독으로는 unique 하지 않음
- tests.ingest_date 는 ETL 적재일 (연구 '최근'과 무관)
- supplier_lot 을 lot_no 와 조인하면 잘못된 매칭 발생`,
  /**
   * Naive LLM-style SQL that "runs fine" but violates intent in three ways.
   */
  naiveSql: `-- ⚠ 겉보기엔 정상, 기준은 다른 버전
SELECT
  l.lot_no,
  COUNT(*) FILTER (WHERE d.disposition IN ('FAIL', 'PASS_AFTER_RETEST')) AS fails,
  COUNT(*) AS trials,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE d.disposition IN ('FAIL', 'PASS_AFTER_RETEST'))
    / NULLIF(COUNT(*), 0), 2
  ) AS fail_rate_pct
FROM lots l
JOIN tests t ON t.lot_no = l.lot_no          -- ❌ product_code 누락 → 로트 충돌
JOIN dispositions d ON d.test_id = t.test_id
WHERE t.ingest_date >= CURRENT_DATE - INTERVAL '6 months'  -- ❌ 적재일 기준
GROUP BY l.lot_no;                           -- ❌ 제품 구분 없음, 재시험합격 포함`,
  /**
   * Sample query result rows that look plausible but hide the traps.
   */
  resultRowsCsv: `lot_no,product_code,fails,trials,fail_rate_pct,date_basis,notes
L-1001,VAX-A,2,10,20.0,ingest_date,재시험합격 1건이 fails에 포함됨
L-1001,VAX-B,0,0,0.0,ingest_date,다른 제품 동일 lot_no — naive SQL에서 VAX-A와 합쳐짐
L-2044,DEV-X,1,5,20.0,ingest_date,시험일은 8개월 전인데 적재일이 최근이라 포함됨
L-3002,VAX-A,0,4,0.0,test_date,정상 케이스
L-3002,VAX-A,0,4,0.0,test_date,중복 집계 의심 행 (동일 키 반복)
L-4110,,3,3,100.0,ingest_date,product_code 누락 — 식별자 스코프 붕괴`,
  drama: {
    who: "품질·임상 데이터를 보는 사람, 그리고 그 표를 검토하는 동료",
    when: "AI가 SQL을 짜 주고, 화면에 숫자가 막 올라온 직후",
    pain: "돌아가니까 일단 안심합니다. 그런데 제조번호를 어떻게 묶었는지, ‘최근’이 어느 날짜인지, 실패를 뭐로 봤는지가 틀리면 회의 자료가 그대로 틀립니다.",
    cost: "사람이 용어랑 날짜를 다시 맞춰 보려면 건당 삼십 분에서 한 시간 반. 놓치면 틀린 실패율이 회의록에 박힙니다.",
  },
  knownTraps: [
    {
      id: "trap-id-scope",
      title: "제조번호만으로 조인",
      detail: "제품이 다른데 번호만 같으면 다른 로트인데, 번호만으로 묶어 버립니다.",
    },
    {
      id: "trap-date",
      title: "‘최근’을 적재일로",
      detail: "시험은 예전에 끝났는데, 나중에 쌓인 데이터라 최근처럼 들어갑니다.",
    },
    {
      id: "trap-fail-def",
      title: "재시험 합격을 실패로",
      detail: "다시 시험해서 합격한 건까지 실패로 세면 실패율이 커집니다.",
    },
    {
      id: "trap-dup",
      title: "같은 로트가 두 번",
      detail: "같은 제품·번호가 결과에 반복되면 분모와 분자가 틀어집니다.",
    },
  ],
} as const;

export type SampleProject = typeof SAMPLE_PROJECT;
