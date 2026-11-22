import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CONSOLE_AGENT_SYSTEM,
  mockConsoleAgent,
  type ConsoleAgentAction,
  type ConsoleAgentReply,
} from "@/lib/console-agent";
import { chatJson } from "@/lib/liner";
import {
  guardLinerRoute,
  publicNoticeForLiveFailure,
  readJsonCapped,
  sanitizeError,
} from "@/lib/api-guard";

export const runtime = "nodejs";

const bodySchema = z.object({
  message: z.string().min(1).max(4000),
  tab: z.string().max(64),
  linkedTables: z.array(z.string().max(120)).max(40).default([]),
  hasDraft: z.boolean().default(false),
  hasSpec: z.boolean().default(false),
  schemaPreview: z.string().max(4000).default(""),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      }),
    )
    .max(12)
    .optional(),
});

export async function POST(req: Request) {
  const gate = await guardLinerRoute(req);
  if (!gate.ok) return gate.response;

  try {
    const raw = await readJsonCapped(req);
    if (!raw.ok) return raw.response;
    const body = bodySchema.parse(raw.data);
    const ctx = {
      message: body.message,
      tab: body.tab,
      linkedTables: body.linkedTables,
      hasDraft: body.hasDraft,
      hasSpec: body.hasSpec,
      schemaPreview: body.schemaPreview.slice(0, 2000),
      history: body.history,
    };

    if (!gate.allowLive) {
      return NextResponse.json({
        ...mockConsoleAgent(ctx),
        notice: "예제 모드로 진행해요.",
      });
    }

    try {
      const historyBlock = body.history?.length
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
      const demo = mockConsoleAgent(ctx);
      return NextResponse.json({
        ...demo,
        reply: `${demo.reply}\n\n(${publicNoticeForLiveFailure(e)})`,
      });
    }
  } catch (e) {
    return NextResponse.json({ error: sanitizeError(e) }, { status: 400 });
  }
}
