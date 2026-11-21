import { NextResponse } from "next/server";
import { creditsBalance, hasLinerKey } from "@/lib/liner";

export const runtime = "nodejs";

export async function GET() {
  const keyed = hasLinerKey();
  if (!keyed) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      liner: { configured: false },
      message: "API 키가 없어 예제 모드로 동작합니다.",
    });
  }

  const balance = await creditsBalance();
  return NextResponse.json({
    ok: true,
    mode: "live",
    liner: {
      configured: true,
      balanceOk: balance.ok,
      balanceUsd: balance.balanceUsd,
      error: balance.error,
    },
    message: balance.ok
      ? "Liner API에 연결되었습니다."
      : "키는 있지만 잔액 조회에 실패했습니다. 요청 시 오류가 날 수 있습니다.",
  });
}
