import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CLARIFY_SYSTEM,
  type ClarifyBrief,
  type ClarifyDomain,
} from "@/lib/clarify";
import { mockClarifyBrief } from "@/lib/clarify-mock";
import { chatJson } from "@/lib/liner";
import {
  guardLinerRoute,
  publicNoticeForLiveFailure,
  readJsonCapped,
  sanitizeError,
} from "@/lib/api-guard";

export const runtime = "nodejs";

const bodySchema = z.object({
  question: z.string().min(3).max(4000),
  domain: z.enum(["analysis", "research", "everyday", "collab"]).optional(),
  context: z.string().max(4000).optional(),
});

export async function POST(req: Request) {
  const gate = await guardLinerRoute(req);
  if (!gate.ok) return gate.response;

  try {
    const raw = await readJsonCapped(req);
    if (!raw.ok) return raw.response;
    const body = bodySchema.parse(raw.data);

    if (!gate.allowLive) {
      return NextResponse.json({
        brief: mockClarifyBrief(body.question, body.domain),
        notice: "예제 모드로 진행해요.",
      });
    }

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
      return NextResponse.json({
        brief: {
          ...mockClarifyBrief(body.question, body.domain),
          mode: "demo" as const,
        },
        notice: publicNoticeForLiveFailure(e),
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: sanitizeError(e) === "NO_LINER_KEY" ? "invalid_request" : sanitizeError(e) },
      { status: 400 },
    );
  }
}
