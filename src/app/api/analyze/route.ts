import { NextResponse } from "next/server";
import { z } from "zod";
import { chatJson, scholarSearch } from "@/lib/liner";
import { mockAnalyzeDraft, mockScholarHits } from "@/lib/mock-engine";
import { ANALYZE_SYSTEM } from "@/lib/prompts";
import type { AnalysisDraft, ScholarHit } from "@/lib/types";
import {
  guardLinerRoute,
  publicNoticeForLiveFailure,
  readJsonCapped,
  safeHttpUrl,
  sanitizeError,
} from "@/lib/api-guard";

export const runtime = "nodejs";

const bodySchema = z.object({
  researchQuestion: z.string().min(10).max(4000),
  glossary: z.string().min(10).max(8000),
  schema: z.string().min(10).max(8000),
  includeScholar: z.boolean().optional().default(true),
});

function sanitizeHits(hits: ScholarHit[]): ScholarHit[] {
  return hits
    .map((h) => {
      const url = safeHttpUrl(h.url);
      if (!url) return null;
      return { ...h, url };
    })
    .filter((h): h is ScholarHit => Boolean(h));
}

export async function POST(req: Request) {
  const gate = await guardLinerRoute(req);
  if (!gate.ok) return gate.response;

  try {
    const raw = await readJsonCapped(req);
    if (!raw.ok) return raw.response;
    const body = bodySchema.parse(raw.data);

    if (!gate.allowLive) {
      return NextResponse.json({
        draft: mockAnalyzeDraft(body.researchQuestion),
        scholar: body.includeScholar
          ? sanitizeHits(mockScholarHits(body.researchQuestion))
          : [],
        notice: "예제 모드로 진행해요.",
      });
    }

    let scholar: ScholarHit[] = [];

    try {
      if (body.includeScholar) {
        const q = `${body.researchQuestion}\nkey terms from glossary for methodology`;
        const result = await scholarSearch(q, 5);
        scholar = sanitizeHits(result.hits);
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

      const { data, mode: chatMode } = await chatJson<
        Omit<AnalysisDraft, "mode">
      >({
        system: ANALYZE_SYSTEM,
        user: `# Research question\n${body.researchQuestion}\n\n# Glossary\n${body.glossary}\n\n# Schema\n${body.schema}${scholarBlock}`,
      });

      const draft: AnalysisDraft = {
        ...data,
        mode: chatMode,
        sourcesUsed: Array.from(
          new Set([
            ...(data.sourcesUsed ?? []),
            "Liner Model API",
            "Liner Scholar Search",
          ]),
        ),
      };

      return NextResponse.json({ draft, scholar });
    } catch (e) {
      const draft = mockAnalyzeDraft(body.researchQuestion);
      return NextResponse.json({
        draft: { ...draft, mode: "demo" as const },
        scholar: sanitizeHits(mockScholarHits(body.researchQuestion)),
        notice: publicNoticeForLiveFailure(e),
      });
    }
  } catch (e) {
    return NextResponse.json({ error: sanitizeError(e) }, { status: 400 });
  }
}
