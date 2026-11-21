import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CONSOLE_AGENT_SYSTEM,
  mockConsoleAgent,
  type ConsoleAgentAction,
  type ConsoleAgentReply,
} from "@/lib/console-agent";
import { chatJson } from "@/lib/liner";

export const runtime = "nodejs";

const bodySchema = z.object({
  message: z.string().min(1).max(4000),
  tab: z.string(),
  linkedTables: z.array(z.string()).default([]),
  hasDraft: z.boolean().default(false),
  hasSpec: z.boolean().default(false),
  schemaPreview: z.string().default(""),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(12)
    .optional(),
});

export async function POST(req: Request) {
  try {
    const body = bodySchema.parse(await req.json());
    const ctx = {
      message: body.message,
      tab: body.tab,
      linkedTables: body.linkedTables,
      hasDraft: body.hasDraft,
      hasSpec: body.hasSpec,
      schemaPreview: body.schemaPreview.slice(0, 2000),
      history: body.history,
    };

    try {
      const historyBlock =
        body.history?.length
          ? `\n\n# Recent turns\n${body.history
              .map((h) => `${h.role}: ${h.content}`)
              .join("\n")}`
          : "";

      const { data, mode } = await chatJson<{
        reply: string;
        actions?: ConsoleAgentAction[];
      }>({
        system: CONSOLE_AGENT_SYSTEM,
        user: `# Current tab\n${body.tab}\n\n# Linked tables\n${body.linkedTables.join(", ") || "(none)"}\n\n# Has draft\n${body.hasDraft}\n\n# Has spec\n${body.hasSpec}\n\n# Schema preview\n${ctx.schemaPreview || "(empty)"}${historyBlock}\n\n# User message\n${body.message}`,
      });

      const reply: ConsoleAgentReply = {
        reply: data.reply || "요청을 처리했습니다.",
        actions: Array.isArray(data.actions) ? data.actions : [],
        mode,
      };
      return NextResponse.json(reply);
    } catch (e) {
      if (e instanceof Error && e.message === "NO_LINER_KEY") {
        return NextResponse.json(mockConsoleAgent(ctx));
      }
      return NextResponse.json({
        ...mockConsoleAgent(ctx),
        reply:
          mockConsoleAgent(ctx).reply +
          `\n\n(라이브 에이전트 호출 실패 → 예시 응답. ${e instanceof Error ? e.message : "unknown"})`,
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "invalid_request" },
      { status: 400 },
    );
  }
}
