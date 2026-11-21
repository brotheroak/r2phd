import { NextResponse } from "next/server";
import { z } from "zod";
import { chatJson } from "@/lib/liner";
import { mockConfirmSpec } from "@/lib/mock-engine";
import { CONFIRM_SYSTEM } from "@/lib/prompts";
import type { AnalysisDraft, AnalysisSpec, ResearcherDecision } from "@/lib/types";

export const runtime = "nodejs";

const decisionSchema = z.object({
  ambiguityId: z.string(),
  chosenOption: z.string().min(1),
  note: z.string().optional(),
});

const bodySchema = z.object({
  researchQuestion: z.string().min(10),
  glossary: z.string().min(10),
  schema: z.string().min(10),
  draft: z.custom<AnalysisDraft>(),
  decisions: z.array(decisionSchema).min(1),
});

export async function POST(req: Request) {
  try {
    const body = bodySchema.parse(await req.json());
    const payload = {
      researchQuestion: body.researchQuestion,
      glossary: body.glossary,
      schema: body.schema,
      draft: body.draft,
      decisions: body.decisions as ResearcherDecision[],
    };

    try {
      const { data, mode } = await chatJson<Omit<AnalysisSpec, "mode">>({
        system: CONFIRM_SYSTEM,
        user: JSON.stringify(payload, null, 2),
      });
      const spec: AnalysisSpec = { ...data, mode };
      return NextResponse.json({ spec });
    } catch (e) {
      const spec = mockConfirmSpec(payload);
      const notice =
        e instanceof Error && e.message === "NO_LINER_KEY"
          ? "데모 모드: 확정 옵션을 반영한 명세/SQL을 생성했습니다."
          : `Liner 호출 실패로 데모 컴파일러 사용: ${e instanceof Error ? e.message : "unknown"}`;
      return NextResponse.json({ spec, notice });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "invalid_request" },
      { status: 400 },
    );
  }
}
