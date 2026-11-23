import OpenAI from "openai";
import type { ScholarHit } from "./types";
import { safeHttpUrl } from "./safe-url";

const BASE_URL = "https://platform.liner.com/api/v1";

export function hasLinerKey(): boolean {
  return Boolean(process.env.LINER_API_KEY?.trim());
}

export function getLinerClient(): OpenAI | null {
  const key = process.env.LINER_API_KEY?.trim();
  if (!key) return null;
  return new OpenAI({
    apiKey: key,
    baseURL: BASE_URL,
  });
}

/**
 * Models sometimes wrap JSON in a markdown code fence (```json … ```).
 * Strip the fence before JSON.parse so a single formatting habit
 * does not turn a good answer into a live-call failure.
 */
export function stripJsonFence(raw: string): string {
  const text = raw.trim();
  if (!text.startsWith("```")) return text;

  const fenced = text.match(
    /^```[\w-]*[ \t]*\r?\n([\s\S]*?)\r?\n?[ \t]*```$/,
  );
  if (fenced) return fenced[1].trim();

  // Unterminated fence: drop the opening line and any dangling closer.
  return text
    .replace(/^```[\w-]*[ \t]*\r?\n?/, "")
    .replace(/\r?\n?[ \t]*```$/, "")
    .trim();
}

/** Liner Model API via OpenAI-compatible chat completions. */
export async function chatJson<T>(args: {
  system: string;
  user: string;
  model?: string;
}): Promise<{ data: T; mode: "live" | "demo"; raw: string }> {
  const client = getLinerClient();
  if (!client) {
    throw new Error("NO_LINER_KEY");
  }

  const response = await client.chat.completions.create({
    model: args.model ?? "liner-gpt-router",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: args.system },
      { role: "user", content: args.user },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const data = JSON.parse(stripJsonFence(raw)) as T;
  return { data, mode: "live", raw };
}

/** Liner Scholar Search — grounds ambiguous research terms. */
export async function scholarSearch(
  query: string,
  maxResults = 5,
): Promise<{ hits: ScholarHit[]; mode: "live" | "demo" }> {
  const key = process.env.LINER_API_KEY?.trim();
  if (!key) {
    throw new Error("NO_LINER_KEY");
  }

  const res = await fetch(`${BASE_URL}/tools/search/scholar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
    },
    body: JSON.stringify({
      query,
      lang: "en",
      max_results: maxResults,
    }),
  });

  if (!res.ok) {
    throw new Error(`Scholar search failed (${res.status})`);
  }

  const json = (await res.json()) as {
    results?: Array<{
      title: string;
      url: string;
      description: string;
      date?: string;
      authors?: string[];
      journal?: string;
      citationCount?: number;
    }>;
  };

  const hits: ScholarHit[] = [];
  for (const r of json.results ?? []) {
    const url = safeHttpUrl(r.url);
    if (!url) continue;
    hits.push({
      title: r.title,
      url,
      description: r.description,
      date: r.date,
      authors: r.authors,
      journal: r.journal,
      citationCount: r.citationCount,
    });
  }

  return { hits, mode: "live" };
}

export async function creditsBalance(): Promise<{
  balanceUsd?: string;
  ok: boolean;
  error?: string;
}> {
  const key = process.env.LINER_API_KEY?.trim();
  if (!key) return { ok: false, error: "missing_key" };

  try {
    const res = await fetch(`${BASE_URL}/credits/balance`, {
      headers: { "x-api-key": key },
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, error: `status_${res.status}` };
    }
    const json = (await res.json()) as { balance_usd?: string };
    return { ok: true, balanceUsd: json.balance_usd };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network" };
  }
}
