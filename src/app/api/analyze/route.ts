import { NextResponse } from "next/server";
import { z } from "zod";
import { chatJson, scholarSearch } from "@/lib/liner";
import { mockAnalyzeDraft, mockScholarHits } from "@/lib/mock-engine";
import { ANALYZE_SYSTEM } from "@/lib/prompts";
import type { AnalysisDraft, ScholarHit } from "@/lib/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  researchQuestion: z.string().min(10),
  glossary: z.string().min(10),
  schema: z.string().min(10),
  includeScholar: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = bodySchema.parse(json);

    let scholar: ScholarHit[] = [];
    let mode: "live" | "demo" = "demo";

    try {
      if (body.includeScholar) {
        const q = `${body.researchQuestion}\nkey terms from glossary for methodology`;
        const result = await scholarSearch(q, 5);
        scholar = result.hits;
        mode = result.mode;
      }

      const scholarBlock =
        scholar.length > 0
          ? `\n\n# Scholar grounding\n${scholar
              .map(
                (h, i) =>
                  `${i + 1}. ${h.title} (${h.journal ?? "n/a"}, ${h.date ?? "n/a"})\n${h.description}\n${h.url}`,
              )
              .join("\n")}`
          : "";

      const { data, mode: chatMode } = await chatJson<Omit<AnalysisDraft, "mode">>({
        system: ANALYZE_SYSTEM,
        user: `# Research question\n${body.researchQuestion}\n\n# Glossary\n${body.glossary}\n\n# Schema\n${body.schema}${scholarBlock}`,
      });

      const draft: AnalysisDraft = {
        ...data,
        mode: chatMode,
        sourcesUsed: Array.from(
          new Set([...(data.sourcesUsed ?? []), "Liner Model API", "Liner Scholar Search"]),
        ),
      };

      return NextResponse.json({ draft, scholar });
    } catch (e) {
      if (e instanceof Error && e.message === "NO_LINER_KEY") {
        const draft = mockAnalyzeDraft();
        scholar = body.includeScholar ? mockScholarHits(body.researchQuestion) : [];
        return NextResponse.json({
          draft,
          scholar,
          notice: "데모 모드: LINER_API_KEY가 없어 샘플 추론을 사용합니다.",
        });
      }
      // Live call failed — fall back so the demo never bricks
      const draft = mockAnalyzeDraft();
      return NextResponse.json({
        draft: { ...draft, mode: "demo" as const },
        scholar: mockScholarHits(body.researchQuestion),
        notice: `Liner 호출 실패로 데모 엔진 사용: ${e instanceof Error ? e.message : "unknown"}`,
        mode,
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "invalid_request" },
      { status: 400 },
    );
  }
}
