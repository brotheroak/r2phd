import { NextResponse } from "next/server";
import { z } from "zod";
import { chatJson } from "@/lib/liner";
import { mockConfirmSpec } from "@/lib/mock-engine";
import { CONFIRM_SYSTEM } from "@/lib/prompts";
import type { AnalysisDraft, AnalysisSpec, ResearcherDecision } from "@/lib/types";
import {
  guardLinerRoute,
  publicNoticeForLiveFailure,
  readJsonCapped,
  sanitizeError,
} from "@/lib/api-guard";

export const runtime = "nodejs";

const decisionSchema = z.object({
  ambiguityId: z.string().max(120),
  chosenOption: z.string().min(1).max(500),
  note: z.string().max(1000).optional(),
});

const bodySchema = z.object({
  researchQuestion: z.string().min(10).max(4000),
  glossary: z.string().min(10).max(8000),
  schema: z.string().min(10).max(8000),
  draft: z.custom<AnalysisDraft>(),
  decisions: z.array(decisionSchema).min(1).max(20),
});

export async function POST(req: Request) {
  const gate = await guardLinerRoute(req);
  if (!gate.ok) return gate.response;

  try {
    const raw = await readJsonCapped(req);
    if (!raw.ok) return raw.response;
    const body = bodySchema.parse(raw.data);
    const payload = {
      researchQuestion: body.researchQuestion,
      glossary: body.glossary,
      schema: body.schema,
      draft: body.draft,
      decisions: body.decisions as ResearcherDecision[],
    };

    if (!gate.allowLive) {
      return NextResponse.json({
        spec: mockConfirmSpec(payload),
        notice: "예제 모드로 진행해요.",
      });
    }

    try {
      const { data, mode } = await chatJson<Omit<AnalysisSpec, "mode">>({
        system: CONFIRM_SYSTEM,
        user: JSON.stringify(payload, null, 2),
      });
      const spec: AnalysisSpec = { ...data, mode };
      return NextResponse.json({ spec });
    } catch (e) {
      const spec = mockConfirmSpec(payload);
      return NextResponse.json({
        spec,
        notice: publicNoticeForLiveFailure(e),
      });
    }
  } catch (e) {
    return NextResponse.json({ error: sanitizeError(e) }, { status: 400 });
  }
}
