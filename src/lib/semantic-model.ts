import {
  AXIS_BY_ID,
  INTENT_AXES,
  kindToAxis,
  type IntentAxisId,
} from "./intent-axes";
import type { AnalysisDraft, AnalysisSpec, ConceptLink } from "./types";

/** Databricks-style catalog entries for the fictional warehouse. */
export const PHYSICAL_CATALOG = {
  name: "quality_lab",
  schemas: [
    {
      name: "core",
      tables: [
        {
          name: "products",
          columns: ["product_code", "product_name", "family"],
          role: "차원",
        },
        {
          name: "lots",
          columns: ["product_code", "lot_no", "manufacture_date", "supplier_lot"],
          role: "엔터티",
        },
        {
          name: "tests",
          columns: [
            "test_id",
            "product_code",
            "lot_no",
            "test_date",
            "ingest_date",
            "assay_name",
          ],
          role: "사실",
        },
        {
          name: "dispositions",
          columns: ["test_id", "disposition", "decided_at", "note"],
          role: "사실",
        },
      ],
    },
  ],
} as const;

export const ENTITY_GRAPH = [
  { from: "products", to: "lots", on: "product_code", label: "1:N" },
  {
    from: "lots",
    to: "tests",
    on: "product_code + lot_no",
    label: "복합키",
  },
  { from: "tests", to: "dispositions", on: "test_id", label: "1:1" },
] as const;

export type CatalogTable = {
  schema: string;
  name: string;
  columns: readonly string[];
  role: string;
};

export function listCatalogTables(): CatalogTable[] {
  return PHYSICAL_CATALOG.schemas.flatMap((schema) =>
    schema.tables.map((table) => ({
      schema: schema.name,
      name: table.name,
      columns: table.columns,
      role: table.role,
    })),
  );
}

/** Build analysis schema text from selected catalog tables. */
export function buildSchemaFromTables(tableNames: string[]): string {
  const selected = new Set(tableNames);
  const lines: string[] = [
    `# 데이터 구조 (${PHYSICAL_CATALOG.name})`,
    "",
  ];

  for (const schema of PHYSICAL_CATALOG.schemas) {
    for (const table of schema.tables) {
      if (!selected.has(table.name)) continue;
      lines.push(
        `${table.name}(${table.columns.join(", ")})  -- ${table.role} · schema.${schema.name}`,
      );
    }
  }

  const edges = ENTITY_GRAPH.filter(
    (e) => selected.has(e.from) && selected.has(e.to),
  );
  if (edges.length) {
    lines.push("", "관계");
    for (const e of edges) {
      lines.push(`- ${e.from} —${e.label}→ ${e.to} ON ${e.on}`);
    }
  }

  lines.push(
    "",
    "주의",
    "- lots.lot_no 단독으로는 unique 하지 않음",
    "- tests.ingest_date 는 ETL 적재일 (연구 '최근'과 무관)",
    "- supplier_lot 을 lot_no 와 조인하면 잘못된 매칭 발생",
  );

  return lines.join("\n");
}

export function allCatalogTableNames(): string[] {
  return listCatalogTables().map((t) => t.name);
}

export type SemanticMapping = {
  id: string;
  axis: IntentAxisId;
  intentConcept: string;
  glossaryTerm: string;
  physical: string[];
  condition: string;
  exceptions: string[];
  locked: boolean;
  chosen?: string;
};

export type SemanticMetric = {
  id: string;
  name: string;
  expression: string;
  grain: string;
  filters: string[];
  locked: boolean;
};

export function mappingsFromDraft(
  draft: AnalysisDraft | null,
  decisions?: Record<string, { chosenOption: string }>,
): SemanticMapping[] {
  if (!draft) {
    return INTENT_AXES.map((axis) => ({
      id: `axis-${axis.id}`,
      axis: axis.id,
      intentConcept: axis.label,
      glossaryTerm: "아직 연결 안 됨",
      physical: [],
      condition: axis.question,
      exceptions: [],
      locked: false,
    }));
  }

  return draft.concepts.map((c, i) => {
    const amb = draft.ambiguities.find((a) =>
      relatedAmbiguity(c, a.title, a.kind),
    );
    const axis = amb ? kindToAxis(amb.kind) : guessAxis(c);
    const chosen = amb ? decisions?.[amb.id]?.chosenOption : undefined;
    return {
      id: `map-${i}`,
      axis,
      intentConcept: c.concept,
      glossaryTerm: c.glossaryTerm ?? "—",
      physical: c.columns,
      condition: c.condition,
      exceptions: c.exceptions,
      locked: Boolean(chosen),
      chosen,
    };
  });
}

function relatedAmbiguity(
  c: ConceptLink,
  title: string,
  kind: string,
): boolean {
  const blob = `${c.concept} ${c.glossaryTerm ?? ""} ${title}`.toLowerCase();
  if (kind === "date_anchor" && /최근|기간|날짜|date|test_date/.test(blob))
    return true;
  if (kind === "identifier_scope" && /제조|로트|식별|product|lot/.test(blob))
    return true;
  if (kind === "term_conflict" && /실패|부적합|fail|재시험/.test(blob))
    return true;
  if (kind === "aggregation" && /분모|로트 수|집계|시험/.test(blob)) return true;
  return false;
}

function guessAxis(c: ConceptLink): IntentAxisId {
  const blob = `${c.concept} ${c.glossaryTerm ?? ""} ${c.condition}`;
  if (/최근|기간|날짜|date/.test(blob)) return "time";
  if (/제조|식별|로트|product|lot/.test(blob)) return "identity";
  if (/분모|대상|population/.test(blob)) return "population";
  return "measure";
}

export function metricsFromSpec(spec: AnalysisSpec | null): SemanticMetric[] {
  if (!spec) {
    return [
      {
        id: "m-fail-rate",
        name: "실패율",
        expression: "아직 기준이 정해지지 않음",
        grain: "로트",
        filters: [],
        locked: false,
      },
    ];
  }

  return [
    {
      id: "m-primary",
      name: spec.title,
      expression: spec.measures.join(" · "),
      grain: spec.population,
      filters: [...spec.filters, ...spec.exclusions],
      locked: true,
    },
  ];
}

export { AXIS_BY_ID, INTENT_AXES };
