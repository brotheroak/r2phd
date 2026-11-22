import { NextResponse } from "next/server";
import { getIdentity } from "../../cursor/identity";
import { hasLinerKey } from "@/lib/liner";
import { safeHttpUrl } from "@/lib/safe-url";

export { safeHttpUrl };

const MAX_BODY_BYTES = 48_000;
const WINDOW_MS = 60_000;
const MAX_REQ_PER_WINDOW = 20;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function takeRateLimit(key: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const cur = buckets.get(key);
  if (!cur || now >= cur.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (cur.count >= MAX_REQ_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((cur.resetAt - now) / 1000) };
  }
  cur.count += 1;
  return { ok: true };
}

/** Strip third-party / stack noise from client-facing errors. */
export function sanitizeError(err: unknown): string {
  if (!(err instanceof Error)) return "요청을 처리하지 못했어요.";
  const msg = err.message || "";
  if (msg === "NO_LINER_KEY") return "NO_LINER_KEY";
  if (/zod|invalid_type|too_big|too_small/i.test(msg)) {
    return "입력이 올바르지 않아요.";
  }
  if (/Scholar search failed|liner|openai|fetch failed|ECONN|ETIMEDOUT|status_/i.test(msg)) {
    return "외부 서비스 호출에 실패했어요.";
  }
  if (msg.length > 120) return "요청을 처리하지 못했어요.";
  // Avoid leaking raw upstream text
  if (/[{[]/.test(msg) || /https?:\/\//i.test(msg)) {
    return "요청을 처리하지 못했어요.";
  }
  return "요청을 처리하지 못했어요.";
}

export function publicNoticeForLiveFailure(err: unknown): string {
  if (err instanceof Error && err.message === "NO_LINER_KEY") {
    return "API 키가 없어 예제로 진행해요.";
  }
  return "라이브 호출에 실패해 예제로 진행해요.";
}

function hasAppClientHeader(req: Request): boolean {
  return req.headers.get("x-intentspec-client") === "1";
}

function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!host) return false;
  if (!origin) {
    // Same-origin navigations / some local tools omit Origin; require our client header instead.
    return hasAppClientHeader(req);
  }
  try {
    const o = new URL(origin);
    return o.host === host;
  } catch {
    return false;
  }
}

export type LinerGate =
  | { ok: false; response: NextResponse }
  | { ok: true; allowLive: boolean; viewerSub: string | null };

/**
 * Protect paid Liner proxy routes:
 * - rate limit per IP
 * - require app client header (blocks naive CSRF form posts)
 * - same-origin check
 * - live Liner only for a verified Cursor viewer (private/team) or local simulated identity
 * - anonymous / public callers always get demo (never spend LINER_API_KEY)
 */
export async function guardLinerRoute(req: Request): Promise<LinerGate> {
  if (req.method !== "POST") {
    return {
      ok: false,
      response: NextResponse.json({ error: "method_not_allowed" }, { status: 405 }),
    };
  }

  if (!hasAppClientHeader(req)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "client_header_required" },
        { status: 403 },
      ),
    };
  }

  if (!isSameOrigin(req)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "origin_not_allowed" }, { status: 403 }),
    };
  }

  const ip = clientIp(req);
  const rl = takeRateLimit(`liner:${ip}`);
  if (!rl.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "rate_limited" },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfter) },
        },
      ),
    };
  }

  const identity = await getIdentity(req);
  const verified = identity.verified === true;
  const allowLive = Boolean(hasLinerKey() && verified);

  return {
    ok: true,
    allowLive,
    viewerSub: verified ? identity.sub : null,
  };
}

export async function readJsonCapped<T = unknown>(
  req: Request,
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  const len = req.headers.get("content-length");
  if (len && Number(len) > MAX_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: "body_too_large" }, { status: 413 }),
    };
  }
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: "body_too_large" }, { status: 413 }),
    };
  }
  try {
    return { ok: true, data: JSON.parse(raw || "{}") as T };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "invalid_json" }, { status: 400 }),
    };
  }
}

export function jsonError(status: number, code: string) {
  return NextResponse.json({ error: code }, { status });
}
