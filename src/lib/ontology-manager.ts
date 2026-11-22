/**
 * Ontology Manager model — IntentSpec demo shaped after:
 * - Palantir Foundry OMA: Object types · Properties · Link types · Action types
 * - Enhans Ontology Manager: Objects · Properties · Links · Knowledge
 *
 * Not a full Foundry/Enhans clone — same IA vocabulary, catalog-backed demo data.
 */

import { ENTITY_GRAPH, PHYSICAL_CATALOG } from "./semantic-model";
import type { AnalysisDraft, AnalysisSpec } from "./types";

export type OntologySection =
  | "objects"
  | "properties"
  | "links"
  | "actions"
  | "knowledge";

export const ONTOLOGY_SECTIONS: {
  id: OntologySection;
  label: string;
  blurb: string;
}[] = [
  {
    id: "objects",
    label: "대상",
    blurb: "무엇을 다루나요? (상품·시험·전표…)",
  },
  {
    id: "properties",
    label: "속성",
    blurb: "각 대상이 가진 칸·뜻",
  },
  {
    id: "links",
    label: "관계",
    blurb: "대상끼리 어떻게 이어지나요?",
  },
  {
    id: "actions",
    label: "할 수 있는 일",
    blurb: "뜻이 맞은 뒤에 허용할 실행",
  },
  {
    id: "knowledge",
    label: "규칙·지식",
    blurb: "용어·제외·회사 규칙",
  },
];

export type OntologyObjectType = {
  id: string;
  name: string;
  schema: string;
  role: string;
  description: string;
  primaryKey: string;
  propertyCount: number;
  linked: boolean;
  status: "draft" | "mapped" | "locked";
};

export type OntologyProperty = {
  id: string;
  objectId: string;
  objectName: string;
  name: string;
  sourceColumn: string;
  meaning: string;
  kind: "physical" | "derived" | "intent";
  locked: boolean;
};

export type OntologyLinkType = {
  id: string;
  from: string;
  to: string;
  label: string;
  on: string;
  cardinality: string;
};

export type OntologyActionType = {
  id: string;
  name: string;
  description: string;
  requiresLock: boolean;
  available: boolean;
};

export type OntologyKnowledge = {
  id: string;
  kind: "glossary" | "constraint" | "exclusion" | "rule";
  title: string;
  body: string;
  locked: boolean;
};

function tableDescription(name: string, role: string): string {
  const map: Record<string, string> = {
    products: "제품 마스터 — 분석·품질의 기준 차원",
    lots: "제조 로트 — 제품별 배치 단위",
    tests: "시험 결과 — 실패율 측정의 사실",
    dispositions: "판정 기록 — 시험 후 처리",
    company_codes: "회사코드 — 재무 조직 단위",
    fi_documents: "전표 — 회계 문서 헤더",
    tax_items: "세금 항목 — 부가세 라인",
    hometax_returns: "홈택스 신고 — 외부 진실 원천",
    employees: "직원 — 급여 대상 차원",
    payroll_runs: "급여 런 — 지급 확정 단위",
    wage_lines: "임금 라인 — 총액·항목",
    withholding_lines: "원천 라인 — 공제액",
    rfc_interfaces: "RFC 인터페이스 — SAP 통로 메타",
    eai_maps: "EAI 매핑 — 필드 변환 정의",
    sap_field_catalog: "SAP 필드 카탈로그",
    warehouse_field_catalog: "창고 필드 카탈로그",
    sync_runs: "동기화 실행 로그",
  };
  return map[name] ?? `${role} 오브젝트`;
}

function guessPk(columns: readonly string[]): string {
  const preferred = columns.find((c) =>
    /(_id|_code|id|code|run_id|doc_id|test_id|iface_id|map_id|field_id)$/i.test(
      c,
    ),
  );
  return preferred ?? columns[0] ?? "—";
}

export function buildOntologyObjects(
  linkedTables: string[],
  draft: AnalysisDraft | null,
  spec: AnalysisSpec | null,
): OntologyObjectType[] {
  const linked = new Set(linkedTables);
  return PHYSICAL_CATALOG.schemas.flatMap((schema) =>
    schema.tables.map((t) => {
      const isLinked = linked.size === 0 ? true : linked.has(t.name);
      let status: OntologyObjectType["status"] = "draft";
      if (spec) status = "locked";
      else if (draft && isLinked) status = "mapped";
      else if (isLinked) status = "draft";
      return {
        id: `${schema.name}.${t.name}`,
        name: t.name,
        schema: schema.name,
        role: t.role,
        description: tableDescription(t.name, t.role),
        primaryKey: guessPk(t.columns),
        propertyCount: t.columns.length,
        linked: isLinked,
        status,
      };
    }),
  );
}

