import {
  ENTITY_GRAPH,
  PHYSICAL_CATALOG,
  allCatalogTableNames,
  listCatalogTables,
} from "./semantic-model";
import { SAMPLE_PROJECT } from "./sample-project";
import { mockAnalyzeDraft } from "./mock-engine";
import type { AnalysisDraft } from "./types";

export type ConsoleAgentAction =
  | { type: "link_tables"; tables: string[] }
  | { type: "apply_schema" }
  | { type: "seed_demo_workspace" }
  | { type: "seed_ontology_draft" }
  | { type: "navigate"; tab: "analyze" | "catalog" | "ontology" | "metrics" | "lineage" };

export type ConsoleAgentReply = {
  reply: string;
  actions: ConsoleAgentAction[];
  mode: "live" | "demo";
};

export type ConsoleAgentContext = {
  tab: string;
  linkedTables: string[];
  hasDraft: boolean;
  hasSpec: boolean;
  schemaPreview: string;
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
};

export const CONSOLE_AGENT_SYSTEM = `당신은 IntentSpec 시맨틱 콘솔의 에이전트입니다.
사용자는 Catalog / Ontology / Metrics / Lineage / Analyze 어디서든 말합니다.
Analyze를 강제하지 마세요. 카탈로그 조회·테이블 연결·온톨로지 초안·지표 설명·관계 설명을 바로 돕습니다.

STRICT JSON만:
{
  "reply": string,  // 한국어, 짧고 실무적으로
  "actions": array  // 0개 이상. 아래 type만
}

actions type:
- {"type":"link_tables","tables":["products","lots",...]}  // 카탈로그 테이블 선택
- {"type":"apply_schema"}  // 선택 테이블을 분석 스키마 텍스트로 반영
- {"type":"seed_demo_workspace"}  // 예제 질문·용어·스키마·초안 채우기
- {"type":"seed_ontology_draft"}  // 온톨로지/매핑 초안만 채우기
- {"type":"navigate","tab":"catalog"|"ontology"|"metrics"|"lineage"|"analyze"}

규칙:
- 사용자가 테이블 연결·스키마 반영·예제 로드·매핑 초안을 원하면 해당 action을 넣으세요.
- 단순 질문이면 actions는 [] 이고 reply로만 답하세요.
- 없는 테이블 이름을 만들지 마세요. 가능한 테이블: products, lots, tests, dispositions.
- 번역투 금지. 쉬운 한국어.`;

