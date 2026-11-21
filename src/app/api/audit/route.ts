import { NextResponse } from "next/server";
import { z } from "zod";
import { chatJson } from "@/lib/liner";
import { mockAudit } from "@/lib/mock-engine";
import { AUDIT_SYSTEM } from "@/lib/prompts";
import type { AnalysisSpec, AuditReport } from "@/lib/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  spec: z.custom<AnalysisSpec>(),
  resultRowsCsv: z.string().min(5),
});

export async function POST(req: Request) {
  try {
    const body = bodySchema.parse(await req.json());

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
      const notice =
        e instanceof Error && e.message === "NO_LINER_KEY"
          ? "예제 결과로 기준과 맞는지 점검했습니다."
          : `Liner 호출에 실패해 예제로 진행합니다. (${e instanceof Error ? e.message : "unknown"})`;
      return NextResponse.json({ report, notice });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "invalid_request" },
      { status: 400 },
    );
  }
}
