import { NextResponse } from "next/server";
import { hasLinerKey } from "@/lib/liner";
import { getIdentity } from "../../../../cursor/identity";

export const runtime = "nodejs";

/**
 * Public health — never expose balance or other paid-account details.
 * Live mode is only reported when a verified viewer is present and a key is configured.
 */
export async function GET(req: Request) {
  const keyed = hasLinerKey();
  const identity = await getIdentity(req);
  const liveEligible = keyed && identity.verified === true;

  if (!liveEligible) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      liner: { configured: keyed },
      message: keyed
        ? "예시 모드예요. 로그인된 환경에서만 라이브 호출을 씁니다."
        : "API 키가 없어 예제 모드로 동작합니다.",
    });
  }

  return NextResponse.json({
    ok: true,
    mode: "live",
    liner: { configured: true },
    message: "Liner API에 연결되었습니다.",
  });
}