export function mockConsoleAgent(ctx: ConsoleAgentContext): ConsoleAgentReply {
  const q = ctx.message.trim().toLowerCase();
  const tables = allCatalogTableNames();

  if (/전체|모두|다 연결|전부 연결|link all|select all/.test(q)) {
    return {
      mode: "demo",
      reply:
        "카탈로그 테이블 네 개를 모두 선택하고 분석 스키마에도 반영합니다. Catalog·Analyze에서 바로 이어서 쓸 수 있어요.",
      actions: [
        { type: "link_tables", tables },
        { type: "apply_schema" },
      ],
    };
  }

  if (/연결|스키마|표 구조|reflect|apply/.test(q) && /테이블|catalog|카탈로그|schema/.test(q)) {
    const picked = tables.filter((t) => q.includes(t));
    const use = picked.length ? picked : tables;
    return {
      mode: "demo",
      reply: picked.length
        ? `${picked.join(", ")} 테이블을 연결하고 스키마에 반영합니다.`
        : "아직 고른 테이블이 없어 core 스키마 전체를 연결·반영합니다. 일부만 쓰려면 테이블 이름을 말해 주세요.",
      actions: [
        { type: "link_tables", tables: use },
        { type: "apply_schema" },
        { type: "navigate", tab: "catalog" },
      ],
    };
  }

  for (const t of tables) {
    if (q.includes(t) && /(뭐|무엇|설명|컬럼|column|역할|role)/.test(q)) {
      const meta = listCatalogTables().find((x) => x.name === t)!;
      return {
        mode: "demo",
        reply: `${t}는 ${meta.role} 테이블입니다 (schema.${meta.schema}). 컬럼: ${meta.columns.join(", ")}. 연결하려면 「${t} 연결해줘」라고 말해 주세요.`,
        actions: [],
      };
    }
    if (q.includes(t) && /(연결|추가|골라|선택)/.test(q)) {
      const next = Array.from(new Set([...ctx.linkedTables, t]));
      return {
        mode: "demo",
        reply: `${t}를 선택 목록에 넣었습니다. 「스키마에 반영」하면 Analyze 입력에 들어갑니다.`,
        actions: [
          { type: "link_tables", tables: next },
          { type: "navigate", tab: "catalog" },
        ],
      };
    }
  }

  if (/온톨로지|매핑|ontology|초안/.test(q)) {
    return {
      mode: "demo",
      reply: ctx.hasDraft
        ? "이미 매핑 초안이 있습니다. Ontology 탭에서 의도→용어→컬럼을 확인하고, 필요하면 Analyze에서 기준을 고치세요."
        : "로트 실패율 예제 기준으로 온톨로지 매핑 초안을 채웁니다. Analyze를 거치지 않아도 Ontology에서 바로 볼 수 있어요.",
      actions: ctx.hasDraft
        ? [{ type: "navigate", tab: "ontology" }]
        : [
            { type: "seed_ontology_draft" },
            { type: "link_tables", tables },
            { type: "apply_schema" },
            { type: "navigate", tab: "ontology" },
          ],
    };
  }

  if (/예제|샘플|데모|실패율|돌려|시작/.test(q)) {
    return {
      mode: "demo",
      reply:
        "로트 실패율 예제(질문·용어·스키마·매핑 초안)를 워크스페이스에 넣습니다. Analyze·Ontology·Metrics에서 바로 이어서 보세요.",
      actions: [
        { type: "seed_demo_workspace" },
        { type: "navigate", tab: "analyze" },
      ],
    };
  }

  if (/지표|metric|측정|grain/.test(q)) {
    return {
      mode: "demo",
      reply: ctx.hasSpec
        ? "확정된 명세 기준으로 Metrics에 측정값·grain·필터가 올라와 있습니다. Metrics 탭으로 이동할게요."
        : ctx.hasDraft
          ? "매핑 초안은 있지만 지표는 Analyze에서 기준을 확정해야 고정됩니다. 지금은 Ontology에서 연결을 먼저 보거나, 「예제 돌려줘」로 전체 초안을 채울 수 있어요."
          : "지표를 보려면 먼저 매핑 초안이 필요합니다. 「온톨로지 초안 만들어줘」또는 「예제 돌려줘」라고 말해 주세요.",
      actions: ctx.hasSpec
        ? [{ type: "navigate", tab: "metrics" }]
        : ctx.hasDraft
          ? [{ type: "navigate", tab: "ontology" }]
          : [
              { type: "seed_ontology_draft" },
              { type: "navigate", tab: "metrics" },
            ],
    };
  }

  if (/라인|lineage|관계|조인|그래프/.test(q)) {
    const edges = ENTITY_GRAPH.map(
      (e) => `${e.from} —${e.label}→ ${e.to} ON ${e.on}`,
    ).join("\n");
    return {
      mode: "demo",
      reply: `quality_lab.core 엔터티 관계입니다.\n${edges}\nLineage 탭에서도 같은 그래프를 볼 수 있어요.`,
      actions: [{ type: "navigate", tab: "lineage" }],
    };
  }

  if (/카탈로그|catalog|테이블 목록|무슨 표/.test(q)) {
    const list = listCatalogTables()
      .map((t) => `- ${t.name} (${t.role}): ${t.columns.join(", ")}`)
      .join("\n");
    return {
      mode: "demo",
      reply: `${PHYSICAL_CATALOG.name} / core\n${list}\n「전체 연결해줘」또는 「tests 연결해줘」로 분석 스키마에 붙일 수 있습니다.`,
      actions: [{ type: "navigate", tab: "catalog" }],
    };
  }

  // Default: contextual help for current tab
  const tabHelp: Record<string, string> = {
    catalog:
      "여기선 테이블을 고르고 스키마에 반영할 수 있어요. 「전체 연결해줘」, 「tests가 뭐야?」처럼 말해 보세요.",
    ontology: ctx.hasDraft
      ? "매핑 초안이 있습니다. 특정 축(기간·식별·측정·분모)에 대해 물어보거나 「예제 다시 돌려줘」라고 할 수 있어요."
      : "아직 매핑이 비어 있습니다. 「온톨로지 초안 만들어줘」라고 하면 Analyze 없이 채웁니다.",
    metrics: "지표·grain 설명을 묻거나 「예제 돌려줘」로 초안을 채울 수 있어요.",
    lineage: "「관계 설명해줘」라고 하면 조인 그래프를 풀어 줍니다.",
    analyze: "질문을 다듬거나 「예제 불러와줘」라고 하면 샘플을 넣습니다.",
  };

  return {
    mode: "demo",
    reply:
      tabHelp[ctx.tab] ??
      "Catalog·Ontology·Metrics·Lineage·Analyze 어디든 물어보세요. 예: 「전체 테이블 연결」, 「온톨로지 초안」, 「관계 설명해줘」.",
    actions: [],
  };
}

export function demoWorkspaceSeed(): {
  researchQuestion: string;
  glossary: string;
  schema: string;
  resultCsv: string;
  linkedTables: string[];
  draft: AnalysisDraft;
} {
  return {
    researchQuestion: SAMPLE_PROJECT.researchQuestion,
    glossary: SAMPLE_PROJECT.glossary,
    schema: SAMPLE_PROJECT.schema,
    resultCsv: SAMPLE_PROJECT.resultRowsCsv,
    linkedTables: allCatalogTableNames(),
    draft: mockAnalyzeDraft(),
  };
}
