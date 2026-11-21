import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CLARIFY_SYSTEM,
  type ClarifyBrief,
  type ClarifyDomain,
} from "@/lib/clarify";
import { mockClarifyBrief } from "@/lib/clarify-mock";
import { chatJson } from "@/lib/liner";

export const runtime = "nodejs";

const bodySchema = z.object({
  question: z.string().min(3).max(4000),
  domain: z.enum(["analysis", "research", "everyday", "collab"]).optional(),
  context: z.string().max(8000).optional(),
});

export async function POST(req: Request) {
  try {
    const body = bodySchema.parse(await req.json());

    try {
      const { data, mode } = await chatJson<Omit<ClarifyBrief, "mode">>({
        system: CLARIFY_SYSTEM,
        user: `# Domain hint\n${body.domain ?? "(infer)"}\n\n# Question\n${body.question}\n\n# Context\n${body.context ?? "(none)"}`,
      });
      const brief: ClarifyBrief = {
        ...data,
        domain: (data.domain ?? body.domain ?? "everyday") as ClarifyDomain,
        mode,
      };
      return NextResponse.json({ brief });
    } catch (e) {
      if (e instanceof Error && e.message === "NO_LINER_KEY") {
        return NextResponse.json({
          brief: mockClarifyBrief(body.question, body.domain),
          notice: "API 키가 없어 질문 구체화 예제로 진행합니다.",
        });
      }
      return NextResponse.json({
        brief: {
          ...mockClarifyBrief(body.question, body.domain),
          mode: "demo" as const,
        },
        notice: `라이브 호출 실패 → 예제. (${e instanceof Error ? e.message : "unknown"})`,
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "invalid_request" },
      { status: 400 },
    );
  }
}
