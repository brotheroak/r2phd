import {
  AXIS_BY_ID,
  INTENT_AXES,
  kindToAxis,
  type IntentAxisId,
} from "./intent-axes";
import type { AnalysisDraft, AnalysisSpec, ConceptLink } from "./types";

/** Databricks-style catalog: quality + finance (SAP/홈택스/급여 가상). */
export const PHYSICAL_CATALOG = {
  name: "ops_lab",
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
    {
      name: "finance",
      tables: [
        {
          name: "company_codes",
          columns: ["company_code", "name"],
          role: "차원",
        },
        {
          name: "fi_documents",
          columns: [
            "doc_id",
            "company_code",
            "posting_date",
            "load_date",
            "amount",
            "reversal_of",
          ],
          role: "사실",
        },
        {
          name: "tax_items",
          columns: ["doc_id", "tax_code", "vat_amount", "base_amount"],
          role: "사실",
        },
        {
          name: "hometax_returns",
          columns: ["period", "return_type", "filed_vat", "filed_at"],
          role: "참조",
        },
        {
          name: "employees",
          columns: ["employee_id", "org_unit", "hire_date", "leave_date"],
          role: "차원",
        },
        {
          name: "payroll_runs",
          columns: [
            "run_id",
            "pay_period",
            "status",
            "confirmed_at",
            "load_date",
          ],
          role: "사실",
        },
        {
          name: "wage_lines",
          columns: ["run_id", "employee_id", "wage_type", "gross_amount"],
          role: "사실",
        },
        {
          name: "withholding_lines",
          columns: ["run_id", "employee_id", "tax_code", "withheld_amount"],
          role: "사실",
        },
      ],
    },
    {
      name: "integration",
      tables: [
        {
          name: "rfc_interfaces",
          columns: [
            "iface_id",
            "function_module",
            "direction",
            "owner_team",
            "last_reviewed_at",
          ],
          role: "메타",
        },
        {
          name: "eai_maps",
          columns: [
            "map_id",
            "source_system",
            "target_system",
            "source_field",
            "target_field",
            "transform",
            "stale",
          ],
          role: "메타",
        },
        {
          name: "sap_field_catalog",
          columns: [
            "field_id",
            "table_name",
            "field_name",
            "data_element",
            "description_ko",
            "managed",
          ],
          role: "메타",
        },
        {
          name: "warehouse_field_catalog",
          columns: [
            "field_id",
            "schema_name",
            "table_name",
            "column_name",
            "description",
            "managed",
          ],
          role: "메타",
        },
        {
          name: "sync_runs",
          columns: [
            "run_id",
            "iface_id",
            "started_at",
            "finished_at",
            "row_count",
            "status",
          ],
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
  {
    from: "company_codes",
    to: "fi_documents",
    on: "company_code",
    label: "1:N",
  },
  { from: "fi_documents", to: "tax_items", on: "doc_id", label: "1:N" },
  { from: "employees", to: "wage_lines", on: "employee_id", label: "1:N" },
  { from: "payroll_runs", to: "wage_lines", on: "run_id", label: "1:N" },
  {
    from: "payroll_runs",
    to: "withholding_lines",
    on: "run_id",
    label: "1:N",
  },
  {
    from: "rfc_interfaces",
    to: "sync_runs",
    on: "iface_id",
    label: "1:N",
  },
  {
    from: "sap_field_catalog",
    to: "eai_maps",
    on: "field≈source_field",
    label: "매핑",
  },
  {
    from: "eai_maps",
    to: "warehouse_field_catalog",
    on: "target_field≈column",
    label: "매핑",
  },
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
    "- 날짜·키·세금코드/임금유형을 확정하기 전에 합계를 확정하지 말 것",
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
  if (
    kind === "date_anchor" &&
    /최근|기간|날짜|date|test_date|posting|귀속|pay_period|과세/.test(blob)
  )
    return true;
  if (
    kind === "identifier_scope" &&
    /제조|로트|식별|product|lot|회사|사업장|org|company/.test(blob)
  )
    return true;
  if (
    kind === "term_conflict" &&
    /실패|부적합|fail|재시험|세금코드|과세|런|meal|비과세/.test(blob)
  )
    return true;
  if (
    kind === "aggregation" &&
    /분모|로트 수|집계|시험|역분개|식대|표준/.test(blob)
  )
    return true;
  return false;
}

function guessAxis(c: ConceptLink): IntentAxisId {
  const blob = `${c.concept} ${c.glossaryTerm ?? ""} ${c.condition}`;
  if (/최근|기간|날짜|date|귀속|과세기간|posting|pay_period/.test(blob))
    return "time";
  if (/제조|식별|로트|product|lot|회사|사업장|org/.test(blob)) return "identity";
  if (/분모|대상|population|인원/.test(blob)) return "population";
  return "measure";
}

export function metricsFromSpec(spec: AnalysisSpec | null): SemanticMetric[] {
  if (!spec) {
    return [
      {
        id: "m-pending",
        name: "지표 (미확정)",
        expression: "아직 기준이 정해지지 않음",
        grain: "확정 전",
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
