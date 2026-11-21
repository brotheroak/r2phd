import { KIND_LABEL } from "./intent-axes";
import type {
  AnalysisDraft,
  AnalysisSpec,
  ResearcherDecision,
} from "./types";

export function undecidedCount(
  draft: AnalysisDraft | null,
  decisions: Record<string, ResearcherDecision>,
): number {
  if (!draft) return 0;
  return draft.ambiguities.filter((a) => !decisions[a.id]?.chosenOption).length;
}

export function buildIntentLockMarkdown(args: {
  researchQuestion: string;
  draft: AnalysisDraft;
  decisions: Record<string, ResearcherDecision>;
  spec?: AnalysisSpec | null;
  lockedAt?: string | null;
}): string {
  const { researchQuestion, draft, decisions, spec, lockedAt } = args;
  const lines: string[] = [
    `# IntentSpec 기준 확정 카드`,
    ``,
    `상태: ${spec ? "확정됨 · SQL 내보내기 가능" : "아직 미확정 · SQL 내보내기 불가"}`,
    lockedAt ? `확정 시각: ${lockedAt}` : "",
    ``,
    `## 질문`,
    researchQuestion.trim(),
    ``,
    `## 고정한 기준`,
  ].filter(Boolean) as string[];

  for (const a of draft.ambiguities) {
    const chosen = decisions[a.id]?.chosenOption ?? "(미선택)";
    lines.push(
      `- **${KIND_LABEL[a.kind] ?? a.kind}** · ${a.title}`,
      `  - 선택: ${chosen}`,
      `  - 왜: ${a.whyItMatters}`,
    );
  }

  if (spec) {
    lines.push(
      ``,
      `## 내보내기 요약`,
      `- 기간: ${spec.dateAnchor}`,
      `- 식별: ${spec.identifierScope}`,
      `- 분모/대상: ${spec.population}`,
      `- 제외: ${spec.exclusions.join("; ") || "—"}`,
    );
  }

  lines.push(
    ``,
    `---`,
    `이 카드 없이 숫자·SQL을 회의에 올리지 마세요.`,
  );
  return lines.join("\n");
}
