import { NextResponse } from "next/server";
import { z } from "zod";
import { chatJson } from "@/lib/liner";
import { mockAudit } from "@/lib/mock-engine";
import { AUDIT_SYSTEM } from "@/lib/prompts";
import type { AnalysisSpec, AuditReport } from "@/lib/types";
import {
  guardLinerRoute,
  publicNoticeForLiveFailure,
  readJsonCapped,
  sanitizeError,
} from "@/lib/api-guard";

export const runtime = "nodejs";

const bodySchema = z.object({
  spec: z.custom<AnalysisSpec>(),
  resultRowsCsv: z.string().min(5).max(20_000),
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
        report: mockAudit(body.spec, body.resultRowsCsv),
        notice: "예제 모드로 진행해요.",
      });
    }

    try {
      const { data, mode } = await chatJson<Omit<AuditReport, "mode">>({
        system: AUDIT_SYSTEM,
        user: JSON.stringify(
          {
            spec: body.spec,
            resultRowsCsv: body.resultRowsCsv,
          },
          null,
          2,
        ),
      });
      const report: AuditReport = { ...data, mode };
      return NextResponse.json({ report });
    } catch (e) {
      const report = mockAudit(body.spec, body.resultRowsCsv);
      return NextResponse.json({
        report,
        notice: publicNoticeForLiveFailure(e),
      });
    }
  } catch (e) {
    return NextResponse.json({ error: sanitizeError(e) }, { status: 400 });
  }
}