export function buildOntologyProperties(
  objects: OntologyObjectType[],
  draft: AnalysisDraft | null,
  decisions?: Record<string, { chosenOption?: string; chosenOptions?: string[] }>,
): OntologyProperty[] {
  const props: OntologyProperty[] = [];

  for (const obj of objects.filter((o) => o.linked)) {
    const table = PHYSICAL_CATALOG.schemas
      .flatMap((s) => s.tables.map((t) => ({ schema: s.name, ...t })))
      .find((t) => t.name === obj.name);
    if (!table) continue;
    for (const col of table.columns) {
      const concept = draft?.concepts.find((c) =>
        c.columns.some((x) => x === col || x.endsWith(`.${col}`) || x.includes(col)),
      );
      props.push({
        id: `${obj.id}.${col}`,
        objectId: obj.id,
        objectName: obj.name,
        name: concept?.glossaryTerm ?? col,
        sourceColumn: `${obj.schema}.${obj.name}.${col}`,
        meaning: concept?.condition ?? `${obj.name}의 ${col}`,
        kind: concept ? "intent" : "physical",
        locked: Boolean(
          concept &&
            draft?.ambiguities.some((a) => {
              const d = decisions?.[a.id];
              return Boolean(d?.chosenOption || (d?.chosenOptions?.length ?? 0));
            }),
        ),
      });
    }
  }

  if (draft) {
    for (const c of draft.concepts) {
      if (props.some((p) => p.name === c.glossaryTerm)) continue;
      props.unshift({
        id: `intent-${c.concept}`,
        objectId: "intent",
        objectName: "(의도)",
        name: c.glossaryTerm ?? c.concept,
        sourceColumn: c.columns.join(", ") || "미연결",
        meaning: c.condition,
        kind: "derived",
        locked: false,
      });
    }
  }

  return props;
}

export function buildOntologyLinks(): OntologyLinkType[] {
  return ENTITY_GRAPH.map((e, i) => ({
    id: `link-${i}`,
    from: e.from,
    to: e.to,
    label: e.label,
    on: e.on,
    cardinality: e.label,
  }));
}

export function buildOntologyActions(
  locked: boolean,
): OntologyActionType[] {
  return [
    {
      id: "act-clarify",
      name: "의도 확정 카드 만들기",
      description: "목적·제약·기준·다음을 고른 뒤 지시서로 고정",
      requiresLock: false,
      available: true,
    },
    {
      id: "act-sql",
      name: "확정 기준 SQL 내보내기",
      description: "잠긴 기준이 있을 때만 SQL·명세를 반출",
      requiresLock: true,
      available: locked,
    },
    {
      id: "act-audit",
      name: "결과 CSV 점검",
      description: "확정 기준과 결과 숫자가 맞는지 검사",
      requiresLock: true,
      available: locked,
    },
    {
      id: "act-share",
      name: "확정 카드 공유",
      description: "동료·AI 채팅에 붙여넣을 마크다운 카드 복사",
      requiresLock: true,
      available: locked,
    },
  ];
}

export function buildOntologyKnowledge(
  draft: AnalysisDraft | null,
  spec: AnalysisSpec | null,
  glossary: string,
): OntologyKnowledge[] {
  const items: OntologyKnowledge[] = [];

  if (glossary.trim()) {
    items.push({
      id: "know-glossary",
      kind: "glossary",
      title: "용어 메모",
      body: glossary.trim().slice(0, 400),
      locked: Boolean(spec),
    });
  }

  if (draft) {
    for (const a of draft.ambiguities) {
      items.push({
        id: `know-amb-${a.id}`,
        kind: "constraint",
        title: a.title,
        body: a.whyItMatters,
        locked: false,
      });
    }
    for (const c of draft.concepts) {
      if (c.exceptions?.length) {
        items.push({
          id: `know-ex-${c.concept}`,
          kind: "exclusion",
          title: `${c.concept} 제외`,
          body: c.exceptions.join(" · "),
          locked: false,
        });
      }
    }
  }

  if (spec) {
    items.push({
      id: "know-rule-pop",
      kind: "rule",
      title: "분모 · 대상",
      body: spec.population,
      locked: true,
    });
    for (const ex of spec.exclusions) {
      items.push({
        id: `know-spec-ex-${ex}`,
        kind: "exclusion",
        title: "확정 제외 규칙",
        body: ex,
        locked: true,
      });
    }
  }

  if (!items.length) {
    items.push({
      id: "know-empty",
      kind: "rule",
      title: "지식 사전 비어 있음",
      body: "Analyze에서 초안을 채우거나 Agent에게 「온톨로지 초안」을 요청하세요. Enhans 지식사전·Foundry 공유 의미에 해당하는 규칙이 여기 모입니다.",
      locked: false,
    });
  }

  return items;
}
